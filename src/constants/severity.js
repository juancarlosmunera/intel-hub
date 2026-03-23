export const SEVERITY_RULES = [
  { keywords: ["data breach", "breach disclosed", "breach notification", "records exposed", "records leaked", "data leak", "data exposed", "credentials leaked", "customer data exposed", "personal data breach", "million records", "database exposed", "sensitive data exposed", "breach confirmed"], level: "BREACH", color: "#e040fb" },
  { keywords: ["zero-day", "0-day", "actively exploited", "ransomware attack", "RCE", "remote code execution", "critical vulnerability exploited", "under active attack", "in the wild", "Magecart"], level: "CRITICAL", color: "#ff2d55" },
  { keywords: ["skimmer found", "payment fraud", "SDK hijack", "POS malware", "card fraud", "backdoor found", "backdoor discovered", "trojanized package", "trojanized update", "supply chain attack", "supply chain compromise", "malicious package", "malicious dependency"], level: "HIGH", color: "#ff9500" },
  { keywords: ["CVE-2026", "CVE-2025", "CVE-2024", "SQL injection", "XSS attack", "credential stuffing attack", "formjacking attack", "actively scanning", "proof of concept", "exploit released", "patch now", "critical patch", "emergency patch"], level: "MEDIUM", color: "#ffcc00" },
];

export const ADVISORY_PATTERNS = [
  "how to prevent", "how to protect", "how to avoid", "how to detect",
  "how to respond", "how to prepare", "how to mitigate", "how to reduce",
  "tips for", "tips to", "guide to", "best practices", "checklist",
  "what is a", "what are", "understanding", "explained",
  "protect against", "defend against", "prevent a", "preventing",
  "top 10", "top 5", "steps to", "ways to", "strategies for",
  "compliance", "GDPR", "CCPA", "HIPAA", "regulatory",
  "webinar", "whitepaper", "white paper", "case study", "infographic",
  "training", "awareness", "lessons learned", "takeaways from",
];

export const SEVERITY_RANK = { BREACH: 0, CRITICAL: 1, HIGH: 2, MEDIUM: 3, INFO: 4 };

export const SEVERITY_COLORS = {
  BREACH: "#e040fb",
  CRITICAL: "#ff2d55",
  HIGH: "#ff9500",
  MEDIUM: "#ffcc00",
  INFO: "#64d2ff",
};
