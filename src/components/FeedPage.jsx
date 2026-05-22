import { useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import { classifySeverity, matchesKeywords, getSourceTrust, getSourceBias, detectRedFlags } from "../utils/classify";
import { SEVERITY_RANK } from "../constants/severity";
import StatCards from "./StatCards";
import ArticleList from "./ArticleList";

export default function FeedPage({ channel, title, subtitle, feeds, alertKeywords, accentColor = "#00ff88" }) {
  const { articles: rawArticles, stats: feedStats, loading, error, connected, lastRefresh, requestRefresh } = useWebSocket(channel);

  const [filter, setFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hideFlagged, setHideFlagged] = useState(false);
  const [sortMode, setSortMode] = useState("latest"); // "latest" | "severity"

  const articles = rawArticles.map(item => {
    const fullText = `${item.title} ${item.description || ""}`;
    const severity = classifySeverity(fullText);
    const matched = matchesKeywords(fullText, alertKeywords);
    const trust = getSourceTrust(item.feedName);
    const redFlags = detectRedFlags(fullText);
    const bias = getSourceBias(item.feedName);
    return { ...item, cleanDescription: item.description || "", severity, matchedKeywords: matched, isAlert: matched.length > 0, trust, redFlags, bias };
  });

  const categories = ["ALL", ...new Set(feeds.map(f => f.category))];

  const flaggedCount = articles.filter(a => a.redFlags.length > 0).length;
  const unverifiedCount = articles.filter(a => a.trust.tier >= 4).length;

  const filtered = articles.filter(a => {
    if (severityFilter && a.severity.level !== severityFilter) return false;
    if (filter !== "ALL" && a.feedCategory !== filter) return false;
    if (alertsOnly && !a.isAlert) return false;
    if (verifiedOnly && a.trust.tier > 2) return false;
    if (hideFlagged && a.redFlags.length > 0) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return a.title.toLowerCase().includes(s)
        || a.cleanDescription.toLowerCase().includes(s)
        || (a.feedName && a.feedName.toLowerCase().includes(s));
    }
    return true;
  }).sort((a, b) => {
    // Clamp future-dated articles to "now" so they don't sort above present ones
    const now = Date.now();
    const ta = Math.min(new Date(a.pubDate).getTime(), now);
    const tb = Math.min(new Date(b.pubDate).getTime(), now);
    const ra = SEVERITY_RANK[a.severity.level] ?? 4;
    const rb = SEVERITY_RANK[b.severity.level] ?? 4;

    if (sortMode === "severity") {
      const aUrgent = ra <= 1 ? 0 : 1;
      const bUrgent = rb <= 1 ? 0 : 1;
      if (aUrgent !== bUrgent) return aUrgent - bUrgent;
      if (aUrgent === 0 && bUrgent === 0 && ra !== rb) return ra - rb;
      return tb - ta;
    }
    // sortMode === "latest" — newest first; severity rank breaks ties
    if (tb !== ta) return tb - ta;
    return ra - rb;
  });

  const activeFeedCount = Object.values(feedStats).filter(s => s.status === "ok").length;

  return (
    <>
      <header style={{
        padding: "20px 28px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{
              fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5, lineHeight: 1.2,
            }}>
              {title}
            </h1>
            <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: 1, textTransform: "uppercase" }}>
              {subtitle}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="ws-badge" style={{
              background: "var(--accent-bg)",
              color: connected ? "var(--status-live)" : "var(--status-off)",
              border: "1px solid var(--accent-border)",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: connected ? "var(--status-live)" : "var(--status-off)",
                display: "inline-block",
              }} />
              {connected ? "LIVE" : "OFFLINE"}
            </span>

            <button
              onClick={requestRefresh}
              disabled={!connected}
              style={{
                padding: "7px 16px", borderRadius: 6,
                border: "1px solid var(--accent)", background: "var(--accent-bg)",
                color: connected ? "var(--accent)" : "var(--text-faint)",
                fontFamily: "inherit", fontSize: 11,
                fontWeight: 600, cursor: connected ? "pointer" : "not-allowed",
                letterSpacing: 0.5, opacity: connected ? 1 : 0.5,
              }}
            >
              {loading ? "SCANNING..." : "REFRESH"}
            </button>
            {lastRefresh && (
              <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
                {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <div style={{ padding: "20px 28px" }}>
        <StatCards
          articles={articles}
          feedCount={feeds.length}
          activeFeedCount={activeFeedCount}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          setAlertsOnly={setAlertsOnly}
        />

        {/* CONTROLS */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "0 1 320px" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2.5" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="7"/><line x1="16" y1="16" x2="22" y2="22"/></svg>
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

          <div style={{
            display: "flex", alignItems: "center", gap: 0,
            border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden",
          }} title="Choose sort order">
            <span style={{ fontSize: 9, color: "var(--text-faint)", padding: "0 8px 0 10px", letterSpacing: 0.5, textTransform: "uppercase" }}>
              Sort
            </span>
            <button
              onClick={() => setSortMode("latest")}
              style={{
                padding: "6px 12px", fontSize: 10, fontFamily: "inherit",
                border: "none", borderLeft: "1px solid var(--border)", cursor: "pointer",
                background: sortMode === "latest" ? "var(--accent-bg)" : "transparent",
                color: sortMode === "latest" ? "var(--accent-strong)" : "var(--text-muted)",
                fontWeight: sortMode === "latest" ? 700 : 500, letterSpacing: 0.5,
              }}
            >
              LATEST
            </button>
            <button
              onClick={() => setSortMode("severity")}
              style={{
                padding: "6px 12px", fontSize: 10, fontFamily: "inherit",
                border: "none", borderLeft: "1px solid var(--border)", cursor: "pointer",
                background: sortMode === "severity" ? "#ff2d5520" : "transparent",
                color: sortMode === "severity" ? "#ff2d55" : "var(--text-muted)",
                fontWeight: sortMode === "severity" ? 700 : 500, letterSpacing: 0.5,
              }}
            >
              SEVERITY
            </button>
          </div>
        </div>

        {/* FEED STATUS BAR */}
        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16,
          padding: "10px 16px", background: "var(--bg-surface)", borderRadius: 6,
          border: "1px solid var(--border-subtle)", fontSize: 10,
        }}>
          {feeds.map(feed => (
            <div
              key={feed.name}
              style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setSearchTerm(searchTerm === feed.name ? "" : feed.name)}
              title={`Click to filter by ${feed.name}`}
            >
              <span className="feed-status-dot" style={{
                background: feedStats[feed.name]?.status === "ok" ? "var(--status-live)" : feedStats[feed.name]?.status === "error" ? "var(--status-off)" : "var(--text-faint)"
              }} />
              {feed.name}
              {feedStats[feed.name]?.status === "ok" && (
                <span style={{ marginLeft: 4, color: "var(--text-faint)" }}>({feedStats[feed.name].count})</span>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            padding: "12px 16px", marginBottom: 16, borderRadius: 6,
            background: "var(--accent-bg)", border: "1px solid var(--status-off)", color: "var(--status-off)", fontSize: 12,
          }}>
            {error}
          </div>
        )}

        {loading && articles.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-faint)" }}>
            <div style={{ fontSize: 14, marginBottom: 12, letterSpacing: 2, color: "var(--text-faint)" }}>///</div>
            <div style={{ fontSize: 12, letterSpacing: 1 }}>SCANNING FEEDS...</div>
          </div>
        ) : (
          <ArticleList filtered={filtered} severityFilter={severityFilter} setSeverityFilter={setSeverityFilter} sortMode={sortMode} />
        )}
      </div>
    </>
  );
}
