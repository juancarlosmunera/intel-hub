export default function StatCards({ articles, feedCount, activeFeedCount, severityFilter, setSeverityFilter, setAlertsOnly }) {
  const breachCount = articles.filter(a => a.severity.level === "BREACH").length;
  const criticalCount = articles.filter(a => a.severity.level === "CRITICAL").length;
  const highCount = articles.filter(a => a.severity.level === "HIGH").length;
  const alertCount = articles.filter(a => a.isAlert).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
      <div className="stat-card" onClick={() => setSeverityFilter(null)}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#00ff88" }} />
        <div style={{ fontSize: 10, color: "#4a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Feeds Active</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#00ff88", fontFamily: "'Space Grotesk', sans-serif" }}>
          {activeFeedCount}<span style={{ fontSize: 14, color: "#3a4a5e" }}>/{feedCount}</span>
        </div>
      </div>
      <div className={`stat-card${severityFilter === "BREACH" ? " active-filter" : ""}`} onClick={() => setSeverityFilter(severityFilter === "BREACH" ? null : "BREACH")} style={{ color: "#e040fb" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#e040fb" }} />
        <div style={{ fontSize: 10, color: "#4a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Breaches</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#e040fb", fontFamily: "'Space Grotesk', sans-serif" }}>{breachCount}</div>
      </div>
      <div className={`stat-card${severityFilter === "CRITICAL" ? " active-filter" : ""}`} onClick={() => setSeverityFilter(severityFilter === "CRITICAL" ? null : "CRITICAL")} style={{ color: "#ff2d55" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#ff2d55" }} />
        <div style={{ fontSize: 10, color: "#4a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Critical</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#ff2d55", fontFamily: "'Space Grotesk', sans-serif" }}>{criticalCount}</div>
      </div>
      <div className={`stat-card${severityFilter === "HIGH" ? " active-filter" : ""}`} onClick={() => setSeverityFilter(severityFilter === "HIGH" ? null : "HIGH")} style={{ color: "#ff9500" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#ff9500" }} />
        <div style={{ fontSize: 10, color: "#4a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>High</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#ff9500", fontFamily: "'Space Grotesk', sans-serif" }}>{highCount}</div>
      </div>
      <div className="stat-card" onClick={() => { setSeverityFilter(null); setAlertsOnly(true); }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#64d2ff" }} />
        <div style={{ fontSize: 10, color: "#4a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Keyword Alerts</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#64d2ff", fontFamily: "'Space Grotesk', sans-serif" }}>{alertCount}</div>
      </div>
      <div className="stat-card" onClick={() => { setSeverityFilter(null); setAlertsOnly(false); }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#5e5ce6" }} />
        <div style={{ fontSize: 10, color: "#4a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Total Items</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#5e5ce6", fontFamily: "'Space Grotesk', sans-serif" }}>{articles.length}</div>
      </div>
    </div>
  );
}
