import { useState, useEffect } from "react";
import "../../admin/pages/AdminPages.css";

export default function MyGrades() {
  const [grades, setGrades] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);

  useEffect(() => {
    const courses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
    setRegisteredCourses(courses);

    // Load grades from localStorage or initialize with empty grades
    const savedGrades = JSON.parse(localStorage.getItem("studentGrades") || "{}");
    const gradesList = courses.map((course) => ({
      ...course,
      grade: savedGrades[course.id] || null,
      points: savedGrades[course.id] ? getGradePoints(savedGrades[course.id]) : null,
    }));
    setGrades(gradesList);
  }, []);

  const getGradePoints = (grade) => {
    const gradeMap = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0 };
    return gradeMap[grade] || null;
  };

  const calculateGPA = () => {
    const gradedCourses = grades.filter((g) => g.grade && g.points !== null);
    if (gradedCourses.length === 0) return 0;

    const totalPoints = gradedCourses.reduce((sum, g) => sum + g.points * g.credits, 0);
    const totalCredits = gradedCourses.reduce((sum, g) => sum + g.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  return (
    <div className="admin-page">
      <h1>My Grades</h1>

      <div style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginTop: 0, color: "#667eea" }}>
          Current GPA: <span style={{ color: "#198754" }}>{calculateGPA()}</span>
        </h2>
      </div>

      {grades.length === 0 ? (
        <p>No courses registered yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Grade</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((course) => (
              <tr key={course.id}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.credits}</td>
                <td>
                  {course.grade ? (
                    <span
                      className={`status-badge ${
                        course.grade === "F" ? "status-inactive" : "status-active"
                      }`}
                    >
                      {course.grade}
                    </span>
                  ) : (
                    <span style={{ color: "#999" }}>Not graded yet</span>
                  )}
                </td>
                <td>{course.points !== null ? course.points.toFixed(1) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
