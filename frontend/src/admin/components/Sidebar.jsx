import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  FileCheck,
  Newspaper,
  Calendar,
  Link as LinkIcon,
  Settings,
  ChevronDown,
  LogOut,
  RefreshCw,
  Clock
} from "lucide-react";

const menuItems = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/professors", label: "Professors", Icon: GraduationCap },
  { to: "/admin/departments", label: "Departments", Icon: Building2 },
  { to: "/admin/courses", label: "Courses", Icon: BookOpen },
  { to: "/admin/grades", label: "Grades", Icon: FileCheck },
  { to: "/admin/course-registration", label: "Registration", Icon: Calendar },
  { to: "/admin/news", label: "News", Icon: Newspaper },
  { to: "/admin/schedules", label: "Schedules", Icon: Clock },
  { to: "/admin/assignments", label: "Assignments", Icon: LinkIcon },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar({ currentSemester, onChangeSemester, onLogout }) {
  const location = useLocation();
  const isStudentsActive = location.pathname.includes("/admin/students");
  const [showLevels, setShowLevels] = useState(isStudentsActive);

  return (
    <aside className="sidebar-v3">
      {/* Brand Section */}
      <div className="sidebar-brand-v3">
        <div className="brand-logo-small">EP</div>
        <div className="brand-hq">
          <h2 className="brand-name-v3">Edu_Point</h2>
          <span className="brand-tag-v3">SYSTEM ADMIN</span>
        </div>
      </div>

      {/* Working Context Section */}
      {currentSemester && (
        <div className="context-card-v3 animate-in" onClick={onChangeSemester}>
          <div className="context-icon-v3 bg-indigo-500/10 text-indigo-400">
            <Calendar size={18} />
          </div>
          <div className="context-info-v3">
            <p className="context-label-v3">Working Session</p>
            <h4 className="context-value-v3">{currentSemester.year} · {currentSemester.term}</h4>
          </div>
          <RefreshCw size={14} className="context-refresh-v3" />
        </div>
      )}

      {/* Main Navigation */}
      <nav className="sidebar-nav-scroll">
        <p className="nav-group-label">Core Management</p>

        {/* Students Accordion */}
        <div className={`nav-accordion ${isStudentsActive ? "expanded" : ""}`}>
          <div
            className={`nav-link-v3 ${isStudentsActive ? "active" : ""}`}
            onClick={() => setShowLevels(!showLevels)}
          >
            <Users size={18} className="link-icon-v3" />
            <span className="link-txt-v3">Students</span>
            <ChevronDown size={16} className={`chevron-v3 ${showLevels ? "rotate" : ""}`} />
          </div>

          <div className={`nav-submenu-v3 ${showLevels || isStudentsActive ? "open" : ""}`}>
            {[1, 2, 3, 4].map((lvl) => (
              <NavLink
                key={lvl}
                to={`/admin/students/${lvl}`}
                className={({ isActive }) => `submenu-link-v3 ${isActive ? "active" : ""}`}
              >
                <div className="dot-line"></div>
                Level {lvl}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Dynamic Menu Items */}
        {menuItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}
          >
            <Icon size={18} className="link-icon-v3" />
            <span className="link-txt-v3">{label}</span>
          </NavLink>
        ))}

        <div className="nav-footer-spacer"></div>
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer-v3">
        <button className="logout-btn-v3" onClick={onLogout}>
          <LogOut size={18} />
          <span>Sign Out Control</span>
        </button>
      </div>
    </aside>
  );
}
