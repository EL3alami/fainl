import { useState, useEffect } from "react";
import "../../admin/pages/AdminPages.css";

export default function DepartmentStudents() {
  const [department] = useState("Computer Science");
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Load all students in the department
    const departmentStudents = [
      { id: "2021001", name: "Ahmed Ali", email: "ahmed@example.com", level: "Level 3", gpa: 3.5, status: "Active" },
      { id: "2021002", name: "Mona Sami", email: "mona@example.com", level: "Level 2", gpa: 3.8, status: "Active" },
      { id: "2021003", name: "Omar Hassan", email: "omar@example.com", level: "Level 4", gpa: 3.2, status: "Active" },
      { id: "2021004", name: "Sara Mohamed", email: "sara@example.com", level: "Level 1", gpa: 3.9, status: "Active" },
    ];
    setStudents(departmentStudents);
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewAcademicRecord = (studentId) => {
    alert(`Viewing academic record for student ${studentId}`);
  };

  const handleIssueWarning = (studentId) => {
    if (window.confirm("Issue academic warning to this student?")) {
      alert(`Warning issued to student ${studentId}`);
    }
  };

  const handleChangeStatus = (studentId, newStatus) => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, status: newStatus } : s
      )
    );
  };

  return (
    <div className="admin-page">
      <h1>Department Students Management</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Manage all students in the {department} department
      </p>

      <input
        className="search-input"
        placeholder="Search by name, ID, or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="admin-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Level</th>
            <th>GPA</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.level}</td>
              <td>{student.gpa}</td>
              <td>
                <span
                  className={`status-badge ${
                    student.status === "Active" ? "status-active" : "status-inactive"
                  }`}
                >
                  {student.status}
                </span>
              </td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => handleViewAcademicRecord(student.id)}
                  style={{ padding: "6px 12px", marginRight: "5px" }}
                >
                  View Record
                </button>
                <button
                  className="btn-add"
                  onClick={() => handleIssueWarning(student.id)}
                  style={{ padding: "6px 12px", marginRight: "5px", background: "#ffc107" }}
                >
                  Warning
                </button>
                <select
                  value={student.status}
                  onChange={(e) => handleChangeStatus(student.id, e.target.value)}
                  style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
