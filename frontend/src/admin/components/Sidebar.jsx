import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const menuItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/professors", label: "Professors", icon: "👨‍🏫" },
  { to: "/admin/departments", label: "Departments", icon: "🏛️" },
  { to: "/admin/courses", label: "Courses", icon: "📚" },
  { to: "/admin/grades", label: "Grades", icon: "📝" },
  { to: "/admin/course-registration", label: "Registration", icon: "🗓️" },
  { to: "/admin/news", label: "News", icon: "📰" },
  { to: "/admin/schedules", label: "Schedules", icon: "📅" },
  { to: "/admin/assignments", label: "Assignments", icon: "🔗" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const isStudentsActive = location.pathname.includes("/admin/students");

  // Initialize showLevels based on path, but don't force it in a useEffect so user can toggle it
  const [showLevels, setShowLevels] = useState(isStudentsActive);

  const handleToggle = (e) => {
    // If they click the text/icon, we want to both navigate AND toggle if it's currently closed
    // If they click the arrow specifically, we just toggle.
    setShowLevels(!showLevels);
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">
        🎓 SIS Portal
      </h2>

      <nav className="sidebar-menu">
        {/* Students with active link and toggle */}
        <div style={{ position: "relative" }}>
          <NavLink
            to="/admin/students"
            className={({ isActive }) => (isActive || isStudentsActive ? "active" : "")}
            onClick={handleToggle}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none"
            }}
          >
            <span>🎓</span> Students
            <span
              style={{
                marginLeft: "auto",
                padding: "2px 5px",
                fontSize: "10px",
                opacity: 0.8
              }}
            >
              {showLevels ? "▲" : "▼"}
            </span>
          </NavLink>

          {showLevels && (
            <div className="sidebar-submenu animate-in" style={{
              paddingLeft: 25,
              marginTop: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              background: "rgba(0,0,0,0.2)",
              borderRadius: "8px",
              paddingBottom: "8px"
            }}>
              {[1, 2, 3, 4].map((lvl) => (
                <NavLink
                  key={lvl}
                  to={`/admin/students/${lvl}`}
                  className={({ isActive }) => (isActive ? "sub-active" : "")}
                  style={({ isActive }) => ({
                    fontSize: "13px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    color: isActive ? "#fff" : "#94a3b8",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    display: "block",
                    background: isActive ? "rgba(255,255,255,0.1)" : "transparent"
                  })}
                >
                  └ Level {lvl}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Other menu items */}
        {menuItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        fontSize: 12,
        color: "#475569",
        textAlign: "center",
      }}>
        FCI · Arish University © 2025
      </div>
    </aside>
  );
}
