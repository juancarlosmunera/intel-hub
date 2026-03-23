// ═══════════════════════════════════════════════════════════════
// SOURCE CREDIBILITY TIERS
// ═══════════════════════════════════════════════════════════════
//
// Tier 1 — PRIMARY SOURCE: Government agencies, official databases,
//          wire services, raw data feeds. First-hand information.
// Tier 2 — ESTABLISHED: Major outlets with editorial standards,
//          recognized security researchers, peer-reviewed sources.
// Tier 3 — INDUSTRY: Commercial vendor blogs, think tanks,
//          specialized publications with potential commercial bias.
// Tier 4 — AGGREGATOR: Content aggregators, smaller blogs,
//          less established or unvetted sources.

export const TRUST_TIERS = {
  1: { label: "PRIMARY", color: "#00e5ff", description: "Official / Primary Source" },
  2: { label: "VERIFIED", color: "#00ff88", description: "Established & Reputable" },
  3: { label: "INDUSTRY", color: "#ffcc00", description: "Industry / Vendor" },
  4: { label: "UNVETTED", color: "#ff6b8a", description: "Aggregator / Unvetted" },
};

// Map every feed name → trust tier
export const SOURCE_TRUST = {
  // ── CYBER CHANNEL ──────────────────────────────────────────
  // Tier 1: Government & Official
  "CISA Advisories": 1,
  "NIST Cyber Insights": 1,
  "US-CERT Alerts": 1,
  "Exploit-DB": 1,
  "URLhaus Recent Threats": 1,
  "MalwareBazaar Recent": 1,
  "Feodo Tracker": 1,
  "SSL Blacklist": 1,
  "ThreatFox IoCs": 1,
  "VulnCheck KEV": 1,
  "VulnCheck": 1,
  "PCI SSC Blog": 1,

  // Tier 2: Established security journalism & research
  "Krebs on Security": 2,
  "Schneier on Security": 2,
  "Bleeping Computer": 2,
  "The Hacker News": 2,
  "Dark Reading": 2,
  "SecurityWeek": 2,
  "The Record": 2,
  "Ars Technica Security": 2,
  "Graham Cluley": 2,
  "Infosecurity Magazine": 2,
  "Google Project Zero": 2,
  "GitHub Security Blog": 2,
  "OpenSSF Blog": 2,

  // Tier 3: Vendor security blogs (good intel, potential commercial bias)
  "Microsoft Security Blog": 3,
  "Unit 42 (Palo Alto)": 3,
  "Cisco Talos": 3,
  "SentinelOne Blog": 3,
  "CrowdStrike Blog": 3,
  "Qualys Threat Research": 3,
  "Recorded Future": 3,
  "Datadog Security Labs": 3,
  "Sekoia Blog": 3,
  "WeLiveSecurity (ESET)": 3,
  "ReversingLabs": 3,
  "Snyk Blog": 3,
  "Sonatype Blog": 3,
  "Feroot Security": 3,
  "c/side Blog": 3,
  "Wordfence": 3,
  "Sucuri Blog": 3,
  "GreyNoise": 3,

  // Tier 2-3: Industry publications
  "CSO Online": 2,
  "SecurityAffairs": 2,
  "Threatpost": 2,
  "Finextra Security": 2,
  "Payments Dive": 2,

  // Tier 4: Aggregators / less established
  "GBHackers": 4,
  "Hackread": 4,
  "Cyber Security News": 4,

  // ── WORLD NEWS CHANNEL ─────────────────────────────────────
  // Tier 1: Wire services
  "Reuters World": 1,
  "AP News World": 1,
  "UPI": 1,

  // Tier 2: Major news outlets (left, center, and right)
  "BBC World": 2,
  "France24": 2,
  "Nikkei Asia": 2,
  "Wall Street Journal": 2,
  "The Hill": 2,
  "NewsNation": 2,
  "NPR World": 2,
  "CNN World": 2,
  "Axios": 2,
  "Fox News": 2,
  "New York Post": 2,
  "Washington Examiner": 2,
  "The Dispatch": 2,
  "National Review": 2,

  // Tier 2: Geopolitics journals
  "Foreign Affairs": 2,
  "Foreign Policy": 2,
  "The Diplomat": 2,
  "War on the Rocks": 2,

  // Tier 3: Think tanks (institutional bias possible)
  "RAND": 3,
  "CSIS": 3,
  "Council on Foreign Relations": 3,
  "Atlantic Council": 3,
  "Stimson Center": 3,
  "Heritage Foundation": 3,
  "Hudson Institute": 3,
  "Cato Institute": 3,

  // Tier 2: Defense publications
  "Defense One": 2,
  "Breaking Defense": 2,

  // ── OSINT CHANNEL ──────────────────────────────────────────
  // Tier 1: Raw data & government
  "GDELT Project": 1,
  "OFAC Updates": 1,

  // Tier 2: Methodology
  "IntelTechniques Blog": 2,
  "DarkReading": 2,

  // Tier 3: Commercial threat intel
  "Recorded Future Blog": 3,
  "Intel471 Blog": 3,
  "Flashpoint Blog": 3,
  "Kaspersky Securelist": 3,
};

// ═══════════════════════════════════════════════════════════════
// CONTENT RED FLAGS — patterns suggesting misinfo/disinfo/clickbait
// ═══════════════════════════════════════════════════════════════

export const CONTENT_RED_FLAGS = [
  // Clickbait / sensationalist
  "you won't believe",
  "shocking revelation",
  "this changes everything",
  "the truth about",
  "what they don't want you to know",
  "exposed!",
  "bombshell",
  "game changer",
  "mind-blowing",
  "insane",

  // Unverified / speculative
  "unconfirmed reports",
  "sources say",
  "rumor has it",
  "allegedly",
  "could be linked to",
  "some experts believe",
  "anonymous sources",

  // Conspiracy-adjacent
  "false flag",
  "cover-up",
  "deep state",
  "controlled opposition",
  "mainstream media won't tell you",
  "wake up",
  "they don't want you to see",
  "paid shill",

  // Misinfo amplification
  "going viral",
  "share before they delete",
  "spread the word",
  "censored",
  "banned from social media",
];

// Patterns that strongly suggest misinfo when combined with low-tier sources
export const DISINFO_PATTERNS = [
  // Fabricated attribution
  /according to (?:unnamed|anonymous|undisclosed) (?:officials?|sources?)/i,
  // Emotional manipulation
  /\b(?:EXPOSED|SHOCKING|BOMBSHELL|BREAKING)\b.*!{2,}/,
  // Fake urgency
  /\b(?:share (?:this|now|before)|read before (?:it's|they) (?:deleted?|removed?))\b/i,
];
