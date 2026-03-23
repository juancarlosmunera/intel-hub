export const FEEDS = [
  // Threat Intel
  { name: "The Hacker News", category: "Threat Intel" },
  { name: "Krebs on Security", category: "Threat Intel" },
  { name: "Bleeping Computer", category: "Threat Intel" },
  { name: "Dark Reading", category: "Threat Intel" },
  { name: "SecurityWeek", category: "Threat Intel" },
  { name: "Threatpost", category: "Threat Intel" },
  { name: "Ars Technica Security", category: "Threat Intel" },
  { name: "The Record", category: "Threat Intel" },
  { name: "Infosecurity Magazine", category: "Threat Intel" },
  { name: "CSO Online", category: "Threat Intel" },
  { name: "SecurityAffairs", category: "Threat Intel" },
  { name: "GBHackers", category: "Threat Intel" },
  { name: "Hackread", category: "Threat Intel" },
  { name: "Cyber Security News", category: "Threat Intel" },
  { name: "Graham Cluley", category: "Threat Intel" },
  { name: "Schneier on Security", category: "Threat Intel" },
  // Advisories & Vulnerabilities
  { name: "CISA Advisories", category: "Advisory" },
  { name: "NIST Cyber Insights", category: "Advisory" },
  { name: "US-CERT Alerts", category: "Advisory" },
  { name: "Exploit-DB", category: "Vulnerability" },
  // Research & Vendor Security
  { name: "Google Project Zero", category: "Research" },
  { name: "Microsoft Security Blog", category: "Vendor Security" },
  { name: "Unit 42 (Palo Alto)", category: "Research" },
  { name: "Cisco Talos", category: "Research" },
  { name: "SentinelOne Blog", category: "Vendor Security" },
  { name: "CrowdStrike Blog", category: "Vendor Security" },
  { name: "Qualys Threat Research", category: "Research" },
  { name: "Recorded Future", category: "Research" },
  { name: "Datadog Security Labs", category: "Research" },
  { name: "Sekoia Blog", category: "Research" },
  { name: "WeLiveSecurity (ESET)", category: "Vendor Security" },
  { name: "ReversingLabs", category: "Research" },
  // Supply Chain
  { name: "Snyk Blog", category: "Supply Chain" },
  { name: "Sonatype Blog", category: "Supply Chain" },
  { name: "GitHub Security Blog", category: "Supply Chain" },
  { name: "OpenSSF Blog", category: "Supply Chain" },
  { name: "Feroot Security", category: "Supply Chain" },
  { name: "c/side Blog", category: "Supply Chain" },
  // Web Security
  { name: "Wordfence", category: "Web Security" },
  { name: "Sucuri Blog", category: "Web Security" },
  // PCI / Compliance / Fintech
  { name: "PCI SSC Blog", category: "PCI / Compliance" },
  { name: "Finextra Security", category: "Fintech Security" },
  { name: "Payments Dive", category: "Payments" },
  // Abuse.ch (Free Threat Intel)
  { name: "URLhaus Recent Threats", category: "Abuse.ch" },
  { name: "MalwareBazaar Recent", category: "Abuse.ch" },
  { name: "Feodo Tracker", category: "Abuse.ch" },
  { name: "SSL Blacklist", category: "Abuse.ch" },
  // API-based Threat Intel (Free)
  { name: "ThreatFox IoCs", category: "Abuse.ch" },
  { name: "GreyNoise", category: "Threat Intel API" },
  { name: "VulnCheck KEV", category: "Threat Intel API" },
];

export const ALERT_KEYWORDS = [
  // Breach (highest priority)
  "data breach", "breach disclosed", "breach notification", "records exposed",
  "records leaked", "data leak", "data exposed", "credentials leaked",
  "customer data exposed", "personal data breach", "million records",
  "database exposed", "sensitive data exposed", "breach confirmed",
  // PCI & Compliance
  "PCI", "PCI DSS", "payment card", "cardholder data", "SAQ", "QSA", "ASV", "P2PE",
  "tokenization", "3DS", "EMV", "card-not-present",
  // Payment / Fintech threats
  "skimmer", "Magecart", "formjacking", "SDK hijack", "AppsFlyer",
  "payment fraud", "card fraud", "BIN attack", "credential stuffing",
  "e-commerce breach", "checkout exploit", "iframe injection", "javascript injection",
  "payment gateway", "payment processor", "Elavon", "WooCommerce", "Shopify",
  // Hotel / Hospitality
  "hotel breach", "hospitality", "point of sale", "POS malware", "POS breach",
  "property management", "reservation system",
  // General high-severity
  "zero-day", "0-day", "ransomware", "data breach", "supply chain attack",
  "critical vulnerability", "CVE-2026", "CVE-2025", "actively exploited",
  "RCE", "remote code execution", "SQL injection", "XSS",
  // Supply chain & software security
  "supply chain compromise", "dependency confusion", "typosquatting",
  "malicious package", "backdoor", "trojanized", "npm malware", "PyPI malware",
  "Maven Central", "JDK", "OpenJDK", "Java vulnerability",
];
