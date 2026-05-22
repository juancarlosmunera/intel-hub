import { NavLink, Outlet } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { to: "/", icon: "OV", label: "Overview" },
  { to: "/cyber", icon: "CS", label: "Cybersecurity" },
  { to: "/world", icon: "WN", label: "World News" },
  { to: "/osint", icon: "OS", label: "OSINT" },
  { to: "/darkweb", icon: "DW", label: "Dark Web" },
  { to: "/social", icon: "SM", label: "Social Media" },
  { to: "/chatfeeds", icon: "CF", label: "Chat Feeds" },
];

export default function Layout() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#ffffff", letterSpacing: 0.5,
            }}>IH</div>
            <div>
              <div style={{
                fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.3,
              }}>
                INTEL HUB
              </div>
              <div style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: 1, textTransform: "uppercase" }}>
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

        <div style={{
          padding: "16px 20px", borderTop: "1px solid var(--border-subtle)", marginTop: "auto",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}>
          <div style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: 0.5 }}>
            INTEL HUB v2.0
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
