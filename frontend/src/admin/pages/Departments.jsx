import { useState, useEffect } from "react";
import { departmentsApi } from "../../services/api";
import "./AdminPages.css";

const DepartmentFormModal = ({ editing, formData, setFormData, handleSubmit, setShowForm }) => {
  return (
    <div className="modal">
      <div className="modal-content glass-effect animate-in" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>{editing ? "Edit Department" : "Create New Department"}</h3>
          <p className="subtitle">Define the academic scope and unique code for this department.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department Name (English)</label>
            <input
              placeholder="e.g. Computer Science"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Department Name (Arabic)</label>
            <input
              placeholder="مثال: علوم الحاسب"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Department Code</label>
            <input
              placeholder="e.g. CS, IT, IS"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              maxLength={10}
            />
          </div>

          <div className="form-group">
            <label>Description (English)</label>
            <textarea
              placeholder="Brief overview of the department..."
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              style={{ minHeight: '80px', padding: '12px' }}
            />
          </div>

          <div className="form-group">
            <label>Description (Arabic)</label>
            <textarea
              placeholder="وصف مختصر للقسم..."
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              style={{ minHeight: '80px', padding: '12px' }}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              {editing ? "Update Department" : "Create Department"}
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

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    code: "",
    description_ar: "",
    description_en: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await departmentsApi.getAll();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({ name_ar: "", name_en: "", code: "", description_ar: "", description_en: "" });
    setShowForm(true);
  };

  const handleEdit = (dept) => {
    setEditing(dept);
    setFormData({
      name_ar: dept.name_ar,
      name_en: dept.name_en,
      code: dept.code,
      description_ar: dept.description_ar || "",
      description_en: dept.description_en || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await departmentsApi.update(editing.id, formData);
      } else {
        await departmentsApi.create(formData);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to save department");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department? Make sure it has no students or professors assigned.")) return;
    try {
      await departmentsApi.delete(id);
      fetchData();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const filteredDepts = departments.filter((d) =>
    d.name_en.toLowerCase().includes(search.toLowerCase()) ||
    d.name_ar.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-container">Loading academic departments...</div>;

  return (
    <div className="admin-page animate-in">
      <div className="page-header">
        <div className="title-section">
          <h1>Scientific Departments</h1>
          <p className="breadcrumb">Admin · Management · Departments</p>
        </div>
        <div className="action-bar">
          <button className="btn-add" onClick={handleAdd}>
            <span>+</span> New Department
          </button>
        </div>
      </div>

      <div className="data-section">
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search by department name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="modern-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filteredDepts.map((dept) => (
            <div key={dept.id} className="modern-card">
              <div className="card-overlay"></div>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="dept-tag" style={{ fontSize: '14px', padding: '6px 12px', marginBottom: '12px', display: 'inline-block' }}>Code: {dept.code}</span>
                  <h3 style={{ fontSize: '22px' }}>{dept.name_en}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{dept.name_ar}</p>
                </div>
                <div className="table-actions">
                  <button className="action-btn edit" onClick={() => handleEdit(dept)}>✏️</button>
                  <button className="action-btn delete" onClick={() => handleDelete(dept.id)}>🗑️</button>
                </div>
              </div>

              <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', fontSize: '13px', color: '#666', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {dept.description_en || "No description provided."}
              </div>

              <div className="card-stats" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="stat-item" style={{ background: 'var(--background)', padding: '12px', borderRadius: '12px' }}>
                  <span className="stat-label">Students</span>
                  <span className="stat-value" style={{ color: 'var(--primary)' }}>{dept.students_count || 0}</span>
                </div>
                <div className="stat-item" style={{ background: 'var(--background)', padding: '12px', borderRadius: '12px' }}>
                  <span className="stat-label">Faculty</span>
                  <span className="stat-value" style={{ color: 'var(--success)' }}>{dept.professors_count || 0}</span>
                </div>
              </div>

              <div className="card-footer" style={{ marginTop: '20px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ID: #{dept.id}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredDepts.length === 0 && (
          <div className="empty-state" style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px dashed var(--border)' }}>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>No departments found. Start by creating a new one!</p>
          </div>
        )}
      </div>

      {showForm && (
        <DepartmentFormModal
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          setShowForm={setShowForm}
        />
      )}
    </div>
  );
}
