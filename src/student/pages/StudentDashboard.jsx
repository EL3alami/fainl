import { useState, useEffect } from "react";
import "../StudentLayout.css";

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState({
    name: "Ahmed Ali",
    id: "2021001",
    email: "ahmed@example.com",
    department: "Computer Science",
    level: "Level 3",
    gpa: 3.5,
  });

  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    // Load registered courses and schedule
    const courses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
    setRegisteredCourses(courses);

    const schedule = JSON.parse(localStorage.getItem("studentSchedule") || "[]");
    setUpcomingClasses(schedule.slice(0, 3));
  }, []);

  return (
    <div className="admin-page">
      <h1>Student Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0, color: "#667eea" }}>Student Information</h3>
          <p><strong>Name:</strong> {studentInfo.name}</p>
          <p><strong>ID:</strong> {studentInfo.id}</p>
          <p><strong>Department:</strong> {studentInfo.department}</p>
          <p><strong>Level:</strong> {studentInfo.level}</p>
          <p><strong>GPA:</strong> {studentInfo.gpa}</p>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0, color: "#667eea" }}>Quick Stats</h3>
          <p><strong>Registered Courses:</strong> {registeredCourses.length}</p>
          <p><strong>Upcoming Classes:</strong> {upcomingClasses.length}</p>
        </div>
      </div>

      {upcomingClasses.length > 0 && (
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0, color: "#667eea" }}>Upcoming Classes</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Day</th>
                <th>Time</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {upcomingClasses.map((cls, idx) => (
                <tr key={idx}>
                  <td>{cls.course}</td>
                  <td>{cls.day}</td>
                  <td>{cls.time}</td>
                  <td>{cls.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
