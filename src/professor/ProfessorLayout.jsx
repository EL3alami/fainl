import { NavLink, Outlet } from "react-router-dom";
import "./ProfessorLayout.css";

export default function ProfessorLayout() {
  // In a real app, this would come from authentication/context
  const isSupervisor = localStorage.getItem("professorRole") === "supervisor" || false;

  return (
    <div className="professor-container">
      <aside className="professor-sidebar">
        <h2 className="sidebar-title">Professor Portal</h2>
        <nav className="sidebar-menu">
          <NavLink to="/professor/dashboard">Dashboard</NavLink>
          <NavLink to="/professor/courses">My Courses</NavLink>
          <NavLink to="/professor/schedule">My Schedule</NavLink>
          {isSupervisor && (
            <>
              <NavLink to="/professor/supervisor">Supervisor Panel</NavLink>
              <NavLink to="/professor/department-students">Department Students</NavLink>
            </>
          )}
        </nav>
      </aside>
      <div className="professor-content">
        <Outlet />
      </div>
    </div>
  );
}
