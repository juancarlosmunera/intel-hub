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

async function probe(handle) {
  const res = await fetch(`https://t.me/s/${handle}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; IntelHub/2.0)" },
  });
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
      const { posts, latest } = await probe(ch.handle);
      const ageMs = latest ? now - new Date(latest).getTime() : null;
      const ageH  = ageMs != null ? Math.round(ageMs / 3600000) : null;
      rows.push({ ...ch, posts, latest, ageH });
    } catch (e) {
      rows.push({ ...ch, posts: 0, latest: null, ageH: null, error: e.message });
    }
    await new Promise(r => setTimeout(r, 800));
  }

  rows.sort((a, b) => (a.ageH ?? 1e12) - (b.ageH ?? 1e12));

  const fmt = h => h == null ? "n/a" : h < 24 ? `${h}h` : `${Math.round(h/24)}d`;
  console.log("\nPool      Status   Age     Posts  Handle / Label");
  console.log("-----------------------------------------------------------------");
  for (const r of rows) {
    const status = r.ageH == null ? "DEAD"
                 : r.ageH < 24    ? "HOT"
                 : r.ageH < 168   ? "OK"      // < 7d
                 : r.ageH < 720   ? "STALE"   // < 30d
                                  : "DORMANT";
    console.log(
      r.pool.padEnd(9),
      status.padEnd(8),
      fmt(r.ageH).padEnd(7),
      String(r.posts).padEnd(6),
      `@${r.handle.padEnd(28)} ${r.label}`
    );
  }
  console.log("\nLegend: HOT <24h · OK <7d · STALE <30d · DORMANT >30d · DEAD no-data\n");
})();
