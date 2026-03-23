import { SEVERITY_RULES, ADVISORY_PATTERNS } from "../constants/severity";
import { SOURCE_TRUST, TRUST_TIERS, CONTENT_RED_FLAGS, DISINFO_PATTERNS } from "../constants/sourceCredibility";

export function getSourceTrust(feedName) {
  const tier = SOURCE_TRUST[feedName] ?? 4;
  return { tier, ...TRUST_TIERS[tier] };
}

export function detectRedFlags(text) {
  const lower = text.toLowerCase();
  const flags = [];

  for (const flag of CONTENT_RED_FLAGS) {
    if (lower.includes(flag)) flags.push(flag);
  }

  for (const pattern of DISINFO_PATTERNS) {
    if (pattern.test(text)) flags.push(pattern.source.slice(0, 40));
  }

  return flags;
}

export function classifySeverity(text) {
  const lower = text.toLowerCase();
  if (ADVISORY_PATTERNS.some(p => lower.includes(p))) {
    return { level: "INFO", color: "#64d2ff" };
  }
  for (const rule of SEVERITY_RULES) {
    if (rule.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return { level: rule.level, color: rule.color };
    }
  }
  return { level: "INFO", color: "#64d2ff" };
}

export function matchesKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.filter(k => lower.includes(k.toLowerCase()));
}

export function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
}
