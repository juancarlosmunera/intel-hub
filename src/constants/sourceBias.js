// ═══════════════════════════════════════════════════════════════
// SOURCE POLITICAL LEANING
// ═══════════════════════════════════════════════════════════════
//
// L  — Left
// LL — Lean Left
// C  — Center
// LR — Lean Right
// R  — Right
// I  — Independent (no institutional alignment)
// N  — Nonpartisan / Not Applicable (technical, govt, data feeds)

export const BIAS_LABELS = {
  L:  { label: "LEFT",        color: "#5e9cff", short: "L"  },
  LL: { label: "LEAN LEFT",   color: "#7eb3ff", short: "LL" },
  C:  { label: "CENTER",      color: "#a0a0a0", short: "C"  },
  LR: { label: "LEAN RIGHT",  color: "#ffb36b", short: "LR" },
  R:  { label: "RIGHT",       color: "#ff7b5e", short: "R"  },
  I:  { label: "INDEPENDENT", color: "#c792ea", short: "I"  },
  N:  { label: "NONPARTISAN", color: "#4a5a6e", short: "N"  },
};

export const SOURCE_BIAS = {
  // ── CYBER CHANNEL ──────────────────────────────────────────
  // Most cybersec sources are technical/nonpartisan
  "CISA Advisories": "N",
  "NIST Cyber Insights": "N",
  "US-CERT Alerts": "N",
  "Exploit-DB": "N",
  "URLhaus Recent Threats": "N",
  "MalwareBazaar Recent": "N",
  "Feodo Tracker": "N",
  "SSL Blacklist": "N",
  "ThreatFox IoCs": "N",
  "VulnCheck KEV": "N",
  "VulnCheck": "N",
  "PCI SSC Blog": "N",
  "Krebs on Security": "N",
  "Schneier on Security": "N",
  "Bleeping Computer": "N",
  "BleepingComputer": "N",
  "The Hacker News": "N",
  "Dark Reading": "N",
  "SecurityWeek": "N",
  "The Record": "N",
  "Ars Technica Security": "LL",
  "Graham Cluley": "N",
  "Infosecurity Magazine": "N",
  "Google Project Zero": "N",
  "GitHub Security Blog": "N",
  "OpenSSF Blog": "N",
  "Microsoft Security Blog": "N",
  "Unit 42 (Palo Alto)": "N",
  "Cisco Talos": "N",
  "SentinelOne Blog": "N",
  "CrowdStrike Blog": "N",
  "Qualys Threat Research": "N",
  "Recorded Future": "N",
  "Datadog Security Labs": "N",
  "Sekoia Blog": "N",
  "WeLiveSecurity (ESET)": "N",
  "ReversingLabs": "N",
  "Snyk Blog": "N",
  "Sonatype Blog": "N",
  "Feroot Security": "N",
  "c/side Blog": "N",
  "Wordfence": "N",
  "Sucuri Blog": "N",
  "GreyNoise": "N",
  "CSO Online": "N",
  "SecurityAffairs": "N",
  "Threatpost": "N",
  "Finextra Security": "N",
  "Payments Dive": "N",
  "GBHackers": "N",
  "Hackread": "N",
  "Cyber Security News": "N",

  // ── WORLD NEWS CHANNEL ─────────────────────────────────────
  // Wire services
  "Reuters World": "C",
  "AP News World": "C",
  "UPI": "C",
  // International
  "BBC World": "C",
  "France24": "C",
  "Nikkei Asia": "C",
  // US News — left to center
  "CNN World": "L",
  "NPR World": "LL",
  "NewsNation": "C",
  "The Hill": "C",
  "Axios": "C",
  "Wall Street Journal": "C",
  // US News — right
  "Fox News": "R",
  "New York Post": "LR",
  "Washington Examiner": "R",
  "The Dispatch": "LR",
  "National Review": "R",

  // ── GEOPOLITICS ────────────────────────────────────────────
  "Foreign Affairs": "C",
  "Foreign Policy": "LL",
  "The Diplomat": "C",
  "War on the Rocks": "C",

  // ── THINK TANKS ────────────────────────────────────────────
  "RAND": "C",
  "CSIS": "C",
  "Council on Foreign Relations": "LL",
  "Stimson Center": "LL",
  "Atlantic Council": "LR",
  "Heritage Foundation": "R",
  "Hudson Institute": "R",
  "Cato Institute": "LR",

  // ── INDEPENDENT JOURNALISM ─────────────────────────────────
  "Racket News (Taibbi)": "I",
  "Glenn Greenwald": "I",
  "Chris Hedges Report": "I",
  "Seymour Hersh": "I",
  "The Orf Report (Orfalea)": "I",
  "The Grayzone": "I",
  "Consortium News": "I",

  // ── DEFENSE & MILITARY ─────────────────────────────────────
  "Defense One": "C",
  "Breaking Defense": "C",
  "USNI News": "C",
  "The Aviationist": "C",
  "19FortyFive": "LR",
  "SOF News": "C",

  // ── CONFLICT MONITORING ────────────────────────────────────
  "Middle East Eye": "LL",
  "Alma Research Center": "LR",
  "Long War Journal": "C",

  // ── OSINT CHANNEL ──────────────────────────────────────────
  "GDELT Project": "N",
  "IntelTechniques Blog": "N",
  "Bellingcat": "C",
  "OFAC Updates": "N",
  "CISA Alerts": "N",
  "Recorded Future Blog": "N",
  "Intel471 Blog": "N",
  "DarkReading": "N",
  "Flashpoint Blog": "N",
  "Kaspersky Securelist": "N",
  "Microsoft Threat Intel": "N",
  "SentinelOne Labs": "N",
  "Lawfare": "LL",

  // ── DARK WEB CHANNEL ───────────────────────────────────────
  "Ransomware.live": "N",
  "RansomFeed.it": "N",
  "DarkFeed": "N",
  "The DFIR Report": "N",
  "DataBreaches.net": "N",
  "Troy Hunt": "N",
  "CyberScoop": "N",
  "Intel 471 Blog": "N",
  "Flashpoint": "N",
  "BushidoToken": "N",
  "Check Point Research": "N",
  "Google Threat Intel": "N",
  "Securelist (Kaspersky)": "N",
  "Huntress Blog": "N",
  "Elastic Security Labs": "N",
  "ANY.RUN Blog": "N",
  "Malwarebytes Blog": "N",
  "Sophos Blog": "N",
  "SANS ISC": "N",
  "Rapid7 Blog": "N",
  "UK NCSC Reports": "N",
  "Have I Been Pwned": "N",

  // ── SOCIAL MEDIA CHANNEL ───────────────────────────────────
  "X: vx-underground": "N",
  "X: GossiTheDog": "N",
  "X: MalwareHunterTeam": "N",
  "X: BleepinComputer": "N",
  "X: SwiftOnSecurity": "N",
  "X: _JohnHammond": "N",
  "X: campuscodi": "N",
  "X: Search": "N",
  "Mastodon: jerry": "N",
  "Mastodon: briankrebs": "N",
  "Mastodon: BleepingComputer": "N",
  "Mastodon: malwaretech": "N",
  "GitHub Advisories": "N",
  "NVD (NIST)": "N",

  // Reddit — community, no editorial bias classification
  "r/netsec": "N",
  "r/cybersecurity": "N",
  "r/malware": "N",
  "r/darknet": "N",
  "r/privacy": "N",
  "r/ReverseEngineering": "N",
  "r/AskNetsec": "N",
  "r/blueteamsec": "N",
  "r/computerforensics": "N",
  "r/OSINT": "N",
  "TG: vx-underground": "N",
};
