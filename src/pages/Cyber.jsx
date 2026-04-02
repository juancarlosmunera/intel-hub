import { useState, useCallback, useRef, useEffect } from "react";
import useWebSocket from "../hooks/useWebSocket";
import { classifySeverity, matchesKeywords, getSourceTrust, detectRedFlags } from "../utils/classify";
import { SEVERITY_RANK } from "../constants/severity";
import { FEEDS, ALERT_KEYWORDS } from "../constants/cyberFeeds";
import StatCards from "../components/StatCards";
import ArticleList from "../components/ArticleList";

async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

function sendUrgentNotification(article) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const level = article.severity.level;
  const notif = new Notification(`${level}: CyberSec Alert`, {
    body: article.title,
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 10 L85 30 V55 C85 75 50 90 50 90 C50 90 15 75 15 55 V30 Z' fill='%2300ff88' opacity='0.9'/></svg>",
    tag: `${level}-${article.title.slice(0, 40)}`,
    requireInteraction: true,
  });
  notif.onclick = () => {
    window.focus();
    if (article.link) window.open(article.link, "_blank");
    notif.close();
  };
}

export default function Cyber() {
  const { articles: rawArticles, stats: feedStats, loading, error, connected, lastRefresh, requestRefresh } = useWebSocket("cyber");

  const [filter, setFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hideFlagged, setHideFlagged] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  const seenTitlesRef = useRef(new Set());

  // Process articles
  const articles = rawArticles.map(item => {
    const fullText = `${item.title} ${item.description || ""}`;
    const severity = classifySeverity(fullText);
    const matched = matchesKeywords(fullText, ALERT_KEYWORDS);
    const trust = getSourceTrust(item.feedName);
    const redFlags = detectRedFlags(fullText);
    return { ...item, cleanDescription: item.description || "", severity, matchedKeywords: matched, isAlert: matched.length > 0, trust, redFlags };
  });

  // Push notifications for new BREACH/CRITICAL
  useEffect(() => {
    if (Notification.permission !== "granted") return;
    const urgentLevels = new Set(["BREACH", "CRITICAL"]);
    for (const article of articles) {
      if (urgentLevels.has(article.severity.level) && !seenTitlesRef.current.has(article.title)) {
        sendUrgentNotification(article);
      }
      seenTitlesRef.current.add(article.title);
    }
  }, [articles]);

  const enableNotifications = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
  }, []);

  const categories = ["ALL", ...new Set(FEEDS.map(f => f.category))];

  const flaggedCount = articles.filter(a => a.redFlags.length > 0).length;

  const filtered = articles.filter(a => {
    if (severityFilter && a.severity.level !== severityFilter) return false;
    if (filter !== "ALL" && a.feedCategory !== filter) return false;
    if (alertsOnly && !a.isAlert) return false;
    if (verifiedOnly && a.trust.tier > 2) return false;
    if (hideFlagged && a.redFlags.length > 0) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return a.title.toLowerCase().includes(s) || a.cleanDescription.toLowerCase().includes(s);
    }
    return true;
  }).sort((a, b) => {
    const ra = SEVERITY_RANK[a.severity.level] ?? 4;
    const rb = SEVERITY_RANK[b.severity.level] ?? 4;
    const aUrgent = ra <= 1 ? 0 : 1;
    const bUrgent = rb <= 1 ? 0 : 1;
    if (aUrgent !== bUrgent) return aUrgent - bUrgent;
    if (aUrgent === 0 && bUrgent === 0 && ra !== rb) return ra - rb;
    return new Date(b.pubDate) - new Date(a.pubDate);
  });

  const activeFeedCount = Object.values(feedStats).filter(s => s.status === "ok").length;

  return (
    <>
      {/* PAGE HEADER */}
      <header style={{
        padding: "20px 28px 16px",
        borderBottom: "1px solid #111a28",
        background: "linear-gradient(180deg, #0c1220 0%, #0a0e17 100%)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 18, fontWeight: 700, color: "#e8edf2", letterSpacing: -0.5, lineHeight: 1.2,
            }}>
              CYBERSEC MONITOR
            </h1>
            <div style={{ fontSize: 10, color: "#3a4a5e", letterSpacing: 1, textTransform: "uppercase" }}>
              PCI · Fintech · Payments · Threat Intel
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="ws-badge" style={{
              background: connected ? "#00ff8815" : "#ff2d5515",
              color: connected ? "#00ff88" : "#ff2d55",
              border: `1px solid ${connected ? "#00ff8830" : "#ff2d5530"}`,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: connected ? "#00ff88" : "#ff2d55",
                display: "inline-block",
              }} />
              {connected ? "LIVE" : "OFFLINE"}
            </span>

            {notifPermission !== "granted" && notifPermission !== "unsupported" && (
              <button onClick={enableNotifications} className="filter-btn" style={{ fontSize: 10 }} title="Enable browser notifications for CRITICAL alerts">
                ENABLE ALERTS
              </button>
            )}
            {notifPermission === "granted" && (
              <span className="ws-badge" style={{ background: "#5e5ce615", color: "#8e8ce6", border: "1px solid #5e5ce630" }}>
                NOTIFS ON
              </span>
            )}

            <button
              onClick={requestRefresh}
              disabled={!connected}
              style={{
                padding: "7px 16px", borderRadius: 6,
                border: "1px solid #00ff8840", background: "#00ff8810",
                color: connected ? "#00ff88" : "#3a4a5e",
                fontFamily: "inherit", fontSize: 11,
                fontWeight: 600, cursor: connected ? "pointer" : "not-allowed",
                letterSpacing: 0.5, opacity: connected ? 1 : 0.5,
              }}
            >
              {loading ? "SCANNING..." : "REFRESH"}
            </button>
            {lastRefresh && (
              <span style={{ fontSize: 10, color: "#3a4a5e" }}>
                {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <div style={{ padding: "20px 28px" }}>
        <StatCards
          articles={articles}
          feedCount={FEEDS.length}
          activeFeedCount={activeFeedCount}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          setAlertsOnly={setAlertsOnly}
        />

        {/* CONTROLS */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "0 1 320px" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3a4a5e" strokeWidth="2.5" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="7"/><line x1="16" y1="16" x2="22" y2="22"/></svg>
            <input
              className="search-input"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {categories.map(cat => (
              <button key={cat} className={`filter-btn ${filter === cat ? "active" : ""}`} onClick={() => setFilter(cat)}>
                {cat}
              </button>
            ))}
          </div>

          <button
            className={`filter-btn ${alertsOnly ? "active" : ""}`}
            onClick={() => setAlertsOnly(!alertsOnly)}
            style={alertsOnly ? { background: "#ff950020", borderColor: "#ff9500", color: "#ff9500" } : {}}
          >
            Alerts Only
          </button>

          <button
            className={`filter-btn ${verifiedOnly ? "active" : ""}`}
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            style={verifiedOnly ? { background: "#00ff8820", borderColor: "#00ff88", color: "#00ff88" } : {}}
            title="Show only Tier 1 (Primary) and Tier 2 (Verified) sources"
          >
            Verified Only
          </button>

          {flaggedCount > 0 && (
            <button
              className={`filter-btn ${hideFlagged ? "active" : ""}`}
              onClick={() => setHideFlagged(!hideFlagged)}
              style={hideFlagged ? { background: "#ff2d5520", borderColor: "#ff2d55", color: "#ff2d55" } : {}}
              title={`Hide ${flaggedCount} articles with content red flags`}
            >
              Hide Flagged ({flaggedCount})
            </button>
          )}
        </div>

        {/* FEED STATUS BAR */}
        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16,
          padding: "10px 16px", background: "#0c1220", borderRadius: 6,
          border: "1px solid #111a28", fontSize: 10,
        }}>
          {FEEDS.map(feed => (
            <div
              key={feed.name}
              style={{ display: "flex", alignItems: "center", color: "#4a5a6e", cursor: "pointer" }}
              onClick={() => setSearchTerm(searchTerm === feed.name ? "" : feed.name)}
              title={`Click to filter by ${feed.name}`}
            >
              <span className="feed-status-dot" style={{
                background: feedStats[feed.name]?.status === "ok" ? "#00ff88" : feedStats[feed.name]?.status === "error" ? "#ff2d55" : "#3a4a5e"
              }} />
              {feed.name}
              {feedStats[feed.name]?.status === "ok" && (
                <span style={{ marginLeft: 4, color: "#2a3a4e" }}>({feedStats[feed.name].count})</span>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            padding: "12px 16px", marginBottom: 16, borderRadius: 6,
            background: "#ff2d5510", border: "1px solid #ff2d5530", color: "#ff6b8a", fontSize: 12,
          }}>
            {error}
          </div>
        )}

        {loading && articles.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#2a3a4e" }}>
            <div style={{ fontSize: 14, marginBottom: 12, letterSpacing: 2, color: "#3a4a5e" }}>///</div>
            <div style={{ fontSize: 12, letterSpacing: 1 }}>SCANNING FEEDS...</div>
          </div>
        ) : (
          <ArticleList filtered={filtered} severityFilter={severityFilter} setSeverityFilter={setSeverityFilter} />
        )}

        {/* KEYWORD CONFIG */}
        <div style={{
          marginTop: 20, padding: 20,
          background: "#0c1220", border: "1px solid #111a28", borderRadius: 8,
        }}>
          <div style={{ fontSize: 10, color: "#3a4a5e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Active Alert Keywords ({ALERT_KEYWORDS.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {ALERT_KEYWORDS.map((kw, i) => (
              <span key={i} className="keyword-pill">{kw}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
