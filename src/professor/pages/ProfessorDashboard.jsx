import { useState, useEffect } from "react";
import "../ProfessorLayout.css";

export default function ProfessorDashboard() {
  const [professorInfo, setProfessorInfo] = useState({
    name: "Dr. Ali Hassan",
    id: "PROF001",
    email: "ali@uni.edu",
    department: "Computer Science",
    role: "Professor", // or "Supervisor"
  });

  const [myCourses, setMyCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    // Load professor's courses
    const allCourses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
    const professorCourses = allCourses.filter(
      (c) => c.professor === professorInfo.name
    );
    setMyCourses(professorCourses);
    setTotalStudents(professorCourses.length);
  }, []);

  return (
    <div className="admin-page">
      <h1>Professor Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0, color: "#667eea" }}>Professor Information</h3>
          <p><strong>Name:</strong> {professorInfo.name}</p>
          <p><strong>ID:</strong> {professorInfo.id}</p>
          <p><strong>Department:</strong> {professorInfo.department}</p>
          <p><strong>Role:</strong> {professorInfo.role}</p>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0, color: "#667eea" }}>Quick Stats</h3>
          <p><strong>My Courses:</strong> {myCourses.length}</p>
          <p><strong>Total Students:</strong> {totalStudents}</p>
        </div>
      </div>
    </div>
  );
}
