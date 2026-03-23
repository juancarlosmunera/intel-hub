import "dotenv/config";
import { WebSocketServer } from "ws";
import Parser from "rss-parser";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "net";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DATA_DIR = path.join(__dirname, "data");
const MAX_ARTICLES = 5000;
const RETENTION_DAYS = 90;

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; IntelHub/2.0; +https://github.com/feed-reader)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  requestOptions: { rejectUnauthorized: false },
});

// ═══════════════════════════════════════════════════════════════
// CHANNEL FEED DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const CHANNELS = {
  cyber: {
    label: "Cybersecurity",
    dbFile: "articles.json",
    feeds: [
      // Threat Intel (General)
      { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews", category: "Threat Intel" },
      { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", category: "Threat Intel" },
      { name: "Bleeping Computer", url: "https://www.bleepingcomputer.com/feed/", category: "Threat Intel" },
      { name: "Dark Reading", url: "https://www.darkreading.com/rss.xml", category: "Threat Intel" },
      { name: "SecurityWeek", url: "https://feeds.feedburner.com/securityweek", category: "Threat Intel" },
      { name: "Threatpost", url: "https://threatpost.com/feed/", category: "Threat Intel" },
      { name: "Ars Technica Security", url: "https://arstechnica.com/tag/security/feed/", category: "Threat Intel" },
      { name: "The Record", url: "https://therecord.media/feed", category: "Threat Intel" },
      { name: "Infosecurity Magazine", url: "https://www.infosecurity-magazine.com/rss/news/", category: "Threat Intel" },
      { name: "CSO Online", url: "https://www.csoonline.com/feed/", category: "Threat Intel" },
      { name: "SecurityAffairs", url: "https://securityaffairs.com/feed", category: "Threat Intel" },
      { name: "GBHackers", url: "https://gbhackers.com/feed/", category: "Threat Intel" },
      { name: "Hackread", url: "https://www.hackread.com/feed/", category: "Threat Intel" },
      { name: "Cyber Security News", url: "https://cybersecuritynews.com/feed/", category: "Threat Intel" },
      { name: "Graham Cluley", url: "https://grahamcluley.com/feed/", category: "Threat Intel" },
      { name: "Schneier on Security", url: "https://www.schneier.com/feed/", category: "Threat Intel" },
      // Advisories & Vulnerability Databases
      { name: "CISA Advisories", url: "https://www.cisa.gov/cybersecurity-advisories/all.xml", category: "Advisory" },
      { name: "NIST Cyber Insights", url: "https://www.nist.gov/blogs/cybersecurity-insights/rss.xml", category: "Advisory" },
      { name: "US-CERT Alerts", url: "https://www.us-cert.gov/ncas/alerts.xml", category: "Advisory" },
      { name: "Exploit-DB", url: "https://www.exploit-db.com/rss.xml", category: "Vulnerability" },
      // Research & Vendor Security Blogs
      { name: "Google Project Zero", url: "https://googleprojectzero.blogspot.com/feeds/posts/default?alt=rss", category: "Research" },
      { name: "Microsoft Security Blog", url: "https://www.microsoft.com/en-us/security/blog/feed/", category: "Vendor Security" },
      { name: "Unit 42 (Palo Alto)", url: "https://unit42.paloaltonetworks.com/feed/", category: "Research" },
      { name: "Cisco Talos", url: "https://blog.talosintelligence.com/rss/", category: "Research" },
      { name: "SentinelOne Blog", url: "https://www.sentinelone.com/blog/feed/", category: "Vendor Security" },
      { name: "CrowdStrike Blog", url: "https://www.crowdstrike.com/blog/feed/", category: "Vendor Security" },
      { name: "Qualys Threat Research", url: "https://blog.qualys.com/feed", category: "Research" },
      { name: "Recorded Future", url: "https://www.recordedfuture.com/feed", category: "Research" },
      { name: "Datadog Security Labs", url: "https://securitylabs.datadoghq.com/rss/feed.xml", category: "Research" },
      { name: "Sekoia Blog", url: "https://blog.sekoia.io/feed/", category: "Research" },
      { name: "WeLiveSecurity (ESET)", url: "https://www.welivesecurity.com/en/feed/", category: "Vendor Security" },
      { name: "ReversingLabs", url: "https://www.reversinglabs.com/blog/rss.xml", category: "Research" },
      // Supply Chain / Software Security
      { name: "Snyk Blog", url: "https://snyk.io/blog/feed/", category: "Supply Chain" },
      { name: "Sonatype Blog", url: "https://blog.sonatype.com/rss.xml", category: "Supply Chain" },
      { name: "GitHub Security Blog", url: "https://github.blog/tag/security/feed/", category: "Supply Chain" },
      { name: "OpenSSF Blog", url: "https://openssf.org/feed/", category: "Supply Chain" },
      { name: "Feroot Security", url: "https://www.feroot.com/feed/", category: "Supply Chain" },
      { name: "c/side Blog", url: "https://cside.dev/blog/rss.xml", category: "Supply Chain" },
      // Web App / CMS Security
      { name: "Wordfence", url: "https://www.wordfence.com/feed/", category: "Web Security" },
      { name: "Sucuri Blog", url: "https://blog.sucuri.net/feed/", category: "Web Security" },
      // PCI / Compliance / Fintech
      { name: "PCI SSC Blog", url: "https://blog.pcisecuritystandards.org/rss.xml", category: "PCI / Compliance" },
      { name: "Finextra Security", url: "https://www.finextra.com/rss/channel.aspx?m=se", category: "Fintech Security" },
      { name: "Payments Dive", url: "https://www.paymentsdive.com/feeds/news/", category: "Payments" },
      // Abuse.ch — RSS feeds deprecated, now API-only (ThreatFox API is active below)
    ],
    hasApiFeeds: true, // ThreatFox, GreyNoise, VulnCheck
  },

  world: {
    label: "World News & Geopolitics",
    dbFile: "articles_world.json",
    feeds: [
      // ══════════════════════════════════════════════════════════
      // BIAS BALANCE (general public perception):
      //   5 Lean Left · 7 Center · 5 Lean Right
      //   + 4 Geopolitics + 8 Think Tanks (4 left-leaning, 4 right-leaning)
      //   + 7 Independent (non-corporate journalists)
      //   + 2 Defense (nonpartisan trade press)
      //   Principle: center-heavy core, equal left & right wings, independent voices
      // ══════════════════════════════════════════════════════════

      // ── Center (7) ─────────────────────────────────────────
      // Reuters: Center — wire service, global standard for neutral reporting
      { name: "Reuters World", url: "https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US", category: "Wire Service" },
      // UPI: removed — RSS returns 403
      // France24: Center — French public international broadcaster
      { name: "France24", url: "https://www.france24.com/en/rss", category: "International" },
      // Nikkei Asia: Center — Asian business & markets focus
      { name: "Nikkei Asia", url: "https://news.google.com/rss/search?q=when:24h+allinurl:asia.nikkei.com&ceid=US:en&hl=en-US&gl=US", category: "International" },
      // The Hill: Center — US politics, op-eds from both sides
      { name: "The Hill", url: "https://thehill.com/feed/", category: "US Politics" },
      // NewsNation: Center — launched as explicitly unbiased alternative
      { name: "NewsNation", url: "https://www.newsnationnow.com/feed/", category: "US Politics" },
      // Wall Street Journal: Center — news section is balanced (opinion pages lean right, but RSS is news)
      { name: "Wall Street Journal", url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", category: "US Politics" },

      // ── Lean Left (5) ──────────────────────────────────────
      // AP News: Lean Left — widely used wire service, story selection skews left
      { name: "AP News World", url: "https://news.google.com/rss/search?q=when:24h+allinurl:apnews.com&ceid=US:en&hl=en-US&gl=US", category: "Wire Service" },
      // BBC: Lean Left — major international broadcaster
      { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "International" },
      // NPR: Lean Left — US public radio, strong international coverage
      { name: "NPR World", url: "https://feeds.npr.org/1004/rss.xml", category: "US News" },
      // CNN: Lean Left — most-watched left-leaning cable news
      { name: "CNN World", url: "http://rss.cnn.com/rss/edition_world.rss", category: "US News" },
      // Axios: Lean Left — short-form political/policy news
      { name: "Axios", url: "https://api.axios.com/feed/", category: "US Politics" },

      // ── Lean Right (5) ─────────────────────────────────────
      // Fox News: Right — most-watched cable news network in the US
      { name: "Fox News", url: "https://moxie.foxnews.com/google-publisher/world.xml", category: "US News" },
      // New York Post: Lean Right — major US tabloid/newspaper
      { name: "New York Post", url: "https://nypost.com/news/feed/", category: "US News" },
      // Washington Examiner: Lean Right — conservative news & analysis
      { name: "Washington Examiner", url: "https://www.washingtonexaminer.com/tag/news/feed", category: "US News" },
      // The Dispatch: Lean Right — fact-focused conservative journalism
      { name: "The Dispatch", url: "https://thedispatch.com/feed/", category: "US Politics" },
      // National Review: Right — oldest conservative publication in the US
      { name: "National Review", url: "https://www.nationalreview.com/feed/", category: "US News" },

      // ── Geopolitics & Strategy (4) ─────────────────────────
      // Foreign Affairs: Center
      { name: "Foreign Affairs", url: "https://www.foreignaffairs.com/rss.xml", category: "Geopolitics" },
      // Foreign Policy: Lean Left
      { name: "Foreign Policy", url: "https://foreignpolicy.com/feed/", category: "Geopolitics" },
      // The Diplomat: Center (Asia-Pacific focus)
      { name: "The Diplomat", url: "https://thediplomat.com/feed/", category: "Geopolitics" },
      // War on the Rocks: Center (defense/national security)
      { name: "War on the Rocks", url: "https://warontherocks.com/feed/", category: "Geopolitics" },

      // ── Think Tanks (8) — 4 left-leaning, 4 right-leaning ─
      // Left-leaning
      // RAND: Nonpartisan (some perceive slight left lean)
      { name: "RAND", url: "https://www.rand.org/blog.xml", category: "Think Tank" },
      // CSIS: Center (bipartisan)
      { name: "CSIS", url: "https://www.csis.org/rss.xml", category: "Think Tank" },
      // CFR: Lean Left (establishment/internationalist)
      { name: "Council on Foreign Relations", url: "https://www.cfr.org/feed", category: "Think Tank" },
      // Stimson: Lean Left (arms control/peace focus)
      { name: "Stimson Center", url: "https://www.stimson.org/feed/", category: "Think Tank" },
      // Right-leaning
      // Atlantic Council: Lean Right (hawkish/NATO-aligned)
      { name: "Atlantic Council", url: "https://www.atlanticcouncil.org/feed/", category: "Think Tank" },
      // Heritage Foundation: Right (conservative)
      { name: "Heritage Foundation", url: "https://www.heritage.org/rss", category: "Think Tank" },
      // Hudson Institute: Right (neoconservative)
      { name: "Hudson Institute", url: "https://www.hudson.org/rss.xml", category: "Think Tank" },
      // Cato Institute: removed — Incapsula WAF blocks RSS fetching

      // ── Independent Journalism (7) — non-corporate, no institutional affiliation ──
      { name: "Racket News (Taibbi)", url: "https://www.racket.news/feed", category: "Independent" },
      { name: "Glenn Greenwald", url: "https://greenwald.substack.com/feed", category: "Independent" },
      { name: "Chris Hedges Report", url: "https://chrishedges.substack.com/feed", category: "Independent" },
      { name: "Seymour Hersh", url: "https://seymourhersh.substack.com/feed", category: "Independent" },
      { name: "The Orf Report (Orfalea)", url: "https://mattorfalea.substack.com/feed", category: "Independent" },
      { name: "The Grayzone", url: "https://thegrayzone.com/feed/", category: "Independent" },
      { name: "Consortium News", url: "https://consortiumnews.com/feed/", category: "Independent" },

      // ── Defense & Military (2) — nonpartisan trade press ───
      // Defense One: Nonpartisan
      { name: "Defense One", url: "https://www.defenseone.com/rss/all/", category: "Defense" },
      // Breaking Defense: Nonpartisan
      { name: "Breaking Defense", url: "https://breakingdefense.com/feed/", category: "Defense" },
    ],
    hasApiFeeds: false,
  },

  osint: {
    label: "OSINT",
    dbFile: "articles_osint.json",
    feeds: [
      // ── Raw Data (pure data, no editorial) ──
      { name: "GDELT Project", url: "https://blog.gdeltproject.org/feed/", category: "Raw Data" },
      // ── OSINT Methodology ──
      { name: "IntelTechniques Blog", url: "https://inteltechniques.com/blog/feed/", category: "Methodology" },
      // ── Threat Intel (commercial vendors, no editorial bias) ──
      { name: "Recorded Future Blog", url: "https://www.recordedfuture.com/feed", category: "Threat Intel" },
      { name: "Intel471 Blog", url: "https://intel471.com/blog/feed/", category: "Threat Intel" },
      { name: "DarkReading", url: "https://www.darkreading.com/rss.xml", category: "Threat Intel" },
      { name: "Flashpoint Blog", url: "https://flashpoint.io/blog/feed/", category: "Threat Intel" },
      { name: "Kaspersky Securelist", url: "https://securelist.com/feed/", category: "Threat Intel" },
      { name: "Microsoft Threat Intel", url: "https://www.microsoft.com/en-us/security/blog/feed/", category: "Threat Intel" },
      { name: "Cisco Talos", url: "https://blog.talosintelligence.com/rss/", category: "Threat Intel" },
      { name: "CrowdStrike Blog", url: "https://www.crowdstrike.com/blog/feed/", category: "Threat Intel" },
      { name: "SentinelOne Labs", url: "https://www.sentinelone.com/labs/feed/", category: "Threat Intel" },
      { name: "Unit 42 (Palo Alto)", url: "https://unit42.paloaltonetworks.com/feed/", category: "Threat Intel" },
      { name: "The Record", url: "https://therecord.media/feed", category: "Threat Intel" },
      // ── Government Advisories ──
      { name: "CISA Alerts", url: "https://www.cisa.gov/news.xml", category: "Govt Advisory" },
      // ── OSINT Investigations & Methodology ──
      { name: "Bellingcat", url: "https://www.bellingcat.com/feed/", category: "OSINT Investigations" },
      { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", category: "Independent Cyber" },
      { name: "Schneier on Security", url: "https://www.schneier.com/feed/", category: "Independent Cyber" },
      // ── Geopolitical Intel & Conflict Monitoring ──
      { name: "Long War Journal", url: "https://www.longwarjournal.org/feed", category: "Conflict Monitor" },
      // Lawfare: removed — returns 403
      { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/", category: "Threat Intel" },
      // ── Sanctions (government primary source) ──
      { name: "OFAC Updates", url: "https://ofac.treasury.gov/rss.xml", category: "Sanctions" },
    ],
    hasApiFeeds: false,
  },

  darkweb: {
    label: "Dark Web Monitor",
    dbFile: "articles_darkweb.json",
    feeds: [
      // ── Ransomware Tracking ──
      { name: "Ransomware.live", url: "https://ransomware.live/rss.xml", category: "Ransomware" },
      { name: "RansomFeed.it", url: "https://www.ransomfeed.it/rss-complete.php", category: "Ransomware" },
      { name: "DarkFeed", url: "https://darkfeed.io/feed/", category: "Ransomware" },
      // ── Breach & Leak Journalism ──
      { name: "DataBreaches.net", url: "https://www.databreaches.net/feed/", category: "Breaches" },
      // Reddit: removed — returns 403 to server-side fetching
    ],
    hasApiFeeds: true,
  },
};

// ═══════════════════════════════════════════════════════════════
// PERSISTENCE LAYER
// ═══════════════════════════════════════════════════════════════

function loadArticleDb(dbFile) {
  const dbPath = path.join(DATA_DIR, dbFile);
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`[DB] Failed to load ${dbFile}:`, e.message);
  }
  return { articles: [], lastSaved: null };
}

function saveArticleDb(dbFile, db) {
  const dbPath = path.join(DATA_DIR, dbFile);
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(db), "utf-8");
  } catch (e) {
    console.error(`[DB] Failed to save ${dbFile}:`, e.message);
  }
}

