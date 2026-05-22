import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../hooks/useWebSocket";
import { classifySeverity, matchesKeywords, timeAgo, getSourceTrust, getSourceBias } from "../utils/classify";
import { SEVERITY_RANK, SEVERITY_COLORS } from "../constants/severity";
import { ALERT_KEYWORDS as CYBER_KW } from "../constants/cyberFeeds";
import { ALERT_KEYWORDS as WORLD_KW } from "../constants/worldFeeds";
import { ALERT_KEYWORDS as OSINT_KW } from "../constants/osintFeeds";
import { ALERT_KEYWORDS as DARKWEB_KW } from "../constants/darkwebFeeds";
import { ALERT_KEYWORDS as SOCIAL_KW } from "../constants/socialFeeds";
import { ALERT_KEYWORDS as CHAT_KW } from "../constants/chatFeeds";
import Pulse from "../components/Pulse";

const CHANNELS = [
  { id: "cyber", label: "Cybersecurity", icon: "CS", color: "var(--accent)", path: "/cyber", keywords: CYBER_KW },
  { id: "world", label: "World News", icon: "WN", color: "var(--accent)", path: "/world", keywords: WORLD_KW },
  { id: "geopolitics", label: "Geopolitics", icon: "GP", color: "var(--accent)", path: "/geopolitics", keywords: [...WORLD_KW, "Iran", "CENTCOM", "airstrike", "missile", "NATO", "escalation", "ceasefire", "nuclear", "sanctions"] },
  { id: "osint", label: "OSINT", icon: "OS", color: "var(--accent)", path: "/osint", keywords: OSINT_KW },
  { id: "darkweb", label: "Dark Web", icon: "DW", color: "var(--accent)", path: "/darkweb", keywords: DARKWEB_KW },
  { id: "social", label: "Social Media", icon: "SM", color: "var(--accent)", path: "/social", keywords: SOCIAL_KW },
  { id: "chatfeeds", label: "Chat Feeds", icon: "CF", color: "var(--accent)", path: "/chatfeeds", keywords: CHAT_KW },
];

