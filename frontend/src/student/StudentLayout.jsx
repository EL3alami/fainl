import { NavLink, Outlet } from "react-router-dom";
import "./StudentLayout.css";

export default function StudentLayout() {
  return (
    <div className="student-container">
      <aside className="student-sidebar">
        <h2 className="sidebar-title">Student Portal</h2>
        <nav className="sidebar-menu">
          <NavLink to="/student/dashboard">Dashboard</NavLink>
          <NavLink to="/student/courses">Course Registration</NavLink>
          <NavLink to="/student/grades">My Grades</NavLink>
          <NavLink to="/student/schedule">Class Schedule</NavLink>
        </nav>
      </aside>
      <div className="student-content">
        <Outlet />
      </div>
    </div>
  );
}
