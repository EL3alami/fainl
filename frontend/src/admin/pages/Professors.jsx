import { useState, useEffect } from "react";
import { professorsApi, studentsApi } from "../../services/api";
import "./AdminPages.css";

const ProfessorFormModal = ({ editing, formData, setFormData, departments, handleSubmit, setShowForm }) => {
  return (
    <div className="modal">
      <div className="modal-content glass-effect animate-in" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h3>{editing ? "Update Professor Profile" : "Register Faculty Member"}</h3>
          <p className="subtitle">Please provide high-level academic and login credentials.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name (English)</label>
              <input
                placeholder="e.g. Dr. Ahmed Ali"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name (Arabic)</label>
              <input
                placeholder="الاسم بالكامل"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Login Username</label>
              <input
                placeholder="Username for portal access"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="faculty@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Academic Title</label>
              <select
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              >
                <option value="lecturer">Lecturer (مدرس)</option>
                <option value="assistant_prof">Assistant Professor (أستاذ مساعد)</option>
                <option value="associate_prof">Associate Professor (أستاذ مشارك)</option>
                <option value="prof">Professor (أستاذ)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                value={formData.department_id || ""}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                <option value="">General Faculty</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name_en} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Specialization / Research Interest</label>
              <input
                placeholder="e.g. Distributed Systems, Neural Networks..."
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Account Password</label>
              <input
                type="password"
                placeholder={editing ? "Leave blank to keep current" : "Set secure password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editing}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              {editing ? "Save Changes" : "Confirm Appointment"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Professors() {
  const [professors, setProfessors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    username: "",
    email: "",
    department_id: "",
    title: "lecturer",
    specialization: "",
    password: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profsData, deptsData] = await Promise.all([
        professorsApi.getAll(),
        studentsApi.getDepartments()
      ]);
      setProfessors(profsData);
      setDepartments(deptsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      name_en: "",
      name_ar: "",
      username: "",
      email: "",
      department_id: "",
      title: "lecturer",
      specialization: "",
      password: "",
    });
    setShowForm(true);
  };

  const handleEdit = (prof) => {
    setEditing(prof);
    setFormData({
      ...prof,
      username: prof.user?.username || "",
      department_id: prof.department_id || "",
      password: "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await professorsApi.update(editing.id, formData);
      } else {
        await professorsApi.create(formData);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to process request");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Terminate professor record? This also removes their login credentials.")) return;
    try {
      await professorsApi.delete(id);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredProfessors = professors.filter((p) => {
    const pSearch = search.toLowerCase();
    return (
      (p.name_en || "").toLowerCase().includes(pSearch) ||
      (p.name_ar || "").toLowerCase().includes(pSearch) ||
      (p.user?.username || "").toLowerCase().includes(pSearch) ||
      (p.specialization || "").toLowerCase().includes(pSearch)
    );
  });

  if (loading) return <div className="loading-container">Synchronizing faculty database...</div>;

  return (
    <div className="admin-page animate-in">
      <div className="page-header">
        <div className="title-section">
          <h1>Faculty Management</h1>
          <p className="breadcrumb">Admin · Management · Professors</p>
        </div>
        <div className="action-bar">
          <button className="btn-add" onClick={handleAdd}>
            <span>+</span> Appoint Professor
          </button>
        </div>
      </div>

      <div className="data-section">
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search by name, username, or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Credentials</th>
                <th>Department</th>
                <th>Degree/Title</th>
                <th>Specialization</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessors.length > 0 ? filteredProfessors.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="name-cell">
                      <span className="main-name">{p.name_en || p.name_ar}</span>
                      <span className="sub-email">{p.email}</span>
                    </div>
                  </td>
                  <td><span className="username-badge">@{p.user?.username}</span></td>
                  <td><span className="dept-tag">{p.department ? p.department.name_en : "General"}</span></td>
                  <td>
                    <span className={`title-tag ${p.title}`}>
                      {p.title === 'lecturer' ? 'Lecturer' :
                        p.title === 'assistant_prof' ? 'Asst. Prof.' :
                          p.title === 'associate_prof' ? 'Assoc. Prof.' : 'Professor'}
                    </span>
                  </td>
                  <td>{p.specialization || "—"}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn edit" onClick={() => handleEdit(p)}>✏️</button>
                      <button className="action-btn delete" onClick={() => handleDelete(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-state">No faculty members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ProfessorFormModal
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          departments={departments}
          handleSubmit={handleSubmit}
          setShowForm={setShowForm}
        />
      )}
    </div>
  );
}
