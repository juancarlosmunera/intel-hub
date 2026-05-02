import "dotenv/config";
import { WebSocketServer } from "ws";
import Parser from "rss-parser";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DATA_DIR = path.join(__dirname, "data");
const DIST_DIR = path.join(__dirname, "dist");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".map":  "application/json",
};
const MAX_ARTICLES = 5000; // per-channel soft cap (hard cap is memory-based)
const RETENTION_DAYS = 90; // fallback time-based retention

// ── Memory-Based Eviction ────────────────────────────────────────
// Drops oldest articles when process memory exceeds the cap.
// Checked after every refresh cycle.
const MEMORY_CAP_MB = parseInt(process.env.MEMORY_CAP_MB || "4096", 10); // default 4 GB
const MEMORY_EVICT_TARGET = 0.85; // evict down to 85% of cap
const MEMORY_CHECK_INTERVAL = 60 * 1000; // check every 60s between refreshes

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
      { name: "TechCrunch Security", url: "https://techcrunch.com/category/security/feed/", category: "Threat Intel" },
      { name: "The Tech Buzz", url: "https://www.techbuzz.ai/api/rss/articles", category: "Threat Intel" },
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
      // USNI News: US Naval Institute — carrier ops, naval strategy
      { name: "USNI News", url: "https://news.usni.org/feed", category: "Defense" },
      // The Aviationist: Military aviation & air campaigns
      { name: "The Aviationist", url: "https://theaviationist.com/feed/", category: "Defense" },
      // 19FortyFive: Defense analysis, Iran air campaign coverage
      { name: "19FortyFive", url: "https://www.19fortyfive.com/feed/", category: "Defense" },
      // Middle East Eye: Regional coverage
      { name: "Middle East Eye", url: "https://www.middleeasteye.net/rss", category: "International" },
      // SOF News: Special operations & conflict updates
      { name: "SOF News", url: "https://sof.news/feed/", category: "Defense" },
      // Alma Research Center: Daily Iran/Middle East conflict reports
      { name: "Alma Research Center", url: "https://israel-alma.org/feed/", category: "Conflict Monitor" },
    ],
    hasApiFeeds: false,
  },

  geopolitics: {
    label: "Geopolitics & Defense",
    dbFile: "articles_geopolitics.json",
    feeds: [
      // ── Geopolitics & Strategy ──
      { name: "Foreign Affairs", url: "https://www.foreignaffairs.com/rss.xml", category: "Geopolitics" },
      { name: "Foreign Policy", url: "https://foreignpolicy.com/feed/", category: "Geopolitics" },
      { name: "The Diplomat", url: "https://thediplomat.com/feed/", category: "Geopolitics" },
      { name: "War on the Rocks", url: "https://warontherocks.com/feed/", category: "Geopolitics" },
      // ── Think Tanks ──
      { name: "RAND", url: "https://www.rand.org/blog.xml", category: "Think Tank" },
      { name: "CSIS", url: "https://www.csis.org/rss.xml", category: "Think Tank" },
      { name: "Council on Foreign Relations", url: "https://www.cfr.org/feed", category: "Think Tank" },
      { name: "Stimson Center", url: "https://www.stimson.org/feed/", category: "Think Tank" },
      { name: "Atlantic Council", url: "https://www.atlanticcouncil.org/feed/", category: "Think Tank" },
      { name: "Heritage Foundation", url: "https://www.heritage.org/rss", category: "Think Tank" },
      { name: "Hudson Institute", url: "https://www.hudson.org/rss.xml", category: "Think Tank" },
      // ── Defense & Military ──
      { name: "Defense One", url: "https://www.defenseone.com/rss/all/", category: "Defense" },
      { name: "Breaking Defense", url: "https://breakingdefense.com/feed/", category: "Defense" },
      { name: "USNI News", url: "https://news.usni.org/feed", category: "Defense" },
      { name: "The Aviationist", url: "https://theaviationist.com/feed/", category: "Defense" },
      { name: "19FortyFive", url: "https://www.19fortyfive.com/feed/", category: "Defense" },
      { name: "SOF News", url: "https://sof.news/feed/", category: "Defense" },
      // ── Conflict Monitoring ──
      { name: "Middle East Eye", url: "https://www.middleeasteye.net/rss", category: "Conflict Monitor" },
      { name: "Alma Research Center", url: "https://israel-alma.org/feed/", category: "Conflict Monitor" },
      { name: "Long War Journal", url: "https://www.longwarjournal.org/feed", category: "Conflict Monitor" },
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
      { name: "Alma Research Center", url: "https://israel-alma.org/feed/", category: "Conflict Monitor" },
      { name: "SOF News", url: "https://sof.news/feed/", category: "Conflict Monitor" },
      // Lawfare: removed — returns 403
      { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/", category: "Threat Intel" },
      // ── Sanctions (government primary source) ──
      { name: "OFAC Updates", url: "https://ofac.treasury.gov/rss.xml", category: "Sanctions" },
      // ── Military / Government ──
      { name: "19FortyFive", url: "https://www.19fortyfive.com/feed/", category: "Defense" },
      { name: "USNI News", url: "https://news.usni.org/feed", category: "Defense" },
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
      { name: "The DFIR Report", url: "https://thedfirreport.com/feed/", category: "Ransomware" },
      // ── Breach & Leak Journalism ──
      { name: "DataBreaches.net", url: "https://www.databreaches.net/feed/", category: "Breaches" },
      { name: "Troy Hunt", url: "https://www.troyhunt.com/rss/", category: "Breaches" },
      { name: "CyberScoop", url: "https://cyberscoop.com/feed/", category: "Breaches" },
      // ── Underground / Threat Intel ──
      { name: "Intel 471 Blog", url: "https://intel471.com/blog/feed", category: "Underground" },
      { name: "Flashpoint", url: "https://www.flashpoint.io/feed/", category: "Underground" },
      { name: "BushidoToken", url: "https://blog.bushidotoken.net/feeds/posts/default?alt=rss", category: "Underground" },
      { name: "Check Point Research", url: "https://research.checkpoint.com/feed/", category: "Threat Intel" },
      { name: "Google Threat Intel", url: "https://cloudblog.withgoogle.com/topics/threat-intelligence/rss/", category: "Threat Intel" },
      { name: "Securelist (Kaspersky)", url: "https://securelist.com/feed/", category: "Threat Intel" },
      { name: "Huntress Blog", url: "https://www.huntress.com/blog/rss.xml", category: "Threat Intel" },
      { name: "Elastic Security Labs", url: "https://www.elastic.co/security-labs/rss/feed.xml", category: "Threat Intel" },
      // ── Malware & Botnet Tracking ──
      { name: "ANY.RUN Blog", url: "https://any.run/cybersecurity-blog/feed/", category: "Malware" },
      { name: "Malwarebytes Blog", url: "https://www.malwarebytes.com/blog/feed", category: "Malware" },
      { name: "Sophos Blog", url: "https://www.sophos.com/en-us/blog/feed", category: "Malware" },
      // ── Exploitation in the Wild ──
      { name: "SANS ISC", url: "https://isc.sans.edu/rssfeed.xml", category: "Exploitation" },
      { name: "Rapid7 Blog", url: "https://www.rapid7.com/blog/rss/", category: "Exploitation" },
      { name: "UK NCSC Reports", url: "https://www.ncsc.gov.uk/api/1/services/v1/report-rss-feed.xml", category: "Government" },
    ],
    hasApiFeeds: true,
  },

  social: {
    label: "Social Media",
    dbFile: "articles_social.json",
    feeds: [
      // Reddit: fetched via JSON API in fetchSocialApiFeeds() — no RSS feeds needed
      // X (Twitter): RSS bridges are dead (API lockdown). Set TWITTER_BEARER_TOKEN to enable.
    ],
    hasApiFeeds: true, // Reddit JSON (always) + optional Twitter API
  },

  chatfeeds: {
    label: "Chat Feeds",
    dbFile: "articles_chatfeeds.json",
    feeds: [
      // Telegram: fetched via public preview scraper in fetchChatFeedsApiFeeds()
    ],
    hasApiFeeds: true, // Telegram public scraper (always) + optional Bot API
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

// ── Reddit JSON API (no key required) ──────────────────────────

const REDDIT_SUBS = ["netsec", "cybersecurity", "malware", "darknet", "privacy", "ReverseEngineering", "AskNetsec", "blueteamsec", "computerforensics", "OSINT"];

async function fetchRedditSubreddit(sub) {
  const res = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=25`, {
    headers: { "User-Agent": "IntelHub/2.0 (cybersec monitoring dashboard)" },
  });
  if (!res.ok) throw new Error(`Reddit r/${sub}: ${res.status}`);
  const json = await res.json();
  return (json.data?.children || []).map(({ data: p }) => ({
    title: p.title || "",
    link: p.url && !p.url.includes("reddit.com") ? p.url : `https://www.reddit.com${p.permalink}`,
    pubDate: p.created_utc ? new Date(p.created_utc * 1000).toISOString() : new Date().toISOString(),
    description: (p.selftext || "").slice(0, 300),
    feedName: `r/${sub}`,
    feedCategory: "Reddit",
  }));
}

