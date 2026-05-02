export const FEEDS = [
  // ── Telegram (public preview scraper, no key needed) ──
  // Threat Intel & Malware
  { name: "TG: vx-underground", category: "Telegram" },
  { name: "TG: Malware Traffic Analysis", category: "Telegram" },
  { name: "TG: The DFIR Report", category: "Telegram" },
  { name: "TG: Infostealers", category: "Telegram" },
  // Ransomware & Leak Tracking
  { name: "TG: DARKFEED", category: "Telegram" },
  { name: "TG: RansomFeed News", category: "Telegram" },
  { name: "TG: RansomLook", category: "Telegram" },
  { name: "TG: DataBreaches.net", category: "Telegram" },
  { name: "TG: Red Packet Security", category: "Telegram" },
  { name: "TG: LeakIX", category: "Telegram" },
  // Cybersec News
  { name: "TG: The Hacker News", category: "Telegram" },
  { name: "TG: Cyber Security News", category: "Telegram" },
  { name: "TG: Cybersecurity Alerts", category: "Telegram" },
  { name: "TG: Doomscroll", category: "Telegram" },
  // OSINT
  { name: "TG: OsintTV", category: "Telegram" },
  { name: "TG: Cyber Detective", category: "Telegram" },
  { name: "TG: Bellingcat", category: "Telegram" },
  { name: "TG: True OSINT", category: "Telegram" },
  { name: "TG: OSINT Techniques", category: "Telegram" },
  // Geopolitics
  { name: "TG: Intel Slava", category: "Telegram" },
  { name: "TG: Breaking Defense", category: "Telegram" },
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
