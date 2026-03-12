import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { studentsApi } from "../../services/api";
import "./AdminPages.css";

// --- Components defined OUTSIDE to prevent focus loss issue ---

const StudentFormModal = ({ editing, formData, setFormData, departments, handleSubmit, setShowForm }) => {
  return (
    <div className="modal">
      <div className="modal-content glass-effect animate-in">
        <div className="modal-header">
          <h3>{editing ? "Update Student Profile" : "Register New Student"}</h3>
          <p className="subtitle">Please fill in all the required academic details below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Student ID</label>
              <input
                placeholder="e.g. 2024001"
                value={formData.student_number}
                onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                required
                disabled={editing}
              />
            </div>

            <div className="form-group">
              <label>Login Username</label>
              <input
                placeholder="Unique username for login"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name (English)</label>
              <input
                placeholder="e.g. John Doe"
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
              <label>National ID (14 digits)</label>
              <input
                placeholder="14-digit National ID"
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                maxLength={14}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                value={formData.department_id || ""}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                <option value="">Common / General Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name_en} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              >
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
                <option value={4}>Level 4</option>
              </select>
            </div>

            <div className="form-group">
              <label>Account Password</label>
              <input
                type="password"
                placeholder={editing ? "Leave blank to keep current" : "Set login password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editing}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              {editing ? "Apply Changes" : "Confirm Registration"}
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

export default function Students() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    student_number: "",
    username: "",
    national_id: "",
    name_en: "",
    name_ar: "",
    email: "",
    department_id: "",
    password: "",
    level: 1,
  });

  const navigate = useNavigate();
  const { level } = useParams();

  useEffect(() => {
    fetchData();
  }, [level]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, deptsData] = await Promise.all([
        studentsApi.getAll(level ? `level=${level}` : ''),
        studentsApi.getDepartments()
      ]);
      setStudents(studentsData);
      setDepartments(deptsData);
    } catch (err) {
      setError("Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      student_number: "",
      username: "",
      national_id: "",
      name_en: "",
      name_ar: "",
      email: "",
      department_id: "",
      password: "",
      level: level ? parseInt(level) : 1
    });
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setEditing(student);
    setFormData({
      ...student,
      username: student.user?.username || "",
      department_id: student.department_id || "",
      password: ""
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await studentsApi.update(editing.id, formData);
      } else {
        await studentsApi.create(formData);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.message || "Operation failed. Check if Username or ID is unique.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student permanently?")) return;
    try {
      await studentsApi.delete(id);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleExcelExport = () => {
    const dataToExport = students.map(s => ({
      'Student ID': s.student_number,
      'Username': s.user?.username,
      'Name': s.name_en,
      'National ID': s.national_id,
      'Email': s.email,
      'Level': s.level,
      'Department': s.department?.name_en || 'General'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Student_List.xlsx");
  };

  const filteredStudents = students.filter((s) => {
    const sSearch = search.toLowerCase();
    return (
      (s.name_en || "").toLowerCase().includes(sSearch) ||
      (s.name_ar || "").toLowerCase().includes(sSearch) ||
      (s.student_number || "").toLowerCase().includes(sSearch) ||
      (s.user?.username || "").toLowerCase().includes(sSearch) ||
      (s.national_id || "").toLowerCase().includes(sSearch)
    ) && (level ? parseInt(s.level) === parseInt(level) : true);
  });

  if (loading) return <div className="loading-container">Verifying data connections...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="title-section">
          <h1>Student Directory {level ? `| Level ${level}` : ""}</h1>
          <p className="breadcrumb">Admin · Management · Students</p>
        </div>
        <div className="action-bar">
          <button className="btn-add flex-center" onClick={handleAdd}>
            <span>+</span> Add Student
          </button>
          {level && (
            <button className="btn-back" onClick={() => navigate('/admin/students')}>
              ← Back to Overview
            </button>
          )}
        </div>
      </div>

      {!level ? (
        <div className="modern-grid animate-in">
          {[1, 2, 3, 4].map((lvl) => {
            const count = students.filter(s => parseInt(s.level) === lvl).length;
            return (
              <Link key={lvl} to={lvl.toString()} className="modern-card">
                <div className="card-overlay"></div>
                <div className="card-header">
                  <div className="icon-circle">
                    <span className="lvl-num">{lvl}</span>
                  </div>
                  <h3>Level {lvl}</h3>
                </div>
                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Enrollment</span>
                    <span className="stat-value">{count} Students</span>
                  </div>
                  <div className="stat-progress">
                    <div className="progress-bar" style={{ width: `${Math.min(count * 5, 100)}%` }}></div>
                  </div>
                </div>
                <div className="card-footer">
                  <span>View Details</span>
                  <span className="arrow">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="data-section animate-in">
          <div className="toolbar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Find by name, Student ID, Username or National Number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="export-tools">
              <button className="export-btn" onClick={handleExcelExport}>
                <span className="icon">📄</span> Export XLSX
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>National Number</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td><span className="id-badge">{s.student_number}</span></td>
                    <td><span className="username-badge">@{s.user?.username}</span></td>
                    <td>
                      <div className="name-cell">
                        <span className="main-name">{s.name_en || s.name_ar}</span>
                        <span className="sub-email">{s.email}</span>
                      </div>
                    </td>
                    <td>{s.national_id}</td>
                    <td><span className="dept-tag">{s.department ? s.department.name_en : "General"}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn edit" onClick={() => handleEdit(s)} title="Edit">✏️</button>
                        <button className="action-btn delete" onClick={() => handleDelete(s.id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="empty-state">No student records found in this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <StudentFormModal
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
