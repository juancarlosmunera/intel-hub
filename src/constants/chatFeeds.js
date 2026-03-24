export const FEEDS = [
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
];

export const ALERT_KEYWORDS = [
  // Threat intel
  "ransomware", "zero-day", "0-day", "breach", "exploit", "CVE-",
  "malware", "backdoor", "APT", "threat actor", "phishing",
  "data leak", "credential", "vulnerability", "RCE",
  "supply chain", "botnet", "C2", "infostealer",
  "lockbit", "blackcat", "alphv", "clop", "akira", "play",
  "medusa", "ransomhub", "qilin", "blackbasta",
  // Breaking events
  "breaking", "confirmed", "just released", "patch now",
  "actively exploited", "in the wild", "IOC", "indicator",
  "proof of concept", "PoC", "dropped", "dumped",
  // Dark web crossover
  "dark web", "darknet", "leak site", "forum post",
  "initial access", "IAB", "stealer logs",
  // Geopolitics
  "airstrike", "missile", "NATO", "CENTCOM", "Iran", "nuclear",
];