// ── Twitter API v2 (optional, needs TWITTER_BEARER_TOKEN) ──────

const TWITTER_BEARER = process.env.TWITTER_BEARER_TOKEN || "";

async function fetchTwitterSearch() {
  if (!TWITTER_BEARER) return [];
  try {
    const query = encodeURIComponent("(#infosec OR #threatintel OR #ransomware OR #databreach OR #malware OR #0day) -is:retweet lang:en");
    const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=25&tweet.fields=created_at,author_id,text`, {
      headers: { Authorization: `Bearer ${TWITTER_BEARER}` },
    });
    if (!res.ok) throw new Error(`Twitter API: ${res.status}`);
    const json = await res.json();
    return (json.data || []).map(t => ({
      title: t.text.slice(0, 120),
      link: `https://twitter.com/i/web/status/${t.id}`,
      pubDate: t.created_at || new Date().toISOString(),
      description: t.text.slice(0, 300),
      feedName: "X: Search",
      feedCategory: "X (Twitter)",
    }));
  } catch (e) {
    console.error("[API] Twitter:", e.message);
    return [];
  }
}

// ── Telegram Bot API (optional, needs TELEGRAM_BOT_TOKEN) ──────

const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || "";

// Primary channels — actively monitored
const TELEGRAM_CHANNELS_PRIMARY = [
  // Threat Intel & Malware
  { handle: "vxunderground", category: "Threat Intel", label: "vx-underground" },
  { handle: "malware_traffic", category: "Threat Intel", label: "Malware Traffic Analysis" },
  { handle: "thedfirreport", category: "Threat Intel", label: "The DFIR Report" },
  { handle: "infostealers", category: "Threat Intel", label: "Infostealers" },
  // Ransomware & Leak Tracking
  { handle: "DarkfeedNews", category: "Ransomware", label: "DARKFEED" },
  { handle: "RansomFeedNews", category: "Ransomware", label: "RansomFeed News" },
  { handle: "ransomlook", category: "Ransomware", label: "RansomLook" },
  { handle: "DataBreaches", category: "Dark Web", label: "DataBreaches.net" },
  { handle: "RedPacketSecurity", category: "Dark Web", label: "Red Packet Security" },
  { handle: "leakix", category: "Dark Web", label: "LeakIX" },
  // Cybersec News
  { handle: "thehackernews", category: "Cyber News", label: "The Hacker News" },
  { handle: "cybersecuritynews", category: "Cyber News", label: "Cyber Security News" },
  { handle: "cybersecurityalerts", category: "Cyber News", label: "Cybersecurity Alerts" },
  { handle: "Doomscroll", category: "Cyber News", label: "Doomscroll" },
  // OSINT
  { handle: "OsintTv", category: "OSINT", label: "OsintTV" },
  { handle: "cyber_detective", category: "OSINT", label: "Cyber Detective" },
  { handle: "bellingcat", category: "OSINT", label: "Bellingcat" },
  { handle: "True_OSINT", category: "OSINT", label: "True OSINT" },
  { handle: "osinttechniques", category: "OSINT", label: "OSINT Techniques" },
  // Geopolitics
  { handle: "intelslava", category: "Geopolitics", label: "Intel Slava" },
  { handle: "breakingdefense", category: "Geopolitics", label: "Breaking Defense" },
  // Bug Bounty & Vuln Disclosure
  { handle: "thebugbountyhunter", category: "Bug Bounty", label: "Bug Bounty Hunter" },
  { handle: "bug_bounty_channel", category: "Bug Bounty", label: "Bug Bounty Channel" },
];

