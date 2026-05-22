export default function StatCards({ articles, feedCount, activeFeedCount, severityFilter, setSeverityFilter, setAlertsOnly }) {
  const breachCount = articles.filter(a => a.severity.level === "BREACH").length;
  const criticalCount = articles.filter(a => a.severity.level === "CRITICAL").length;
  const highCount = articles.filter(a => a.severity.level === "HIGH").length;
  const alertCount = articles.filter(a => a.isAlert).length;

  const labelStyle = {
    fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase",
    letterSpacing: 1, marginBottom: 4,
  };
  const numStyle = { fontSize: 26, fontWeight: 700 };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
      <div className="stat-card" onClick={() => setSeverityFilter(null)}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--status-live)" }} />
        <div style={labelStyle}>Feeds Active</div>
        <div style={{ ...numStyle, color: "var(--status-live)" }}>
          {activeFeedCount}<span style={{ fontSize: 14, color: "var(--text-faint)" }}>/{feedCount}</span>
        </div>
      </div>
      <div className={`stat-card${severityFilter === "BREACH" ? " active-filter" : ""}`} onClick={() => setSeverityFilter(severityFilter === "BREACH" ? null : "BREACH")} style={{ color: "#c41e3a" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#c41e3a" }} />
        <div style={labelStyle}>Breaches</div>
        <div style={{ ...numStyle, color: "#c41e3a" }}>{breachCount}</div>
      </div>
      <div className={`stat-card${severityFilter === "CRITICAL" ? " active-filter" : ""}`} onClick={() => setSeverityFilter(severityFilter === "CRITICAL" ? null : "CRITICAL")} style={{ color: "#ff2d55" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#ff2d55" }} />
        <div style={labelStyle}>Critical</div>
        <div style={{ ...numStyle, color: "#ff2d55" }}>{criticalCount}</div>
      </div>
      <div className={`stat-card${severityFilter === "HIGH" ? " active-filter" : ""}`} onClick={() => setSeverityFilter(severityFilter === "HIGH" ? null : "HIGH")} style={{ color: "#ff9500" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#ff9500" }} />
        <div style={labelStyle}>High</div>
        <div style={{ ...numStyle, color: "#ff9500" }}>{highCount}</div>
      </div>
      <div className="stat-card" onClick={() => { setSeverityFilter(null); setAlertsOnly(true); }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--accent)" }} />
        <div style={labelStyle}>Keyword Alerts</div>
        <div style={{ ...numStyle, color: "var(--text-primary)" }}>{alertCount}</div>
      </div>
      <div className="stat-card" onClick={() => { setSeverityFilter(null); setAlertsOnly(false); }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--accent)" }} />
        <div style={labelStyle}>Total Items</div>
        <div style={{ ...numStyle, color: "var(--text-primary)" }}>{articles.length}</div>
      </div>
    </div>
  );
}
