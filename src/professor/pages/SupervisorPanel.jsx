import { useState, useEffect } from "react";
import "../../admin/pages/AdminPages.css";

export default function SupervisorPanel() {
  const [department] = useState("Computer Science");
  const [departmentStudents, setDepartmentStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    // Load all students in the department
    const allCourses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
    const students = [
      { id: "2021001", name: "Ahmed Ali", email: "ahmed@example.com", department: "CS", level: "Level 3", gpa: 3.5 },
      { id: "2021002", name: "Mona Sami", email: "mona@example.com", department: "CS", level: "Level 2", gpa: 3.8 },
      { id: "2021003", name: "Omar Hassan", email: "omar@example.com", department: "CS", level: "Level 4", gpa: 3.2 },
    ];
    setDepartmentStudents(students);
  }, []);

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    // Load student's courses and grades
    const allCourses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
    const studentCourses = allCourses.filter((c) => c.department === student.department);
    const grades = JSON.parse(localStorage.getItem("studentGrades") || "{}");

    const coursesWithGrades = studentCourses.map((course) => ({
      ...course,
      grade: grades[course.id] || null,
    }));

    setStudentDetails({
      ...student,
      courses: coursesWithGrades,
    });
  };

  const handleApproveRegistration = (studentId, courseId) => {
    alert(`Registration approved for student ${studentId} in course ${courseId}`);
  };

  const handleRejectRegistration = (studentId, courseId) => {
    if (window.confirm("Are you sure you want to reject this registration?")) {
      alert(`Registration rejected for student ${studentId} in course ${courseId}`);
    }
  };

  return (
    <div className="admin-page">
      <h1>Academic Supervisor Panel</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Manage students in the {department} department
      </p>

      <div style={{ marginBottom: "30px" }}>
        <h2>Department Students ({departmentStudents.length})</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Level</th>
              <th>GPA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departmentStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.level}</td>
                <td>{student.gpa}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleViewStudent(student)}
                    style={{ padding: "6px 12px", margin: 0 }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {studentDetails && (
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h2>Student Details: {studentDetails.name}</h2>
          <div style={{ marginBottom: "20px" }}>
            <p><strong>ID:</strong> {studentDetails.id}</p>
            <p><strong>Email:</strong> {studentDetails.email}</p>
            <p><strong>Level:</strong> {studentDetails.level}</p>
            <p><strong>GPA:</strong> {studentDetails.gpa}</p>
          </div>

          <h3>Registered Courses</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentDetails.courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.credits}</td>
                  <td>{course.grade || "Not graded"}</td>
                  <td>
                    <button
                      className="btn-add"
                      onClick={() => handleApproveRegistration(studentDetails.id, course.id)}
                      style={{ padding: "4px 8px", marginRight: "5px", fontSize: "12px" }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleRejectRegistration(studentDetails.id, course.id)}
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