function dedupeKey(article) {
  if (article.link) return article.link;
  return `${article.feedName}::${article.title}`;
}

function mergeArticles(existing, fresh) {
  const seen = new Map();
  for (const a of existing) seen.set(dedupeKey(a), a);
  let newCount = 0;
  for (const a of fresh) {
    const key = dedupeKey(a);
    if (!seen.has(key)) newCount++;
    seen.set(key, a);
  }
  const cutoff = Date.now() - RETENTION_DAYS * 86400000;
  const merged = Array.from(seen.values())
    .filter(a => new Date(a.pubDate).getTime() > cutoff)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, MAX_ARTICLES);
  return { merged, newCount };
}

// ═══════════════════════════════════════════════════════════════
// API-BASED THREAT INTEL FEEDS (CYBER CHANNEL ONLY)
// ═══════════════════════════════════════════════════════════════

const GREYNOISE_API_KEY = process.env.GREYNOISE_API_KEY || "";
const VULNCHECK_API_KEY = process.env.VULNCHECK_API_KEY || "";

async function fetchThreatFoxRecent() {
  try {
    const res = await fetch("https://threatfox-api.abuse.ch/api/v1/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "get_iocs", days: 1 }),
      signal: AbortSignal.timeout(15000),
    });
    const json = await res.json();
    if (json.query_status !== "ok" || !Array.isArray(json.data)) return [];
    return json.data.slice(0, 30).map(ioc => ({
      title: `[ThreatFox] ${ioc.threat_type_desc || ioc.threat_type}: ${ioc.ioc_value}`,
      link: `https://threatfox.abuse.ch/ioc/${ioc.id}/`,
      pubDate: ioc.first_seen_utc || new Date().toISOString(),
      description: `Malware: ${ioc.malware_printable || "unknown"} | Type: ${ioc.ioc_type} | Confidence: ${ioc.confidence_level}% | Tags: ${(ioc.tags || []).join(", ")}`.slice(0, 300),
      feedName: "ThreatFox IoCs",
      feedCategory: "Abuse.ch",
    }));
  } catch (e) {
    console.error("[API] ThreatFox:", e.message);
    return [];
  }
}

