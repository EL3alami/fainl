import { useState } from "react";
import "./AdminPages.css";

export default function Departments() {
  const [departments, setDepartments] = useState([
    { id: 1, name: "Computer Science", description: "Department of Computer Science and Engineering" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setShowForm(true);
  };

  const handleEdit = (d) => {
    setEditing(d);
    setName(d.name);
    setDescription(d.description || "");
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDepartments(departments.filter((d) => d.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editing) {
      setDepartments(
        departments.map((d) =>
          d.id === editing.id ? { ...d, name, description } : d
        )
      );
    } else {
      setDepartments([...departments, { id: Date.now(), name, description }]);
    }

    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <h1>Manage Departments</h1>

      <button className="btn-add" onClick={handleAdd}>
        Add Department
      </button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Department Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{d.description}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(d)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(d.id)}
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
            <h3>{editing ? "Edit Department" : "Add Department"}</h3>

            <input
              placeholder="Department Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
