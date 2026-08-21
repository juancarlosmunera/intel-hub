// Re-verify post freshness of every configured Telegram channel.
// Usage:  node scripts/check-tg-freshness.js
//
// Reads the channel lists straight from server.js so the audit
// always reflects what the server actually scrapes.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(__dirname, "..", "server.js");

function extractChannels(src, varName) {
  const re = new RegExp(`const\\s+${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const m = src.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/handle:\s*"([^"]+)"[^}]*label:\s*"([^"]+)"/g)]
    .map(([, handle, label]) => ({ handle, label }));
}

// Same browser-grade headers the server's scraper uses — Telegram 403s
// bot-style user agents far more aggressively, especially from cloud IPs.
const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchPreview(handle) {
  return fetch(`https://t.me/s/${handle}`, {
    headers: FETCH_HEADERS,
    signal: AbortSignal.timeout(15000),
  });
}

async function probe(handle) {
  let res = await fetchPreview(handle);
  // 403/429 from a single request is often transient rate-limiting —
  // back off once before concluding the fetch layer is blocked.
  if (res.status === 403 || res.status === 429) {
    await new Promise(r => setTimeout(r, 5000));
    res = await fetchPreview(handle);
  }
  if (!res.ok) return { posts: 0, latest: null, fetchFail: `HTTP ${res.status}` };
  // Preview-disabled channels redirect /s/{handle} → /{handle} (join page, no posts)
  if (res.redirected && !new URL(res.url).pathname.startsWith("/s/")) {
    return { posts: 0, latest: null, noPreview: true };
  }
  const html = await res.text();
  const datetimes = [...html.matchAll(/<time[^>]*datetime="([^"]+)"/g)].map(m => m[1]);
  const posts = (html.match(/data-post="/g) || []).length;
  const latest = datetimes.length ? datetimes[datetimes.length - 1] : null;
  return { posts, latest };
}

(async () => {
  const src = fs.readFileSync(SERVER, "utf-8");
  const primary = extractChannels(src, "TELEGRAM_CHANNELS_PRIMARY");
  const backup  = extractChannels(src, "TELEGRAM_CHANNELS_BACKUP");
  const all = [...primary.map(c => ({ ...c, pool: "primary" })),
               ...backup.map(c => ({ ...c, pool: "backup"  }))];

  const now = Date.now();
  const rows = [];
  for (const ch of all) {
    try {
      const { posts, latest, fetchFail, noPreview } = await probe(ch.handle);
      const ageMs = latest ? now - new Date(latest).getTime() : null;
      const ageH  = ageMs != null ? Math.round(ageMs / 3600000) : null;
      rows.push({ ...ch, posts, latest, ageH, fetchFail, noPreview });
    } catch (e) {
      rows.push({ ...ch, posts: 0, latest: null, ageH: null, fetchFail: e.message });
    }
    await new Promise(r => setTimeout(r, 800));
  }

  rows.sort((a, b) => (a.ageH ?? 1e12) - (b.ageH ?? 1e12));

  const fmt = h => h == null ? "n/a" : h < 24 ? `${h}h` : `${Math.round(h/24)}d`;
  console.log("\nPool      Status   Age     Posts  Handle / Label");
  console.log("-----------------------------------------------------------------");
  for (const r of rows) {
    const status = r.noPreview   ? "NOPREV"
                 : r.fetchFail   ? "FETCHERR"
                 : r.ageH == null ? "DEAD"
                 : r.ageH < 24    ? "HOT"
                 : r.ageH < 168   ? "OK"      // < 7d
                 : r.ageH < 720   ? "STALE"   // < 30d
                                  : "DORMANT";
    console.log(
      r.pool.padEnd(9),
      status.padEnd(8),
      fmt(r.ageH).padEnd(7),
      String(r.posts).padEnd(6),
      `@${r.handle.padEnd(28)} ${r.label}${r.fetchFail ? `  (${r.fetchFail})` : ""}`
    );
  }
  console.log("\nLegend: HOT <24h · OK <7d · STALE <30d · DORMANT >30d · DEAD no-data on preview · NOPREV preview disabled · FETCHERR network/HTTP error\n");

  // A wholesale no-data result means the fetch layer failed (rate-limited or
  // blocked IP), not that every channel died at once. Say so explicitly.
  const noData = rows.filter(r => r.ageH == null).length;
  if (rows.length > 0 && noData === rows.length) {
    console.log("WARNING: ALL channels returned no data. This almost certainly means");
    console.log("Telegram is rate-limiting or blocking this machine's IP — the audit is");
    console.log("INCONCLUSIVE. Do not mark channels dead based on this run.\n");
    process.exitCode = 2;
  }
})();