// Backup pool — rotated in when primary channels go stale/dead
const TELEGRAM_CHANNELS_BACKUP = [
  { handle: "true_secator", category: "Threat Intel", label: "SecAtor (RU)" },
  { handle: "secnewsru", category: "Cyber News", label: "Security News (RU)" },
  { handle: "f6_cybersecurity", category: "Threat Intel", label: "F6 Cybersecurity" },
  { handle: "cloudandcybersecurity", category: "Cyber News", label: "Cloud & Cybersecurity" },
  { handle: "topcybersecurity", category: "Cyber News", label: "Top Cybersecurity" },
  { handle: "teammatrixs", category: "Cyber News", label: "Learn Cybersecurity" },
];

// Channel health tracking — persisted to disk
const TG_HEALTH_FILE = path.join(DATA_DIR, "telegram_health.json");

function loadTelegramHealth() {
  try {
    return JSON.parse(fs.readFileSync(TG_HEALTH_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveTelegramHealth(health) {
  fs.writeFileSync(TG_HEALTH_FILE, JSON.stringify(health, null, 2));
}

// Active channel list — starts with primary, rotates as needed
let TELEGRAM_ACTIVE = [...TELEGRAM_CHANNELS_PRIMARY];

function initTelegramActiveList() {
  const health = loadTelegramHealth();
  const now = Date.now();
  const staleMs = 7 * 24 * 60 * 60 * 1000; // 7 days without success = stale

  // Restore any previously disabled channels that might be back
  // and filter out channels marked dead
  const active = [];
  const deadHandles = new Set();

  for (const ch of TELEGRAM_CHANNELS_PRIMARY) {
    const h = health[ch.handle];
    if (h && h.status === "dead" && (now - h.lastCheck) < staleMs) {
      deadHandles.add(ch.handle);
      console.log(`[TG-HEALTH] ${ch.label} (@${ch.handle}) — skipped (dead since ${new Date(h.deadSince).toISOString().slice(0, 10)})`);
    } else {
      active.push(ch);
    }
  }

  // Fill gaps from backup pool
  const needed = TELEGRAM_CHANNELS_PRIMARY.length - active.length;
  if (needed > 0) {
    const available = TELEGRAM_CHANNELS_BACKUP.filter(b => !deadHandles.has(b.handle));
    const replacements = available.slice(0, needed);
    active.push(...replacements);
    for (const r of replacements) {
      console.log(`[TG-HEALTH] Rotated in backup: ${r.label} (@${r.handle})`);
    }
  }

  TELEGRAM_ACTIVE = active;
}

// Check if a Telegram channel is reachable via public preview
async function checkTelegramChannelHealth(handle) {
  try {
    const res = await fetch(`https://t.me/s/${handle}`, {
      headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { alive: false, reason: `HTTP ${res.status}` };
    const html = await res.text();
    // Check for "channel not found" or empty channel indicators
    if (html.includes("tgme_channel_info_counter") || html.includes("tgme_widget_message")) {
      return { alive: true };
    }
    if (html.includes("not found") || html.includes("Page not found")) {
      return { alive: false, reason: "channel not found" };
    }
    return { alive: true }; // assume alive if page loaded
  } catch (e) {
    return { alive: false, reason: e.message };
  }
}

// Scheduled health check — runs every 6 hours
const TG_HEALTH_INTERVAL = 6 * 60 * 60 * 1000;
const TG_CONSECUTIVE_FAILS_BEFORE_DEAD = 4; // 4 checks × 6h = 24h of failures

async function runTelegramHealthCheck() {
  if (!TELEGRAM_BOT) return;
  console.log("[TG-HEALTH] Running channel health check...");
  const health = loadTelegramHealth();
  const now = Date.now();
  let changes = false;

  // Check all primary channels
  for (const ch of TELEGRAM_CHANNELS_PRIMARY) {
    const result = await checkTelegramChannelHealth(ch.handle);
    const prev = health[ch.handle] || { consecutiveFails: 0, status: "unknown" };

    if (result.alive) {
      health[ch.handle] = {
        status: "alive",
        lastSuccess: now,
        lastCheck: now,
        consecutiveFails: 0,
      };
      if (prev.status === "dead") {
        console.log(`[TG-HEALTH] [OK] ${ch.label} (@${ch.handle}) — RECOVERED`);
        changes = true;
      }
    } else {
      const fails = (prev.consecutiveFails || 0) + 1;
      health[ch.handle] = {
        ...prev,
        status: fails >= TG_CONSECUTIVE_FAILS_BEFORE_DEAD ? "dead" : "failing",
        lastCheck: now,
        lastFailReason: result.reason,
        consecutiveFails: fails,
        deadSince: fails >= TG_CONSECUTIVE_FAILS_BEFORE_DEAD ? (prev.deadSince || now) : undefined,
      };
      if (fails >= TG_CONSECUTIVE_FAILS_BEFORE_DEAD && prev.status !== "dead") {
        console.log(`[TG-HEALTH] [DEAD] ${ch.label} (@${ch.handle}) — MARKED DEAD (${result.reason})`);
        changes = true;
      } else if (fails < TG_CONSECUTIVE_FAILS_BEFORE_DEAD) {
        console.log(`[TG-HEALTH] [WARN] ${ch.label} (@${ch.handle}) — failing (${fails}/${TG_CONSECUTIVE_FAILS_BEFORE_DEAD}, ${result.reason})`);
      }
    }

    // Rate limit: small delay between checks to avoid being blocked
    await new Promise(r => setTimeout(r, 2000));
  }

  // Also check backup channels periodically
  for (const ch of TELEGRAM_CHANNELS_BACKUP) {
    const result = await checkTelegramChannelHealth(ch.handle);
    health[ch.handle] = {
      status: result.alive ? "alive" : "dead",
      lastCheck: now,
      lastFailReason: result.alive ? undefined : result.reason,
    };
    await new Promise(r => setTimeout(r, 2000));
  }

  saveTelegramHealth(health);

  if (changes) {
    console.log("[TG-HEALTH] Channel list changed — rebuilding active list");
    initTelegramActiveList();
  }

  // Log summary
  const alive = Object.entries(health).filter(([, v]) => v.status === "alive").length;
  const dead = Object.entries(health).filter(([, v]) => v.status === "dead").length;
  const failing = Object.entries(health).filter(([, v]) => v.status === "failing").length;
  console.log(`[TG-HEALTH] Summary: ${alive} alive, ${failing} failing, ${dead} dead — ${TELEGRAM_ACTIVE.length} active channels`);
}

// Build the active channel list from env override or defaults
(() => {
  const envOverride = (process.env.TELEGRAM_CHANNELS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (envOverride.length > 0) {
    TELEGRAM_ACTIVE = envOverride.map(h => ({ handle: h, category: "Telegram", label: h }));
  } else {
    initTelegramActiveList();
  }
})();

// Scrape public preview page — works for any public channel, no token needed
function stripTgHtml(raw) {
  return raw
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchTelegramPublicPreview(channelName) {
  const meta = TELEGRAM_ACTIVE.find(ch => ch.handle === channelName);
  const label = meta ? meta.label : channelName;
  const category = meta ? meta.category : "Telegram";
  try {
    const res = await fetch(`https://t.me/s/${channelName}`, {
      headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Extract all data-post IDs
    const postIds = [...html.matchAll(/data-post="([^"]+)"/g)].map(m => m[1]);
    // Extract all message text blocks
    const texts = [...html.matchAll(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g)].map(m => stripTgHtml(m[1]));
    // Extract all timestamps
    const times = [...html.matchAll(/<time[^>]*datetime="([^"]+)"/g)].map(m => m[1]);

    // Zip them together — texts may be more than postIds (some msgs have nested divs)
    // Use postIds as the anchor since they're unique per message
    const items = [];
    for (let i = 0; i < postIds.length; i++) {
      const text = texts[i] || "";
      if (!text) continue;
      const pubDate = times[i] || new Date().toISOString();

      items.push({
        title: text.slice(0, 120),
        link: `https://t.me/${postIds[i]}`,
        pubDate,
        description: text.slice(0, 500),
        feedName: `TG: ${label}`,
        feedCategory: "Telegram",
      });
    }

    return items;
  } catch (e) {
    console.error(`[API] Telegram ${label}:`, e.message);
    return [];
  }
}

// Bot API fetcher — only works for channels where bot is admin
async function fetchTelegramBotAPI(channelName) {
  if (!TELEGRAM_BOT) return [];
  const meta = TELEGRAM_ACTIVE.find(ch => ch.handle === channelName);
  const label = meta ? meta.label : channelName;
  const category = meta ? meta.category : "Telegram";
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/getUpdates?allowed_updates=["channel_post"]&limit=25`);
    if (!res.ok) throw new Error(`Telegram: ${res.status}`);
    const json = await res.json();
    return (json.result || [])
      .filter(u => u.channel_post?.chat?.username?.toLowerCase() === channelName.toLowerCase())
      .map(u => ({
        title: (u.channel_post.text || "").slice(0, 120),
        link: `https://t.me/${channelName}/${u.channel_post.message_id}`,
        pubDate: new Date(u.channel_post.date * 1000).toISOString(),
        description: (u.channel_post.text || "").slice(0, 300),
        feedName: `TG: ${label}`,
        feedCategory: "Telegram",
      }));
  } catch (e) {
    console.error(`[API] Telegram ${label} (Bot API):`, e.message);
    return [];
  }
}

// Main Telegram fetcher — uses public scraper by default, Bot API as supplement
async function fetchTelegramChannelHistory(channelName) {
  // Always try public preview scraper (works for all public channels)
  const publicPosts = await fetchTelegramPublicPreview(channelName);

  // If Bot API is configured, merge any additional posts from owned channels
  if (TELEGRAM_BOT) {
    const botPosts = await fetchTelegramBotAPI(channelName);
    if (botPosts.length > 0) {
      const existingLinks = new Set(publicPosts.map(p => p.link));
      for (const p of botPosts) {
        if (!existingLinks.has(p.link)) publicPosts.push(p);
      }
    }
  }

  return publicPosts;
}

// ── Mastodon / Fediverse (no key, open API) ────────────────────

const MASTODON_ACCOUNTS = [
  { instance: "infosec.exchange", account: "jerry", display: "Jerry Bell" },
  { instance: "infosec.exchange", account: "briankrebs", display: "Brian Krebs" },
  { instance: "infosec.exchange", account: "BleepingComputer", display: "BleepingComputer" },
  { instance: "infosec.exchange", account: "malwaretech", display: "MalwareTech" },
];

async function fetchMastodonTimeline(instance, account) {
  try {
    // Look up account ID
    const lookup = await fetch(`https://${instance}/api/v1/accounts/lookup?acct=${account}`);
    if (!lookup.ok) throw new Error(`Lookup ${instance}/@${account}: ${lookup.status}`);
    const acct = await lookup.json();

    // Fetch recent toots
    const res = await fetch(`https://${instance}/api/v1/accounts/${acct.id}/statuses?limit=15&exclude_replies=true&exclude_reblogs=true`);
    if (!res.ok) throw new Error(`Statuses: ${res.status}`);
    const toots = await res.json();
    return toots.map(t => ({
      title: stripHtml(t.content || "").slice(0, 120),
      link: t.url || `https://${instance}/@${account}/${t.id}`,
      pubDate: t.created_at || new Date().toISOString(),
      description: stripHtml(t.content || "").slice(0, 300),
      feedName: `Mastodon: ${account}`,
      feedCategory: "Mastodon",
    }));
  } catch (e) {
    console.error(`[API] Mastodon ${instance}/@${account}:`, e.message);
    return [];
  }
}

// ── GitHub Security Events (no key, public API) ────────────────

async function fetchGitHubSecurityEvents() {
  try {
    // Fetch recent security advisories from GitHub
    const res = await fetch("https://api.github.com/advisories?per_page=20&type=reviewed", {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "IntelHub/2.0" },
    });
    if (!res.ok) throw new Error(`GitHub Advisories: ${res.status}`);
    const advisories = await res.json();
    return advisories.map(a => ({
      title: `[${(a.severity || "").toUpperCase()}] ${a.summary || a.cve_id || "Advisory"}`,
      link: a.html_url || "",
      pubDate: a.published_at || a.updated_at || new Date().toISOString(),
      description: `${a.cve_id || ""} | ${a.description?.slice(0, 250) || ""} | CVSS: ${a.cvss?.score || "N/A"}`,
      feedName: "GitHub Advisories",
      feedCategory: "GitHub",
    }));
  } catch (e) {
    console.error("[API] GitHub Advisories:", e.message);
    return [];
  }
}

// ── NVD / National Vulnerability Database (no key, rate-limited) ─

async function fetchNVDRecent() {
  try {
    const fmt = d => d.toISOString().replace(/\.\d+Z$/, ".000");
    const since = fmt(new Date(Date.now() - 3 * 86400000));
    const until = fmt(new Date());
    const res = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${since}&pubEndDate=${until}&resultsPerPage=25&cvssV3Severity=HIGH`, {
      headers: { "User-Agent": "IntelHub/2.0" },
    });
    if (!res.ok) throw new Error(`NVD: ${res.status}`);
    const json = await res.json();
    return (json.vulnerabilities || []).map(v => {
      const cve = v.cve || {};
      const desc = cve.descriptions?.find(d => d.lang === "en")?.value || "";
      const cvss = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore
        || cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore || "N/A";
      return {
        title: `[NVD] ${cve.id}: ${desc.slice(0, 80)}`,
        link: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
        pubDate: cve.published || new Date().toISOString(),
        description: `CVSS: ${cvss} | ${desc.slice(0, 250)}`,
        feedName: "NVD (NIST)",
        feedCategory: "Vulnerability",
      };
    });
  } catch (e) {
    console.error("[API] NVD:", e.message);
    return [];
  }
}

// ── Social Media API feeds orchestrator ────────────────────────

async function fetchSocialApiFeeds() {
  const items = [];
  const stats = {};

  // Reddit (always active, no key needed)
  const redditResults = await Promise.allSettled(
    REDDIT_SUBS.map(sub => fetchRedditSubreddit(sub))
  );
  for (let i = 0; i < redditResults.length; i++) {
    const name = `r/${REDDIT_SUBS[i]}`;
    const r = redditResults[i];
    if (r.status === "fulfilled" && r.value.length > 0) {
      items.push(...r.value);
      stats[name] = { count: r.value.length, status: "ok" };
    } else if (r.status === "fulfilled") {
      stats[name] = { count: 0, status: "ok" };
    } else {
      console.error(`[API] Reddit ${name}:`, r.reason?.message);
      stats[name] = { count: 0, status: "error" };
    }
  }

  // Twitter API (optional)
  if (TWITTER_BEARER) {
    try {
      const tweets = await fetchTwitterSearch();
      items.push(...tweets);
      stats["X: Search"] = { count: tweets.length, status: "ok" };
    } catch (e) {
      stats["X: Search"] = { count: 0, status: "error" };
    }
  }

  // Mastodon (always active, no key needed)
  const mastodonResults = await Promise.allSettled(
    MASTODON_ACCOUNTS.map(a => fetchMastodonTimeline(a.instance, a.account))
  );
  for (let i = 0; i < mastodonResults.length; i++) {
    const name = `Mastodon: ${MASTODON_ACCOUNTS[i].account}`;
    const r = mastodonResults[i];
    if (r.status === "fulfilled" && r.value.length > 0) {
      items.push(...r.value);
      stats[name] = { count: r.value.length, status: "ok" };
    } else if (r.status === "fulfilled") {
      stats[name] = { count: 0, status: "ok" };
    } else {
      console.error(`[API] ${name}:`, r.reason?.message);
      stats[name] = { count: 0, status: "error" };
    }
  }

  // GitHub Security Advisories (always active, no key needed)
  try {
    const ghAdvisories = await fetchGitHubSecurityEvents();
    items.push(...ghAdvisories);
    stats["GitHub Advisories"] = { count: ghAdvisories.length, status: "ok" };
  } catch (e) {
    console.error("[API] GitHub Advisories:", e.message);
    stats["GitHub Advisories"] = { count: 0, status: "error" };
  }

  // NVD / National Vulnerability Database (always active, no key needed)
  try {
    const nvdCves = await fetchNVDRecent();
    items.push(...nvdCves);
    stats["NVD (NIST)"] = { count: nvdCves.length, status: "ok" };
  } catch (e) {
    console.error("[API] NVD:", e.message);
    stats["NVD (NIST)"] = { count: 0, status: "error" };
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

async function fetchChatFeedsApiFeeds() {
  const items = [];
  const stats = {};

  // Telegram (always active — public preview scraper, no token needed)
  if (TELEGRAM_ACTIVE.length > 0) {
    const tgResults = await Promise.allSettled(
      TELEGRAM_ACTIVE.map(ch => fetchTelegramChannelHistory(ch.handle))
    );
    for (let i = 0; i < tgResults.length; i++) {
      const ch = TELEGRAM_ACTIVE[i];
      const r = tgResults[i];
      if (r.status === "fulfilled" && r.value.length > 0) {
        items.push(...r.value);
        stats[`TG: ${ch.label}`] = { count: r.value.length, status: "ok" };
      } else if (r.status === "fulfilled") {
        stats[`TG: ${ch.label}`] = { count: 0, status: "ok" };
      } else {
        console.error(`[API] Telegram ${ch.label}:`, r.reason?.message);
        stats[`TG: ${ch.label}`] = { count: 0, status: "error" };
      }
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
      : channelId === "social"
      ? await fetchSocialApiFeeds()
      : channelId === "chatfeeds"
      ? await fetchChatFeedsApiFeeds()
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
  // Check memory after every refresh cycle
  checkMemoryAndEvict();
}

// ── Memory Monitor, Compaction & Eviction ──────────────────────
function getMemoryUsageMB() {
  return process.memoryUsage().rss / (1024 * 1024);
}

// Tiered compaction — trim article data based on age
// Tier 1: 0-30 min  → full fidelity
// Tier 2: 30 min-6h → description trimmed to 100 chars
// Tier 3: 6h+       → description trimmed to 50 chars, extra fields stripped
const COMPACT_TIER2_MS = 30 * 60 * 1000;       // 30 minutes
const COMPACT_TIER3_MS = 6 * 60 * 60 * 1000;   // 6 hours

function compactArticles(articles) {
  const now = Date.now();
  let tier2 = 0;
  let tier3 = 0;

  for (const a of articles) {
    const age = now - new Date(a.pubDate).getTime();

    if (age > COMPACT_TIER3_MS) {
      // Tier 3: aggressive trim
      if (a.description && a.description.length > 50) {
        a.description = a.description.slice(0, 50) + "...";
        tier3++;
      }
      // Strip non-essential fields that may have been attached
      delete a.matchedKeywords;
      delete a.redFlags;
      delete a.fullText;
    } else if (age > COMPACT_TIER2_MS) {
      // Tier 2: moderate trim
      if (a.description && a.description.length > 100) {
        a.description = a.description.slice(0, 100) + "...";
        tier2++;
      }
    }
    // Tier 1: no changes
  }

  return { tier2, tier3 };
}

function runCompaction() {
  const channelIds = Object.keys(CHANNELS);
  let totalTier2 = 0;
  let totalTier3 = 0;

  for (const id of channelIds) {
    const cache = channelCache[id];
    if (!cache?.articles || cache.articles.length === 0) continue;

    const { tier2, tier3 } = compactArticles(cache.articles);
    totalTier2 += tier2;
    totalTier3 += tier3;

    // Persist compacted data
    if (tier2 + tier3 > 0) {
      saveArticleDb(CHANNELS[id].dbFile, { articles: cache.articles });
    }
  }

  if (totalTier2 + totalTier3 > 0) {
    console.log(`[COMPACT] Trimmed ${totalTier2} articles to 100ch, ${totalTier3} articles to 50ch`);
  }
}

function checkMemoryAndEvict() {
  const usedMB = getMemoryUsageMB();

  // Step 1: Try compaction first (cheaper than eviction)
  if (usedMB >= MEMORY_CAP_MB * 0.75) {
    runCompaction();
    if (global.gc) global.gc();
    if (getMemoryUsageMB() < MEMORY_CAP_MB) return;
  }

  if (usedMB < MEMORY_CAP_MB) return;

  // Step 2: Evict oldest articles if compaction wasn't enough
  const targetMB = MEMORY_CAP_MB * MEMORY_EVICT_TARGET;
  console.log(`[MEMORY] ${usedMB.toFixed(0)} MB used (cap: ${MEMORY_CAP_MB} MB) — evicting oldest articles...`);

  const channelIds = Object.keys(CHANNELS);
  let totalBefore = 0;
  for (const id of channelIds) {
    totalBefore += (channelCache[id]?.articles?.length || 0);
  }

  let rounds = 0;
  while (getMemoryUsageMB() > targetMB && rounds < 10) {
    rounds++;
    for (const id of channelIds) {
      const cache = channelCache[id];
      if (!cache?.articles || cache.articles.length <= 50) continue;

      const dropCount = Math.max(1, Math.floor(cache.articles.length * 0.2));
      cache.articles = cache.articles.slice(0, cache.articles.length - dropCount);
      saveArticleDb(CHANNELS[id].dbFile, { articles: cache.articles });
    }
    if (global.gc) global.gc();
  }

  let totalAfter = 0;
  for (const id of channelIds) {
    totalAfter += (channelCache[id]?.articles?.length || 0);
  }

  const afterMB = getMemoryUsageMB();
  console.log(`[MEMORY] Evicted ${totalBefore - totalAfter} articles in ${rounds} round(s) — ${afterMB.toFixed(0)} MB used, ${totalAfter} articles remaining`);
}

// Periodic memory check + compaction between refresh cycles
setInterval(() => {
  const usedMB = getMemoryUsageMB();
  if (usedMB >= MEMORY_CAP_MB) {
    checkMemoryAndEvict();
  } else if (usedMB >= MEMORY_CAP_MB * 0.5) {
    // Run compaction proactively at 50% memory to prevent spikes
    runCompaction();
  }
}, MEMORY_CHECK_INTERVAL);

// Pre-load persisted data into channelCache so clients get data immediately on connect
for (const [id, channel] of Object.entries(CHANNELS)) {
  const db = loadArticleDb(channel.dbFile);
  if (db.articles.length > 0) {
    channelCache[id] = { articles: db.articles, stats: {} };
    console.log(`[CACHE] Pre-loaded ${id}: ${db.articles.length} articles from disk`);
  }
}

// ═══════════════════════════════════════════════════════════════
// INGEST API — Universal webhook endpoint for any chat platform
// ═══════════════════════════════════════════════════════════════
//
// POST /api/ingest — accepts messages from any source
// Body: { source, group, message, timestamp, channel, url }
//
// POST /api/ingest/batch — accepts an array of messages
// Body: [{ source, group, message, timestamp, channel, url }, ...]
//
// Auth: requires INGEST_API_KEY in .env (if set)

const INGEST_API_KEY = process.env.INGEST_API_KEY || "";

function handleIngestRequest(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // Auth check
  if (INGEST_API_KEY) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== INGEST_API_KEY) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid or missing API key" }));
      return;
    }
  }

  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      const messages = Array.isArray(data) ? data : [data];
      const ingested = [];

      for (const msg of messages) {
        if (!msg.message && !msg.title) {
          continue; // skip empty messages
        }

        const text = msg.message || msg.title || "";
        const source = msg.source || "unknown";
        const group = msg.group || "";
        const targetChannel = msg.channel || "chatfeeds";

        // Validate target channel exists
        if (!CHANNELS[targetChannel]) {
          continue;
        }

        const article = {
          title: text.slice(0, 120),
          link: msg.url || msg.link || "",
          pubDate: msg.timestamp || new Date().toISOString(),
          description: text.slice(0, 500),
          feedName: group ? `${source}: ${group}` : source,
          feedCategory: source,
        };

        // Merge into channel cache and persist
        const channel = CHANNELS[targetChannel];
        const db = loadArticleDb(channel.dbFile);
        const key = dedupeKey(article);
        const exists = db.articles.some(a => dedupeKey(a) === key);

        if (!exists) {
          db.articles.unshift(article);
          if (db.articles.length > MAX_ARTICLES) {
            db.articles = db.articles.slice(0, MAX_ARTICLES);
          }
          saveArticleDb(channel.dbFile, db);

          // Update live cache and broadcast to connected clients
          if (!channelCache[targetChannel]) {
            channelCache[targetChannel] = { articles: [], stats: {} };
          }
          channelCache[targetChannel].articles.unshift(article);
          broadcastAll(targetChannel, channelCache[targetChannel]);

          ingested.push(article.title);
        }
      }

      console.log(`[INGEST] Received ${messages.length} message(s), ingested ${ingested.length} new`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, received: messages.length, ingested: ingested.length }));
    } catch (e) {
      console.error("[INGEST] Parse error:", e.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
    }
  });
}

function handleApiRequest(req, res) {
  const url = req.url?.split("?")[0];

  if (url === "/api/ingest" || url === "/api/ingest/batch") {
    return handleIngestRequest(req, res);
  }

  if (url === "/api/health") {
    const mem = getMemoryUsageMB();
    const totalArticles = Object.values(channelCache).reduce((sum, c) => sum + (c?.articles?.length || 0), 0);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      uptime: process.uptime(),
      memory_mb: Math.round(mem),
      memory_cap_mb: MEMORY_CAP_MB,
      channels: Object.keys(CHANNELS).length,
      total_articles: totalArticles,
      telegram_active: TELEGRAM_ACTIVE.length,
    }));
    return;
  }

  if (url === "/api/channels") {
    const summary = {};
    for (const [id, ch] of Object.entries(CHANNELS)) {
      summary[id] = {
        label: ch.label,
        feeds: ch.feeds.length,
        articles: channelCache[id]?.articles?.length || 0,
      };
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(summary));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.normalize(path.join(DIST_DIR, urlPath));

  // Prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback — serve index.html for client-side routes
      fs.readFile(path.join(DIST_DIR, "index.html"), (err2, indexData) => {
        if (err2) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Frontend not built. Run: npm run build");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(indexData);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}

function startServer(port) {
  const distExists = fs.existsSync(DIST_DIR);
  if (distExists) {
    console.log(`[SERVER] Serving frontend from ${DIST_DIR}`);
  } else {
    console.log(`[SERVER] No dist/ found — frontend not built (run 'npm run build')`);
  }

  const httpServer = createServer((req, res) => {
    if (req.url?.startsWith("/api/")) {
      return handleApiRequest(req, res);
    }
    if (distExists) {
      return serveStatic(req, res);
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Intel Hub running. WebSocket on this port, API at /api/*");
  });

  httpServer.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[SERVER] Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });

  httpServer.listen(port, () => {
    // Attach WebSocket server to the HTTP server
    wss = new WebSocketServer({ server: httpServer });

    wss.on("connection", (ws) => {
      ws._channels = new Set();
      console.log("[WS] Client connected — awaiting subscribe");

      ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw);

          if (msg.type === "subscribe" && CHANNELS[msg.channel]) {
            ws._channels.add(msg.channel);
            const cached = channelCache[msg.channel];
            console.log(`[WS] Client subscribed to ${msg.channel} — cache: ${cached ? cached.articles?.length + " articles" : "empty"}`);
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

    // Telegram channel health check — every 6 hours
    if (TELEGRAM_ACTIVE.length > 0) {
      runTelegramHealthCheck();
      setInterval(runTelegramHealthCheck, TG_HEALTH_INTERVAL);
    }

    const totalFeeds = Object.values(CHANNELS).reduce((sum, ch) => sum + ch.feeds.length, 0);
    const totalArticles = Object.values(channelCache).reduce((sum, c) => sum + (c?.articles?.length || 0), 0);
    console.log(`[SERVER] Intel Hub running on http://localhost:${port}`);
    console.log(`[SERVER] ${Object.keys(CHANNELS).length} channels, ${totalFeeds} total feeds, refresh every ${REFRESH_INTERVAL / 60000}m`);
    console.log(`[SERVER] Ingest API: POST http://localhost:${port}/api/ingest`);
    console.log(`[SERVER] Health: GET http://localhost:${port}/api/health`);
    console.log(`[MEMORY] ${getMemoryUsageMB().toFixed(0)} MB used | cap: ${MEMORY_CAP_MB} MB | ${totalArticles} articles cached`);
  });
}

startServer(PORT);

// ── Graceful Shutdown ──────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[SERVER] ${signal} received — shutting down...`);
  if (wss) {
    wss.clients.forEach((ws) => ws.terminate());
    wss.close(() => {
      console.log("[SERVER] WebSocket + HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 3000);
  } else {
    process.exit(0);
  }
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
