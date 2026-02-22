import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Sidebar() {
  const [showLevels, setShowLevels] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/admin/students") setShowLevels(true);
    else setShowLevels(false);
  }, [location]);

  const containerRef = useRef(null);

  const handleStudentsClick = (e) => {
    e && e.preventDefault();
    setShowLevels((s) => !s);
    navigate("/admin/students");
  };

  useEffect(() => {
    const onDocClick = (ev) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(ev.target)) {
        setShowLevels(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const submenuStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingLeft: 12,
    marginTop: 8,
  };

  const smallLinkStyle = { fontSize: 14, color: "#333", textDecoration: "none" };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>

      <nav className="sidebar-menu">
        <NavLink to="/admin/dashboard">Dashboard</NavLink>

        <div ref={containerRef} style={{ position: "relative" }}>
          <a href="#" onClick={handleStudentsClick} style={{ display: "block" }}>
            Students
          </a>

          {showLevels && (
            <div
              style={{
                position: "absolute",
                left: "100%",
                top: 0,
                width: 180,
                background: "white",
                border: "1px solid #ddd",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                padding: 12,
                borderRadius: 8,
                zIndex: 60,
              }}
            >
              <NavLink onClick={() => setShowLevels(false)} style={smallLinkStyle} to="/admin/students/Level%201">Level 1</NavLink>
              <NavLink onClick={() => setShowLevels(false)} style={smallLinkStyle} to="/admin/students/Level%202">Level 2</NavLink>
              <NavLink onClick={() => setShowLevels(false)} style={smallLinkStyle} to="/admin/students/Level%203">Level 3</NavLink>
              <NavLink onClick={() => setShowLevels(false)} style={smallLinkStyle} to="/admin/students/Level%204">Level 4</NavLink>
            </div>
          )}
        </div>

        <NavLink to="/admin/professors">Professors</NavLink>
        <NavLink to="/admin/departments">Departments</NavLink>
        <NavLink to="/admin/courses">Courses</NavLink>
        <NavLink to="/admin/grades">Grades</NavLink>
        <NavLink to="/admin/course-registration">Course Registration</NavLink>
        <NavLink to="/admin/news">News</NavLink>
        <NavLink to="/admin/schedules">Schedules</NavLink>
        <NavLink to="/admin/settings">Settings</NavLink>
      </nav>
    </aside>
  );
}

