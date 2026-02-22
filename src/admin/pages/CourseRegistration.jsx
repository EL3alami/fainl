import { useState } from "react";
import "./AdminPages.css";

export default function CourseRegistration() {
  const [registrations, setRegistrations] = useState([
    {
      id: 1,
      studentName: "Ahmed Ali",
      studentId: "2001",
      course: "Data Structures",
      semester: "Fall 2025",
      status: "Approved",
    },
    {
      id: 2,
      studentName: "Fatima Mohamed",
      studentId: "2002",
      course: "Database Systems",
      semester: "Fall 2025",
      status: "Pending",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    course: "",
    semester: "",
    status: "Pending",
  });

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      studentName: "",
      studentId: "",
      course: "",
      semester: "",
      status: "Pending",
    });
    setShowForm(true);
  };

  const handleEdit = (registration) => {
    setEditing(registration);
    setFormData(registration);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setRegistrations(registrations.filter((r) => r.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editing) {
      setRegistrations(
        registrations.map((r) =>
          r.id === editing.id ? { ...formData, id: r.id } : r
        )
      );
    } else {
      setRegistrations([...registrations, { ...formData, id: Date.now() }]);
    }

    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return { color: "green" };
      case "Pending":
        return { color: "orange" };
      case "Rejected":
        return { color: "red" };
      default:
        return { color: "black" };
    }
  };

  return (
    <div className="admin-page">
      <h1>Course Registration Management</h1>

      <button className="btn-add" onClick={handleAdd}>
        Add Registration
      </button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Student ID</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {registrations.map((r) => (
            <tr key={r.id}>
              <td>{r.studentName}</td>
              <td>{r.studentId}</td>
              <td>{r.course}</td>
              <td>{r.semester}</td>
              <td style={getStatusColor(r.status)}>
                <strong>{r.status}</strong>
              </td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(r)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(r.id)}
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
            <h3>{editing ? "Edit Registration" : "Add Registration"}</h3>

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
              placeholder="Semester (e.g., Fall 2025)"
              value={formData.semester}
              onChange={(e) =>
                setFormData({ ...formData, semester: e.target.value })
              }
              required
            />

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

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
