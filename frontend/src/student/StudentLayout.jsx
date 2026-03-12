import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import {
  LayoutDashboard,
  CalendarCheck,
  BookMarked,
  Clock,
  LogOut,
  Bell,
  User as UserIcon,
  Search,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import "./StudentLayout.css";

export default function StudentLayout() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    // Get student session (from auth or studentAuth logic)
    const session = JSON.parse(sessionStorage.getItem("student_session") || "null");
    if (session) setStudent(session);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("student_session");
    navigate("/");
  };

  return (
    <div className="student-container-v3">
      {/* STUDENT SIDEBAR V3 */}
      <aside className="student-sidebar-v3">
        <div className="brand-section-v3" onClick={() => navigate("/")}>
          <div className="brand-logo-v3">EP</div>
          <div className="brand-texts-v3">
            <h2 className="brand-name-v3">Edu_Point</h2>
            <span className="brand-sub-v3">STUDENT HUB</span>
          </div>
        </div>

        <nav className="student-nav-v3">
          <p className="nav-group-v3">Main Menu</p>
          <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/student/courses" className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}>
            <CalendarCheck size={18} />
            <span>Registration</span>
          </NavLink>
          <NavLink to="/student/grades" className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}>
            <BookMarked size={18} />
            <span>My Grades</span>
          </NavLink>
          <NavLink to="/student/schedule" className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}>
            <Clock size={18} />
            <span>Schedule</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer-v3">
          <button className="student-logout-v3" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out Hub</span>
          </button>
        </div>
      </aside>

      {/* STUDENT MAIN CONTENT */}
      <div className="student-content-v3">
        {/* STUDENT TOP BAR */}
        <header className="student-top-bar-v3">
          <div className="top-search-v3">
            <Search size={16} />
            <input type="text" placeholder="Search courses, grades..." />
          </div>

          <div className="top-actions-v3">
            <button className="top-icon-btn-v3"><Bell size={18} /></button>
            <div className="student-user-profile-v3">
              <div className="user-info-v3">
                <span className="user-name-v3">{student?.name_en || 'Student Portal'}</span>
                <span className="user-role-v3">Academic Student</span>
              </div>
              <div className="user-avatar-v3">
                {student?.name_en?.charAt(0) || <UserIcon size={18} />}
              </div>
            </div>
          </div>
        </header>

        <main className="student-page-canvas">
          <Outlet />
        </main>
      </div>

      <ChatbotWidget />
    </div>
  );
}
