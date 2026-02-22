import { useState, useEffect } from "react";
import "../../admin/pages/AdminPages.css";

export default function MyCourses() {
  const [professorName] = useState("Dr. Ali Hassan");
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);

  useEffect(() => {
    // Load all registered courses and filter by professor
    const allCourses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
    const uniqueCourses = [];
    const courseMap = new Map();

    allCourses.forEach((course) => {
      if (course.professor === professorName) {
        if (!courseMap.has(course.id)) {
          courseMap.set(course.id, course);
          uniqueCourses.push(course);
        }
      }
    });

    setMyCourses(uniqueCourses);
  }, [professorName]);

  const handleViewStudents = (course) => {
    setSelectedCourse(course);
    // Get all students registered for this course
    const allCourses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
    const students = allCourses
      .filter((c) => c.id === course.id)
      .map((c, idx) => ({
        id: `STU${idx + 1}`,
        name: `Student ${idx + 1}`,
        email: `student${idx + 1}@example.com`,
        course: c.name,
      }));
    setCourseStudents(students);
  };

  const handleGradeStudent = (studentId, grade) => {
    const grades = JSON.parse(localStorage.getItem("studentGrades") || "{}");
    const courseId = selectedCourse.id;
    grades[courseId] = grade;
    localStorage.setItem("studentGrades", JSON.stringify(grades));
    alert(`Grade ${grade} assigned successfully!`);
  };

  return (
    <div className="admin-page">
      <h1>My Courses</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Credits</th>
            <th>Schedule</th>
            <th>Registered Students</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {myCourses.map((course) => {
            const allCourses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
            const studentCount = allCourses.filter((c) => c.id === course.id).length;
            return (
              <tr key={course.id}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.credits}</td>
                <td>{course.schedule}</td>
                <td>{studentCount}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleViewStudents(course)}
                    style={{ padding: "6px 12px", margin: 0 }}
                  >
                    View Students
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedCourse && (
        <div style={{ marginTop: "30px", background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h2>Students Registered for {selectedCourse.name}</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Current Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courseStudents.map((student) => {
                const grades = JSON.parse(localStorage.getItem("studentGrades") || "{}");
                const currentGrade = grades[selectedCourse.id] || "Not graded";
                return (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{currentGrade}</td>
                    <td>
                      <select
                        onChange={(e) => handleGradeStudent(student.id, e.target.value)}
                        style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                      >
                        <option value="">Assign Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="B-">B-</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="C-">C-</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
