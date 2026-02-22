import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
