import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", icon: "⬡", label: "Overview" },
  { to: "/cyber", icon: "🛡", label: "Cybersecurity" },
  { to: "/world", icon: "🌐", label: "World News" },
  { to: "/osint", icon: "🔍", label: "OSINT" },
  { to: "/darkweb", icon: "👁", label: "Dark Web" },
  { to: "/social", icon: "📡", label: "Social Media" },
  { to: "/chatfeeds", icon: "💬", label: "Chat Feeds" },
];

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "#0a0e17",
            }}>⬡</div>
            <div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14, fontWeight: 700, color: "#e8edf2", letterSpacing: -0.3,
              }}>
                INTEL HUB
              </div>
              <div style={{ fontSize: 9, color: "#3a4a5e", letterSpacing: 1, textTransform: "uppercase" }}>
                Monitoring Dashboard
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #111a28", marginTop: "auto" }}>
          <div style={{ fontSize: 9, color: "#2a3a4e", letterSpacing: 0.5 }}>
            INTEL HUB v2.0
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
