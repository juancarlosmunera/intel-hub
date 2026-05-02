export const FEEDS = [
  // ── Telegram (public preview scraper, no key needed) ──
  // Curated to channels that post within the last 7 days. Reverified against t.me/s/{handle}.
  // Threat Intel & Malware
  { name: "TG: vx-underground", category: "Telegram" },
  // Ransomware & Leak Tracking
  { name: "TG: DARKFEED", category: "Telegram" },
  { name: "TG: RansomFeed News", category: "Telegram" },
  { name: "TG: RansomLook", category: "Telegram" },
  { name: "TG: Red Packet Security", category: "Telegram" },
  // Cybersec News
  { name: "TG: The Hacker News", category: "Telegram" },
  // OSINT
  { name: "TG: OsintTV", category: "Telegram" },
  { name: "TG: True OSINT", category: "Telegram" },
  // Geopolitics
  { name: "TG: Intel Slava", category: "Telegram" },
  // Bug Bounty
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