async function fetchGreyNoiseTrending() {
  if (!GREYNOISE_API_KEY) return [];
  try {
    const res = await fetch("https://api.greynoise.io/v3/trends/ips", {
      headers: { key: GREYNOISE_API_KEY, Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const tagsRes = await fetch("https://api.greynoise.io/v3/tags?size=20", {
        headers: { key: GREYNOISE_API_KEY, Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (!tagsRes.ok) return [];
      const tagsJson = await tagsRes.json();
      return (tagsJson.items || []).slice(0, 20).map(tag => ({
        title: `[GreyNoise] Active Tag: ${tag.name}`,
        link: `https://viz.greynoise.io/tag/${encodeURIComponent(tag.slug || tag.name)}`,
        pubDate: tag.created_at || new Date().toISOString(),
        description: `Category: ${tag.category || "unknown"} | Intention: ${tag.intention || "unknown"} | ${tag.description || ""}`.slice(0, 300),
        feedName: "GreyNoise",
        feedCategory: "Threat Intel API",
      }));
    }
    const json = await res.json();
    return (json.data || json.items || []).slice(0, 20).map(item => ({
      title: `[GreyNoise] Trending: ${item.ip || item.name || item.tag || "Activity"}`,
      link: `https://viz.greynoise.io/ip/${item.ip || ""}`,
      pubDate: item.last_seen || item.timestamp || new Date().toISOString(),
      description: `Classification: ${item.classification || "unknown"} | Noise: ${item.noise ? "Yes" : "No"} | ${item.metadata?.organization || ""}`.slice(0, 300),
      feedName: "GreyNoise",
      feedCategory: "Threat Intel API",
    }));
  } catch (e) {
    console.error("[API] GreyNoise:", e.message);
    return [];
  }
}

async function fetchVulnCheckKEV() {
  if (!VULNCHECK_API_KEY) return [];
  try {
    const res = await fetch("https://api.vulncheck.com/v3/index/nist-nvd2?lastModStartDate=" + new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0], {
      headers: { Authorization: `Bearer ${VULNCHECK_API_KEY}`, Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const kevRes = await fetch("https://api.vulncheck.com/v3/index/vulncheck-kev", {
        headers: { Authorization: `Bearer ${VULNCHECK_API_KEY}`, Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (!kevRes.ok) return [];
      const kevJson = await kevRes.json();
      return (kevJson.data || []).slice(0, 30).map(vuln => ({
        title: `[VulnCheck KEV] ${vuln.cveID || vuln.cve_id}: ${(vuln.vendorProject || vuln.vendor || "")} ${vuln.product || ""}`,
        link: `https://vulncheck.com/cve/${vuln.cveID || vuln.cve_id}`,
        pubDate: vuln.dateAdded || vuln.date_added || new Date().toISOString(),
        description: `${vuln.vulnerabilityName || vuln.description || ""} | Action: ${vuln.requiredAction || "Patch"} | Due: ${vuln.dueDate || "N/A"}`.slice(0, 300),
        feedName: "VulnCheck KEV",
        feedCategory: "Threat Intel API",
      }));
    }
    const json = await res.json();
    return (json.data || []).slice(0, 30).map(vuln => ({
      title: `[VulnCheck] ${vuln.cve?.id || "CVE"}: ${vuln.cve?.descriptions?.[0]?.value?.slice(0, 80) || "Vulnerability"}`,
      link: `https://vulncheck.com/cve/${vuln.cve?.id || ""}`,
      pubDate: vuln.cve?.lastModified || vuln.cve?.published || new Date().toISOString(),
      description: `${vuln.cve?.descriptions?.[0]?.value || ""} | CVSS: ${vuln.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || "N/A"}`.slice(0, 300),
      feedName: "VulnCheck",
      feedCategory: "Threat Intel API",
    }));
  } catch (e) {
    console.error("[API] VulnCheck:", e.message);
    return [];
  }
}

async function fetchHIBPBreaches() {
  try {
    const res = await fetch("https://haveibeenpwned.com/api/v2/breaches", {
      headers: {
        "User-Agent": "IntelHub/2.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const breaches = await res.json();
    // Only breaches added/modified in the last 30 days
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    return breaches
      .filter(b => b.AddedDate >= cutoff || b.ModifiedDate >= cutoff)
      .slice(0, 30)
      .map(b => ({
        title: `[HIBP] ${b.Name}: ${Number(b.PwnCount).toLocaleString()} accounts breached`,
        link: `https://haveibeenpwned.com/PwnedWebsites#${encodeURIComponent(b.Name)}`,
        pubDate: b.ModifiedDate || b.AddedDate || b.BreachDate,
        description: `Domain: ${b.Domain || "N/A"} | Breach date: ${b.BreachDate} | Data exposed: ${(b.DataClasses || []).join(", ")}`.slice(0, 300),
        feedName: "Have I Been Pwned",
        feedCategory: "Breaches",
      }));
  } catch (e) {
    console.error("[API] HIBP:", e.message);
    return [];
  }
}

async function fetchDarkWebApiFeeds() {
  const results = await Promise.allSettled([fetchHIBPBreaches()]);
  const items = [];
  const stats = {};
  const names = ["Have I Been Pwned"];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const name = names[i];
    if (r.status === "fulfilled" && r.value.length > 0) {
      items.push(...r.value);
      stats[name] = { count: r.value.length, status: "ok" };
    } else if (r.status === "fulfilled") {
      stats[name] = { count: 0, status: "ok" };
    } else {
      stats[name] = { count: 0, status: "error" };
    }
  }
  return { items, stats };
}

async function fetchAllApiFeeds() {
  const results = await Promise.allSettled([
    fetchThreatFoxRecent(),
    fetchGreyNoiseTrending(),
    fetchVulnCheckKEV(),
  ]);
  const items = [];
  const stats = {};
  const names = ["ThreatFox IoCs", "GreyNoise", "VulnCheck KEV"];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const name = names[i];
    if (r.status === "fulfilled" && r.value.length > 0) {
      items.push(...r.value);
      stats[name] = { count: r.value.length, status: "ok" };
    } else if (r.status === "fulfilled" && r.value.length === 0) {
      const isConfigured =
        (name === "GreyNoise" && GREYNOISE_API_KEY) ||
        (name === "VulnCheck KEV" && VULNCHECK_API_KEY) ||
        name === "ThreatFox IoCs";
      stats[name] = { count: 0, status: isConfigured ? "ok" : "disabled" };
    } else {
      stats[name] = { count: 0, status: "error" };
    }
  }
  return { items, stats };
}

// ═══════════════════════════════════════════════════════════════
// FEED FETCHING (PER CHANNEL)
// ═══════════════════════════════════════════════════════════════

function stripHtml(html) {
  return (html || "").replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

async function fetchChannelFeeds(channelId) {
  const channel = CHANNELS[channelId];
  if (!channel) return { articles: [], stats: {} };

  const stats = {};
  const freshItems = [];

  const results = await Promise.allSettled(
    channel.feeds.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, 30).map((item) => ({
          title: item.title || "",
          link: item.link || "",
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          description: stripHtml(item.contentSnippet || item.content || item.description || "").slice(0, 300),
          feedName: feed.name,
          feedCategory: feed.category,
        }));
        stats[feed.name] = { count: items.length, status: "ok" };
        return items;
      } catch (e) {
        console.error(`[FEED ERROR] ${channelId}/${feed.name}: ${e.message}`);
        stats[feed.name] = { count: 0, status: "error" };
        return [];
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") freshItems.push(...r.value);
  }

  // API feeds per channel
  if (channel.hasApiFeeds) {
    const apiResults = channelId === "darkweb"
      ? await fetchDarkWebApiFeeds()
      : await fetchAllApiFeeds();
    freshItems.push(...apiResults.items);
    Object.assign(stats, apiResults.stats);
  }

  // Merge with persisted articles
  const db = loadArticleDb(channel.dbFile);
  const existingKeys = new Set(db.articles.map(dedupeKey));
  const { merged, newCount } = mergeArticles(db.articles, freshItems);

  // Brand new articles (for email alerts)
  const brandNew = freshItems.filter(a => !existingKeys.has(dedupeKey(a)));

  // Persist
  db.articles = merged;
  db.lastSaved = new Date().toISOString();
  saveArticleDb(channel.dbFile, db);

  // Email alerts for cyber channel
  if (channelId === "cyber") {
    sendEmailAlerts(brandNew).catch(e => console.error("[EMAIL] Async error:", e.message));
  }

  const successCount = Object.values(stats).filter((s) => s.status === "ok").length;
  console.log(`[${channelId.toUpperCase()}] ${successCount}/${channel.feeds.length} feeds OK, ${freshItems.length} fresh, ${newCount} new, ${merged.length} stored`);

  return { articles: merged, stats };
}

// ═══════════════════════════════════════════════════════════════
// EMAIL ALERTING (CYBER CHANNEL)
// ═══════════════════════════════════════════════════════════════

const SEVERITY_RULES = [
  { keywords: ["data breach", "breach disclosed", "breach notification", "records exposed", "records leaked", "data leak", "data exposed", "credentials leaked", "customer data exposed", "personal data breach", "million records", "database exposed", "sensitive data exposed", "breach confirmed"], level: "BREACH" },
  { keywords: ["zero-day", "0-day", "actively exploited", "ransomware attack", "RCE", "remote code execution", "critical vulnerability exploited", "under active attack", "in the wild", "Magecart"], level: "CRITICAL" },
  { keywords: ["skimmer found", "payment fraud", "SDK hijack", "POS malware", "card fraud", "backdoor found", "backdoor discovered", "trojanized package", "trojanized update", "supply chain attack", "supply chain compromise", "malicious package", "malicious dependency"], level: "HIGH" },
  { keywords: ["CVE-2026", "CVE-2025", "CVE-2024", "SQL injection", "XSS attack", "credential stuffing attack", "formjacking attack", "actively scanning", "proof of concept", "exploit released", "patch now", "critical patch", "emergency patch"], level: "MEDIUM" },
];

const SEVERITY_RANK = { BREACH: 0, CRITICAL: 1, HIGH: 2, MEDIUM: 3, INFO: 4 };

const ADVISORY_PATTERNS = [
  "how to prevent", "how to protect", "how to avoid", "how to detect",
  "how to respond", "how to prepare", "how to mitigate", "how to reduce",
  "tips for", "tips to", "guide to", "best practices", "checklist",
  "what is a", "what are", "understanding", "explained",
  "protect against", "defend against", "prevent a", "preventing",
  "top 10", "top 5", "steps to", "ways to", "strategies for",
  "compliance", "GDPR", "CCPA", "HIPAA", "regulatory",
  "webinar", "whitepaper", "white paper", "case study", "infographic",
  "training", "awareness", "lessons learned", "takeaways from",
];

function classifySeverity(text) {
  const lower = text.toLowerCase();
  if (ADVISORY_PATTERNS.some(p => lower.includes(p))) return "INFO";
  for (const rule of SEVERITY_RULES) {
    if (rule.keywords.some(k => lower.includes(k.toLowerCase()))) return rule.level;
  }
  return "INFO";
}

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === "true";
const EMAIL_MIN_SEVERITY = process.env.EMAIL_MIN_SEVERITY || "CRITICAL";
const ALERTED_PATH = path.join(DATA_DIR, "emailed.json");

let emailTransport = null;

if (EMAIL_ENABLED) {
  emailTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  emailTransport.verify()
    .then(() => console.log("[EMAIL] SMTP connection verified"))
    .catch((e) => console.error("[EMAIL] SMTP verify failed:", e.message));
}

function loadAlertedSet() {
  try {
    if (fs.existsSync(ALERTED_PATH)) {
      return new Set(JSON.parse(fs.readFileSync(ALERTED_PATH, "utf-8")));
    }
  } catch { /* ignore */ }
  return new Set();
}

function saveAlertedSet(set) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const arr = [...set].slice(-2000);
    fs.writeFileSync(ALERTED_PATH, JSON.stringify(arr), "utf-8");
  } catch (e) {
    console.error("[EMAIL] Failed to save alerted set:", e.message);
  }
}

function buildAlertEmail(articles) {
  const rows = articles.map(a => {
    const severity = classifySeverity(`${a.title} ${a.description}`);
    const color = severity === "BREACH" ? "#e040fb" : severity === "CRITICAL" ? "#ff2d55" : severity === "HIGH" ? "#ff9500" : "#ffcc00";
    return `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #1e2a3a;">
          <span style="background:${color};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:700;">${severity}</span>
        </td>
        <td style="padding:10px;border-bottom:1px solid #1e2a3a;">
          <a href="${a.link}" style="color:#4fc3f7;text-decoration:none;font-weight:600;">${a.title}</a>
          <div style="color:#8899aa;font-size:12px;margin-top:4px;">${a.description.slice(0, 150)}${a.description.length > 150 ? "..." : ""}</div>
          <div style="color:#5a6a7e;font-size:11px;margin-top:2px;">${a.feedName} · ${a.feedCategory} · ${new Date(a.pubDate).toLocaleString()}</div>
        </td>
      </tr>`;
  }).join("");

  return `
    <div style="background:#0a0e17;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:680px;margin:0 auto;background:#0c1322;border:1px solid #1e2a3a;border-radius:8px;overflow:hidden;">
        <div style="padding:20px 24px;background:linear-gradient(135deg,#0f1724,#131d2e);border-bottom:1px solid #1e2a3a;">
          <h1 style="margin:0;color:#00ff88;font-size:18px;">⬡ Intel Hub Alert</h1>
          <p style="margin:4px 0 0;color:#4a5a6e;font-size:12px;">${articles.length} new alert${articles.length > 1 ? "s" : ""} · ${new Date().toLocaleString()}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;color:#c8cfd8;font-size:13px;">
          ${rows}
        </table>
        <div style="padding:16px 24px;color:#3a4a5e;font-size:11px;text-align:center;">
          Intel Hub — Automated alert · Min severity: ${EMAIL_MIN_SEVERITY}
        </div>
      </div>
    </div>`;
}

async function sendEmailAlerts(newArticles) {
  if (!EMAIL_ENABLED || !emailTransport || newArticles.length === 0) return;
  const alerted = loadAlertedSet();
  const minRank = SEVERITY_RANK[EMAIL_MIN_SEVERITY] ?? 0;
  const toAlert = newArticles.filter(a => {
    const key = dedupeKey(a);
    if (alerted.has(key)) return false;
    const severity = classifySeverity(`${a.title} ${a.description}`);
    return (SEVERITY_RANK[severity] ?? 3) <= minRank;
  });
  if (toAlert.length === 0) return;
  for (const a of toAlert) alerted.add(dedupeKey(a));
  saveAlertedSet(alerted);
  try {
    await emailTransport.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.EMAIL_TO,
      subject: `[Intel Hub] ${toAlert.length} new ${EMAIL_MIN_SEVERITY}+ alert${toAlert.length > 1 ? "s" : ""}`,
      html: buildAlertEmail(toAlert),
    });
    console.log(`[EMAIL] Sent ${toAlert.length} alert(s) to ${process.env.EMAIL_TO}`);
  } catch (e) {
    console.error("[EMAIL] Send failed:", e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET SERVER (MULTI-CHANNEL)
// ═══════════════════════════════════════════════════════════════

// Per-channel cache
const channelCache = {};
let wss = null;

function broadcastToChannel(channelId, data) {
  if (!wss) return;
  const msg = JSON.stringify({ type: "feed-update", channel: channelId, ...data });
  for (const client of wss.clients) {
    if (client.readyState === 1 && (client._channels || new Set()).has(channelId)) {
      client.send(msg);
    }
  }
}

function broadcastAll(channelId, data) {
  // Also send to clients that haven't subscribed (legacy compat: default to cyber)
  if (!wss) return;
  const msg = JSON.stringify({ type: "feed-update", channel: channelId, ...data });
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      const channels = client._channels || new Set(["cyber"]);
      if (channels.has(channelId)) {
        client.send(msg);
      }
    }
  }
}

async function refreshChannel(channelId) {
  console.log(`[REFRESH] ${channelId} — fetching feeds...`);
  try {
    channelCache[channelId] = await fetchChannelFeeds(channelId);
    broadcastAll(channelId, channelCache[channelId]);
  } catch (e) {
    console.error(`[REFRESH ERROR] ${channelId}:`, e.message);
    broadcastAll(channelId, { articles: [], stats: {} });
  }
}

async function refreshAllChannels() {
  // Fetch all channels in parallel
  await Promise.allSettled(
    Object.keys(CHANNELS).map(id => refreshChannel(id))
  );
}

// Pre-load persisted data into channelCache so clients get data immediately on connect
for (const [id, channel] of Object.entries(CHANNELS)) {
  const db = loadArticleDb(channel.dbFile);
  if (db.articles.length > 0) {
    channelCache[id] = { articles: db.articles, stats: {} };
    console.log(`[CACHE] Pre-loaded ${id}: ${db.articles.length} articles from disk`);
  }
}

function startServer(port) {
  const probe = createServer();
  probe.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[SERVER] Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });
  probe.listen(port, () => {
    probe.close(() => {
      wss = new WebSocketServer({ port });

      wss.on("connection", (ws) => {
        // Default subscription: cyber (backward compat)
        ws._channels = new Set(["cyber"]);
        console.log("[WS] Client connected");

        // Send cached data for default channel
        if (channelCache.cyber) {
          ws.send(JSON.stringify({ type: "feed-update", channel: "cyber", ...channelCache.cyber }));
        } else {
          ws.send(JSON.stringify({ type: "loading" }));
        }

        ws.on("message", (raw) => {
          try {
            const msg = JSON.parse(raw);

            if (msg.type === "subscribe" && CHANNELS[msg.channel]) {
              ws._channels.add(msg.channel);
              const cached = channelCache[msg.channel];
              console.log(`[WS] Client subscribed to ${msg.channel} — cache: ${cached ? cached.articles?.length + " articles" : "empty"}`);
              // Send cached data immediately
              if (cached) {
                ws.send(JSON.stringify({ type: "feed-update", channel: msg.channel, ...cached }));
              } else {
                ws.send(JSON.stringify({ type: "loading" }));
              }
            }

            if (msg.type === "refresh") {
              const ch = msg.channel || "cyber";
              if (CHANNELS[ch]) refreshChannel(ch);
            }
          } catch {
            // ignore invalid messages
          }
        });

        ws.on("close", () => console.log("[WS] Client disconnected"));
      });

      // Initial fetch for ALL channels, then periodic refresh
      refreshAllChannels();
      setInterval(refreshAllChannels, REFRESH_INTERVAL);

      const totalFeeds = Object.values(CHANNELS).reduce((sum, ch) => sum + ch.feeds.length, 0);
      console.log(`[SERVER] Intel Hub running on ws://localhost:${port}`);
      console.log(`[SERVER] ${Object.keys(CHANNELS).length} channels, ${totalFeeds} total feeds, refresh every ${REFRESH_INTERVAL / 60000}m`);
    });
  });
}

startServer(PORT);
