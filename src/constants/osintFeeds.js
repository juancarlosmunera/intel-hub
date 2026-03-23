export const FEEDS = [
  // ── Raw Data (pure data, no editorial) ──
  { name: "GDELT Project", category: "Raw Data" },
  // ── OSINT Methodology ──
  { name: "IntelTechniques Blog", category: "Methodology" },
  // ── Threat Intel (commercial vendors, no editorial bias) ──
  { name: "Recorded Future Blog", category: "Threat Intel" },
  { name: "Intel471 Blog", category: "Threat Intel" },
  { name: "DarkReading", category: "Threat Intel" },
  { name: "Flashpoint Blog", category: "Threat Intel" },
  { name: "Kaspersky Securelist", category: "Threat Intel" },
  // ── Sanctions (government primary source) ──
  { name: "OFAC Updates", category: "Sanctions" },
];

export const ALERT_KEYWORDS = [
  // OSINT-specific
  "data leak", "exposed database", "leaked documents", "dump",
  "dark web", "underground forum", "darknet market",
  "doxed", "doxxing", "PII exposed", "credential dump",
  // Investigation
  "investigation reveals", "traced to", "identified as",
  "attribution", "unmasked", "geolocated",
  // Influence Operations (neutral framing)
  "influence operation", "information operation",
  "bot network", "coordinated inauthentic", "deepfake",
  "synthetic media", "astroturfing",
  // Surveillance
  "surveillance", "spyware", "Pegasus", "wiretapping",
  "mass surveillance", "facial recognition", "tracking",
  // State-sponsored
  "APT", "state-sponsored", "nation-state", "cyber espionage",
  "threat actor", "campaign identified",
  // Sanctions & Watchlists
  "sanctions", "designated", "OFAC", "blacklisted",
  "asset freeze", "travel ban", "export control",
  // Legal / Indictments
  "indictment", "indicted", "charged with", "arrested",
  "seized", "forfeiture", "extradited",
];
