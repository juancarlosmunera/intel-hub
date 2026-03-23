export const FEEDS = [
  // ── Ransomware Tracking ──
  { name: "Ransomware.live", category: "Ransomware" },
  { name: "RansomFeed.it", category: "Ransomware" },
  { name: "DarkFeed", category: "Ransomware" },
  { name: "The DFIR Report", category: "Ransomware" },
  // ── Breach & Leak Journalism ──
  { name: "DataBreaches.net", category: "Breaches" },
  { name: "Troy Hunt", category: "Breaches" },
  { name: "CyberScoop", category: "Breaches" },
  // ── API Feeds ──
  { name: "Have I Been Pwned", category: "Breaches" },
  // ── Underground / Threat Intel ──
  { name: "Intel 471 Blog", category: "Underground" },
  { name: "Flashpoint", category: "Underground" },
  { name: "BushidoToken", category: "Underground" },
  { name: "Check Point Research", category: "Threat Intel" },
  { name: "Google Threat Intel", category: "Threat Intel" },
  { name: "Securelist (Kaspersky)", category: "Threat Intel" },
  { name: "Huntress Blog", category: "Threat Intel" },
  { name: "Elastic Security Labs", category: "Threat Intel" },
  // ── Malware & Botnet Tracking ──
  { name: "ANY.RUN Blog", category: "Malware" },
  { name: "Malwarebytes Blog", category: "Malware" },
  { name: "Sophos Blog", category: "Malware" },
  // ── Exploitation in the Wild ──
  { name: "SANS ISC", category: "Exploitation" },
  { name: "Rapid7 Blog", category: "Exploitation" },
  { name: "UK NCSC Reports", category: "Government" },
];

export const ALERT_KEYWORDS = [
  // Ransomware
  "ransomware", "ransom", "encrypted", "decryptor", "extortion",
  "double extortion", "triple extortion", "data leak site",
  "lockbit", "blackcat", "alphv", "clop", "akira", "play",
  "medusa", "rhysida", "bianlian", "royal", "8base",
  "ransomhub", "qilin", "blackbasta", "black basta",
  // Data breaches & leaks
  "data breach", "data leak", "database dump", "credential dump",
  "leaked", "exposed", "compromised", "stolen data",
  "PII", "SSN", "credit card", "fullz",
  "infostealer", "stealer logs", "redline", "raccoon", "vidar",
  // Dark web markets & forums
  "dark web", "darknet", "onion", "tor market", "underground forum",
  "breach forum", "exploit forum", "marketplace",
  // Initial access
  "initial access broker", "IAB", "RDP access", "VPN access",
  "corporate access", "network access for sale",
  // Threat actors
  "threat actor", "threat group", "APT", "cybercrime group",
  "affiliate", "ransomware gang", "cartel",
  // Malware & C2
  "malware", "trojan", "botnet", "C2", "command and control",
  "cobalt strike", "sliver", "brute ratel", "rat",
  "loader", "dropper", "backdoor",
  // Exploitation
  "zero-day", "0-day", "exploit", "proof of concept", "PoC",
  "actively exploited", "in the wild", "CVE-2026", "CVE-2025",
  // Financial fraud
  "carding", "skimmer", "magecart", "BIN", "cash out",
  "money mule", "fraud", "phishing kit",
  // Cryptocurrency
  "crypto mixer", "tumbler", "monero", "bitcoin ransom",
  "wallet", "crypto theft",
];
