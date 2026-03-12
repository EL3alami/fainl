import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import "./ProfessorLayout.css";

export default function ProfessorLayout() {
  const navigate = useNavigate();
  const [professor, setProfessor] = useState(null);
  const isSupervisor = localStorage.getItem("professorRole") === "supervisor" || false;

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setProfessor(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="professor-container-v3">
      {/* PROFESSOR SIDEBAR V3 */}
      <aside className="professor-sidebar-v3">
        <div className="brand-section-v3" onClick={() => navigate("/")}>
          <div className="brand-logo-v3">EP</div>
          <div className="brand-texts-v3">
            <h2 className="brand-name-v3">Edu_Point</h2>
            <span className="brand-sub-v3">FACULTY HUB</span>
          </div>
        </div>

        <nav className="professor-nav-v3">
          <p className="nav-group-v3">Academic Management</p>
          <NavLink to="/professor/dashboard" className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/professor/courses" className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}>
            <BookOpen size={18} />
            <span>My Courses</span>
          </NavLink>
          <NavLink to="/professor/schedule" className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}>
            <Clock size={18} />
            <span>Schedule</span>
          </NavLink>

          {isSupervisor && (
            <>
              <p className="nav-group-v3" style={{ marginTop: '20px' }}>Supervisor Tools</p>
              <NavLink to="/professor/supervisor" className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}>
                <ShieldCheck size={18} />
                <span>Panel Controls</span>
              </NavLink>
              <NavLink to="/professor/department-students" className={({ isActive }) => `nav-link-v3 ${isActive ? "active" : ""}`}>
                <Users size={18} />
                <span>Dept. Students</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer-v3">
          <button className="professor-logout-v3" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out Hub</span>
          </button>
        </div>
      </aside>

      {/* PROFESSOR MAIN CONTENT */}
      <div className="professor-content-v3">
        {/* PROFESSOR TOP BAR */}
        <header className="professor-top-bar-v3">
          <div className="top-search-v3">
            <Search size={16} />
            <input type="text" placeholder="Search students, courses..." />
          </div>

          <div className="top-actions-v3">
            <button className="top-icon-btn-v3"><Bell size={18} /></button>
            <div className="professor-user-profile-v3">
              <div className="user-info-v3">
                <span className="user-name-v3">{professor?.name_en || 'Professor Portal'}</span>
                <span className="user-role-v3">{isSupervisor ? 'Department Supervisor' : 'Academic Professor'}</span>
              </div>
              <div className="user-avatar-v3">
                {professor?.name_en?.charAt(0) || 'P'}
              </div>
            </div>
          </div>
        </header>

        <main className="professor-page-canvas">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
