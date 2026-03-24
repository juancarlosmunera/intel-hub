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
  { id: "cyber", label: "Cybersecurity", icon: "🛡", color: "#00ff88", path: "/cyber", keywords: CYBER_KW },
  { id: "world", label: "World News", icon: "🌐", color: "#64d2ff", path: "/world", keywords: WORLD_KW },
  { id: "geopolitics", label: "Geopolitics", icon: "⚔", color: "#ff6b35", path: "/geopolitics", keywords: [...WORLD_KW, "Iran", "CENTCOM", "airstrike", "missile", "NATO", "escalation", "ceasefire", "nuclear", "sanctions"] },
  { id: "osint", label: "OSINT", icon: "🔍", color: "#ff9500", path: "/osint", keywords: OSINT_KW },
  { id: "darkweb", label: "Dark Web", icon: "👁", color: "#ff2255", path: "/darkweb", keywords: DARKWEB_KW },
  { id: "social", label: "Social Media", icon: "📡", color: "#7c4dff", path: "/social", keywords: SOCIAL_KW },
  { id: "chatfeeds", label: "Chat Feeds", icon: "💬", color: "#00d4aa", path: "/chatfeeds", keywords: CHAT_KW },
];

function ChannelSummary({ channel }) {
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

  const breachCount = articles.filter(a => a.severity.level === "BREACH").length;
  const criticalCount = articles.filter(a => a.severity.level === "CRITICAL").length;
  const highCount = articles.filter(a => a.severity.level === "HIGH").length;
  const activeFeedCount = Object.values(stats).filter(s => s.status === "ok").length;

  return (
    <div style={{
      background: "linear-gradient(135deg, #0c1220 0%, #101b2d 100%)",
      border: "1px solid #1a2436",
      borderRadius: 12,
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Channel header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #111a28",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => navigate(channel.path)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{channel.icon}</span>
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14, fontWeight: 700, color: "#e8edf2",
            }}>
              {channel.label}
            </div>
            <div style={{ fontSize: 10, color: "#3a4a5e" }}>
              {activeFeedCount} feeds active · {articles.length} items
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {breachCount > 0 && <span className="tag" style={{ background: "#e040fb15", color: "#e040fb", border: "1px solid #e040fb30" }}>{breachCount} BREACH</span>}
          {criticalCount > 0 && <span className="tag" style={{ background: "#ff2d5515", color: "#ff2d55", border: "1px solid #ff2d5530" }}>{criticalCount} CRITICAL</span>}
          {highCount > 0 && <span className="tag" style={{ background: "#ff950015", color: "#ff9500", border: "1px solid #ff950030" }}>{highCount} HIGH</span>}
          <span className="ws-badge" style={{
            background: connected ? `${channel.color}15` : "#ff2d5515",
            color: connected ? channel.color : "#ff2d55",
            border: `1px solid ${connected ? `${channel.color}30` : "#ff2d5530"}`,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: connected ? channel.color : "#ff2d55",
              display: "inline-block",
            }} />
            {connected ? "LIVE" : "OFF"}
          </span>
        </div>
      </div>

      {/* Top 5 articles */}
      {articles.slice(0, 5).map((article, i) => (
        <div
          key={`${article.title}-${i}`}
          style={{
            padding: "10px 20px",
            borderBottom: "1px solid #0d1422",
            display: "flex", alignItems: "center", gap: 12,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onClick={() => article.link && window.open(article.link, "_blank")}
          onMouseEnter={e => e.currentTarget.style.background = "#0d1422"}
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
          <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: "#dce3ea", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {article.title}
          </div>
          <span style={{ fontSize: 10, color: "#3a4a5e", whiteSpace: "nowrap" }}>
            {timeAgo(article.pubDate)}
          </span>
        </div>
      ))}

      {/* View all link */}
      <div
        style={{
          padding: "10px 20px",
          textAlign: "center",
          fontSize: 11, color: channel.color,
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
  return (
    <>
      <header style={{
        padding: "20px 28px 16px",
        borderBottom: "1px solid #111a28",
        background: "linear-gradient(180deg, #0c1220 0%, #0a0e17 100%)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 18, fontWeight: 700, color: "#e8edf2", letterSpacing: -0.5,
        }}>
          INTEL HUB — OVERVIEW
        </h1>
        <div style={{ fontSize: 10, color: "#3a4a5e", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
          All Channels · Top Alerts · Real-Time
        </div>
      </header>

      <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        {CHANNELS.map(ch => (
          <ChannelSummary key={ch.id} channel={ch} />
        ))}
      </div>
    </>
  );
}
