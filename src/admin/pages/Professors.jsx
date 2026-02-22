import { useState } from "react";
import "./AdminPages.css";

export default function Professors() {
  const [professors, setProfessors] = useState([
    { id: 1, nationalId: "12345678901234", name: "Dr. Ali Hassan", email: "ali@uni.edu", department: "CS", password: "pass123" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [formData, setFormData] = useState({
    nationalId: "",
    name: "",
    email: "",
    department: "",
    password: "",
  });

  const handleAdd = () => {
    setEditing(null);
    setFormData({ nationalId: "", name: "", email: "", department: "", password: "" });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setProfessors(professors.filter((p) => p.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editing) {
      setProfessors(
        professors.map((p) =>
          p.id === editing.id ? { ...formData, id: p.id } : p
        )
      );
    } else {
      setProfessors([...professors, { ...formData, id: Date.now() }]);
    }

    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <h1>Manage Professors</h1>

      <div className="admin-controls">
        <button className="btn-add" onClick={handleAdd}>
          Add Professor
        </button>

        <input
          className="search-input admin-search"
          placeholder="Search by name, email or department"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>National ID</th>
            <th>Email</th>
              <th>Password</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {professors
            .filter((p) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return (
                p.name.toLowerCase().includes(q) ||
                (p.nationalId||"").toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q) ||
                p.department.toLowerCase().includes(q)
              );
            })
            .map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.nationalId || ""}</td>
                <td>{p.email}</td>
                <td>{p.password}</td>
                <td>{p.department}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(p)}>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(p.id)}
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
            <h3>{editing ? "Edit Professor" : "Add Professor"}</h3>

            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <input
              placeholder="National ID"
              value={formData.nationalId}
              onChange={(e) =>
                setFormData({ ...formData, nationalId: e.target.value })
              }
              required
            />

            <input
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
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
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
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
