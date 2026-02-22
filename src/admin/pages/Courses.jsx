import { useState } from "react";
import "./AdminPages.css";

export default function Courses() {
  const [courses, setCourses] = useState([
    { id: 1, name: "Data Structures", department: "CS", materialCode: "MAT-101" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    materialCode: "",
  });

  const handleAdd = () => {
    setEditing(null);
    setFormData({ name: "", department: "", materialCode: "" });
    setShowForm(true);
  };

  const handleEdit = (c) => {
    setEditing(c);
    setFormData(c);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editing) {
      setCourses(
        courses.map((c) =>
          c.id === editing.id ? { ...formData, id: c.id } : c
        )
      );
    } else {
      setCourses([...courses, { ...formData, id: Date.now() }]);
    }

    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <h1>Manage Courses</h1>

      <button className="btn-add" onClick={handleAdd}>
        Add Course
      </button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Material Code</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {courses.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.materialCode}</td>
              <td>{c.department}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(c)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal">
          <form className="modal-content" onSubmit={handleSubmit}>
            <h3>{editing ? "Edit Course" : "Add Course"}</h3>

            <input
              placeholder="Course Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <input
              placeholder="Department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              required
            />

            <input
              placeholder="Material Code"
              value={formData.materialCode}
              onChange={(e) =>
                setFormData({ ...formData, materialCode: e.target.value })
              }
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
