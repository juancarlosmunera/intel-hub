export const FEEDS = [
  // ── Reddit ──
  { name: "r/netsec", category: "Reddit" },
  { name: "r/cybersecurity", category: "Reddit" },
  { name: "r/malware", category: "Reddit" },
  { name: "r/darknet", category: "Reddit" },
  { name: "r/privacy", category: "Reddit" },
  { name: "r/ReverseEngineering", category: "Reddit" },
  { name: "r/AskNetsec", category: "Reddit" },
  { name: "r/blueteamsec", category: "Reddit" },
  { name: "r/computerforensics", category: "Reddit" },
  { name: "r/OSINT", category: "Reddit" },
  // ── X (Twitter) — requires TWITTER_BEARER_TOKEN in .env ──
  { name: "X: Search", category: "X (Twitter)" },
  // ── Telegram (public preview scraper, no key needed) ──
  { name: "TG: vx-underground", category: "Telegram" },
  { name: "TG: HackGit", category: "Telegram" },
  { name: "TG: DARKFEED", category: "Telegram" },
  { name: "TG: Daily Dark Web", category: "Telegram" },
  { name: "TG: RansomFeed News", category: "Telegram" },
  { name: "TG: RansomLook", category: "Telegram" },
  { name: "TG: Intel Slava", category: "Telegram" },
  { name: "TG: OsintTV", category: "Telegram" },
  { name: "TG: The Hacker News", category: "Telegram" },
  { name: "TG: SecAtor (RU)", category: "Telegram" },
  { name: "TG: Bug Bounty Hunter", category: "Telegram" },
  { name: "TG: Bug Bounty Channel", category: "Telegram" },
  // ── Mastodon (no key needed) ──
  { name: "Mastodon: jerry", category: "Mastodon" },
  { name: "Mastodon: briankrebs", category: "Mastodon" },
  { name: "Mastodon: BleepingComputer", category: "Mastodon" },
  { name: "Mastodon: malwaretech", category: "Mastodon" },
  // ── GitHub Security Advisories (no key needed) ──
  { name: "GitHub Advisories", category: "GitHub" },
  // ── NVD / National Vulnerability Database (no key needed) ──
  { name: "NVD (NIST)", category: "Vulnerability" },
];

export const ALERT_KEYWORDS = [
  // Threat intel
  "ransomware", "zero-day", "0-day", "breach", "exploit", "CVE-",
  "malware", "backdoor", "APT", "threat actor", "phishing",
  "data leak", "credential", "vulnerability", "RCE",
  "supply chain", "botnet", "C2", "infostealer",
  "lockbit", "blackcat", "alphv", "clop", "akira", "play",
  "medusa", "ransomhub", "qilin", "blackbasta",
  // Social-media-specific urgency
  "breaking", "confirmed", "just released", "patch now",
  "actively exploited", "in the wild", "IOC", "indicator",
  "proof of concept", "PoC", "dropped", "dumped",
  // Dark web crossover
  "dark web", "darknet", "leak site", "forum post",
  "initial access", "IAB", "stealer logs",
];
