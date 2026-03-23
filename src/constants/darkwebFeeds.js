export const FEEDS = [
  // ── Ransomware Tracking ──
  { name: "Ransomware.live", category: "Ransomware" },
  { name: "RansomFeed.it", category: "Ransomware" },
  { name: "DarkFeed", category: "Ransomware" },
  // ── Breach & Leak Journalism ──
  { name: "DataBreaches.net", category: "Breaches" },
  // ── API Feeds ──
  { name: "Have I Been Pwned", category: "Breaches" },
];

export const ALERT_KEYWORDS = [
  // Ransomware
  "ransomware", "ransom", "encrypted", "decryptor", "extortion",
  "double extortion", "triple extortion", "data leak site",
  "lockbit", "blackcat", "alphv", "clop", "akira", "play",
  "medusa", "rhysida", "bianlian", "royal", "8base",
  // Data breaches & leaks
  "data breach", "data leak", "database dump", "credential dump",
  "leaked", "exposed", "compromised", "stolen data",
  "PII", "SSN", "credit card", "fullz",
  // Dark web markets & forums
  "dark web", "darknet", "onion", "tor market", "underground forum",
  "breach forum", "exploit forum", "marketplace",
  // Initial access
  "initial access broker", "IAB", "RDP access", "VPN access",
  "corporate access", "network access for sale",
  // Threat actors
  "threat actor", "threat group", "APT", "cybercrime group",
  "affiliate", "ransomware gang", "cartel",
  // Financial fraud
  "carding", "skimmer", "magecart", "BIN", "cash out",
  "money mule", "fraud", "phishing kit",
  // Cryptocurrency
  "crypto mixer", "tumbler", "monero", "bitcoin ransom",
  "wallet", "crypto theft",
];