function ChannelSummary({ channel, searchFilter = "" }) {
  const { articles: raw, stats, connected } = useWebSocket(channel.id);
  const navigate = useNavigate();

  const articles = useMemo(() =>
    raw.map(item => {
      const fullText = `${item.title} ${item.description || ""}`;
      const severity = classifySeverity(fullText);
      const matched = matchesKeywords(fullText, channel.keywords);
      const trust = getSourceTrust(item.feedName);
      const bias = getSourceBias(item.feedName);
      return { ...item, cleanDescription: item.description || "", severity, matchedKeywords: matched, isAlert: matched.length > 0, trust, bias };
    }).sort((a, b) => {
      const ra = SEVERITY_RANK[a.severity.level] ?? 4;
      const rb = SEVERITY_RANK[b.severity.level] ?? 4;
      if (ra !== rb) return ra - rb;
      return new Date(b.pubDate) - new Date(a.pubDate);
    }),
    [raw, channel.keywords]
  );

  const filtered = useMemo(() => {
    if (!searchFilter) return articles;
    return articles.filter(a => {
      const text = `${a.title} ${a.cleanDescription} ${a.feedName || ""} ${a.severity.level}`.toLowerCase();
      return text.includes(searchFilter);
    });
  }, [articles, searchFilter]);

  const display = searchFilter ? filtered : articles;
  const breachCount = display.filter(a => a.severity.level === "BREACH").length;
  const criticalCount = display.filter(a => a.severity.level === "CRITICAL").length;
  const highCount = display.filter(a => a.severity.level === "HIGH").length;
  const activeFeedCount = Object.values(stats).filter(s => s.status === "ok").length;

  // Hide channel entirely if search is active and no matches
  if (searchFilter && display.length === 0) return null;

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Channel header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => navigate(channel.path)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            width: 28, height: 28, borderRadius: 6,
            background: `${channel.color}15`, color: channel.color,
            border: `1px solid ${channel.color}30`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>{channel.icon}</span>
          <div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: "var(--text-primary)",
            }}>
              {channel.label}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
              {activeFeedCount} feeds active · {display.length}{searchFilter ? ` match${display.length !== 1 ? "es" : ""}` : " items"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {breachCount > 0 && <span className="tag" style={{ background: "#e040fb15", color: "#e040fb", border: "1px solid #e040fb30" }}>{breachCount} BREACH</span>}
          {criticalCount > 0 && <span className="tag" style={{ background: "#ff2d5515", color: "#ff2d55", border: "1px solid #ff2d5530" }}>{criticalCount} CRITICAL</span>}
          {highCount > 0 && <span className="tag" style={{ background: "#ff950015", color: "#ff9500", border: "1px solid #ff950030" }}>{highCount} HIGH</span>}
          <span className="ws-badge" style={{
            background: "var(--accent-bg)",
            color: connected ? "var(--status-live)" : "var(--status-off)",
            border: "1px solid var(--accent-border)",
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: connected ? "var(--status-live)" : "var(--status-off)",
              display: "inline-block",
            }} />
            {connected ? "LIVE" : "OFF"}
          </span>
        </div>
      </div>

      {/* Top 5 articles */}
      {display.slice(0, 5).map((article, i) => (
        <div
          key={`${article.title}-${i}`}
          style={{
            padding: "10px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", gap: 12,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onClick={() => article.link && window.open(article.link, "_blank")}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Pulse color={article.severity.color} />
          <span className="tag" style={{
            background: `${article.severity.color}15`,
            color: article.severity.color,
            border: `1px solid ${article.severity.color}30`,
            minWidth: 60, textAlign: "center",
          }}>
            {article.severity.level}
          </span>
          <span className="tag" style={{
            background: `${article.trust.color}10`,
            color: article.trust.color,
            border: `1px solid ${article.trust.color}25`,
            fontSize: 8, fontWeight: 700, letterSpacing: 0.5,
          }} title={article.trust.description}>
            {article.trust.label}
          </span>
          {article.bias && article.bias.code !== "N" && (
            <span className="tag" style={{
              background: `${article.bias.color}10`,
              color: article.bias.color,
              border: `1px solid ${article.bias.color}25`,
              fontSize: 8, fontWeight: 700, letterSpacing: 0.5,
            }} title={`Political leaning: ${article.bias.label}`}>
              {article.bias.short}
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {article.title}
          </div>
          <span style={{ fontSize: 10, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
            {timeAgo(article.pubDate)}
          </span>
        </div>
      ))}

      {/* View all link */}
      <div
        style={{
          padding: "10px 20px",
          textAlign: "center",
          fontSize: 11, color: "var(--accent)",
          cursor: "pointer",
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
        onClick={() => navigate(channel.path)}
      >
        VIEW ALL {channel.label.toUpperCase()} →
      </div>
    </div>
  );
}

export default function Overview() {
  const [search, setSearch] = useState("");

  const searchLower = search.toLowerCase().trim();

  return (
    <>
      <header style={{
        padding: "20px 28px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <h1 style={{
              fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5,
            }}>
              INTEL HUB — OVERVIEW
            </h1>
            <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
              All Channels · Top Alerts · Real-Time
            </div>
          </div>
          <div style={{ position: "relative", flex: "0 1 400px" }}>
            <input
              type="text"
              placeholder="Search across all channels..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <span style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, color: "var(--text-faint)", pointerEvents: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2.5" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="7"/><line x1="16" y1="16" x2="22" y2="22"/></svg>
            </span>
            {search && (
              <span
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  fontSize: 14, color: "var(--text-faint)", cursor: "pointer",
                }}
                onClick={() => setSearch("")}
              >
                ✕
              </span>
            )}
          </div>
        </div>
      </header>

      <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        {CHANNELS.map(ch => (
          <ChannelSummary key={ch.id} channel={ch} searchFilter={searchLower} />
        ))}
      </div>
    </>
  );
}
