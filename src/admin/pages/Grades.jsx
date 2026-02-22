import { useState } from "react";
import "./AdminPages.css";

export default function Grades() {
  const [grades, setGrades] = useState([
    {
      id: 1,
      studentName: "Ahmed Ali",
      studentId: "2001",
      course: "Data Structures",
      grade: "A",
      percentage: 90,
    },
    {
      id: 2,
      studentName: "Fatima Mohamed",
      studentId: "2002",
      course: "Data Structures",
      grade: "B+",
      percentage: 85,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);

  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    course: "",
    grade: "",
    percentage: "",
  });

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      studentName: "",
      studentId: "",
      course: "",
      grade: "",
      percentage: "",
    });
    setShowForm(true);
  };

  const handleEdit = (grade) => {
    setEditing(grade);
    setFormData(grade);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setGrades(grades.filter((g) => g.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editing) {
      setGrades(
        grades.map((g) =>
          g.id === editing.id ? { ...formData, id: g.id } : g
        )
      );
    } else {
      setGrades([...grades, { ...formData, id: Date.now() }]);
    }

    setShowForm(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileUpload(file);
      // هنا يمكن إضافة logic لقراءة ملف Excel ومعالجة البيانات
      alert(`تم تحديد الملف: ${file.name}`);
    }
  };

  const handleFileSubmit = () => {
    if (fileUpload) {
      // يمكن هنا إضافة logic لمعالجة ملف Excel والتحديث من خلاله
      alert(`تم رفع الملف: ${fileUpload.name}`);
      setFileUpload(null);
    }
  };

  return (
    <div className="admin-page">
      <h1>Manage Grades</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button className="btn-add" onClick={handleAdd}>
          Add Grade
        </button>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            style={{ padding: "8px" }}
          />
          <button
            className="btn-add"
            onClick={handleFileSubmit}
            disabled={!fileUpload}
            style={{ opacity: fileUpload ? 1 : 0.5 }}
          >
            Upload Excel
          </button>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Student ID</th>
            <th>Course</th>
            <th>Grade</th>
            <th>Percentage</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {grades.map((g) => (
            <tr key={g.id}>
              <td>{g.studentName}</td>
              <td>{g.studentId}</td>
              <td>{g.course}</td>
              <td>{g.grade}</td>
              <td>{g.percentage}%</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(g)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(g.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Modal ===== */}
      {showForm && (
        <div className="modal">
          <form className="modal-content" onSubmit={handleSubmit}>
            <h3>{editing ? "Edit Grade" : "Add Grade"}</h3>

            <input
              placeholder="Student Name"
              value={formData.studentName}
              onChange={(e) =>
                setFormData({ ...formData, studentName: e.target.value })
              }
              required
            />

            <input
              placeholder="Student ID"
              value={formData.studentId}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
              required
            />

            <input
              placeholder="Course"
              value={formData.course}
              onChange={(e) =>
                setFormData({ ...formData, course: e.target.value })
              }
              required
            />

            <input
              placeholder="Grade (e.g., A, B+, B, C)"
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Percentage"
              value={formData.percentage}
              onChange={(e) =>
                setFormData({ ...formData, percentage: e.target.value })
              }
              required
              min="0"
              max="100"
            />

            <div className="modal-actions">
              <button className="btn-add">Save</button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
