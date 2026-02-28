import { useState, useEffect } from "react";
import { gradesApi } from "../../services/api";
import "./AdminPages.css";

const GradeFormModal = ({ editing, formData, setFormData, handleSubmit, setShowForm }) => {
  return (
    <div className="modal">
      <div className="modal-content glass-effect animate-in" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Record Grade</h3>
          <p className="subtitle">Update the academic performance for this student enrollment.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '15px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>{editing?.student?.name_en}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Course: {editing?.course?.name_en} ({editing?.course?.code_en})</div>
          </div>

          <div className="form-group">
            <label>Midterm (15)</label>
            <input
              type="number" max="15"
              value={formData.midterm_grade}
              onChange={(e) => setFormData({ ...formData, midterm_grade: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Practical (15)</label>
            <input
              type="number" max="15"
              value={formData.practical_grade}
              onChange={(e) => setFormData({ ...formData, practical_grade: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Year Work (10)</label>
            <input
              type="number" max="10"
              value={formData.year_work_grade}
              onChange={(e) => setFormData({ ...formData, year_work_grade: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Final Exam (60)</label>
            <input
              type="number" max="60"
              value={formData.final_exam_grade}
              onChange={(e) => setFormData({ ...formData, final_exam_grade: e.target.value })}
            />
          </div>

          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
            * Symbol and quality points will be calculated automatically based on the grade.
          </p>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              Update Grade
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

export default function Grades() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    midterm_grade: "",
    practical_grade: "",
    year_work_grade: "",
    final_exam_grade: "",
  });

  useEffect(() => {
    fetchData();
  }, [search]); // Re-fetch on search if wanted, or just filter locally

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = search ? `search=${search}` : '';
      const response = await gradesApi.getAll(params);
      setEnrollments(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (enrollment) => {
    setEditing(enrollment);
    setFormData({
      midterm_grade: enrollment.midterm_grade || 0,
      practical_grade: enrollment.practical_grade || 0,
      year_work_grade: enrollment.year_work_grade || 0,
      final_exam_grade: enrollment.final_exam_grade || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await gradesApi.update(editing.id, formData);
        setShowForm(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Failed to save grade");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await gradesApi.import(file);
      alert(res.message);
      if (res.errors && res.errors.length > 0) {
        console.warn("Import warnings:", res.errors);
      }
      fetchData();
    } catch (err) {
      alert(err.message || "Import failed");
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset input
    }
  };

  const getStatusColor = (symbol) => {
    // ... existing getStatusColor logic
    if (!symbol) return '#94a3b8';
    if (['A', 'A+', 'A-'].includes(symbol)) return '#10b981';
    if (['B', 'B+', 'B-'].includes(symbol)) return '#3b82f6';
    if (['C', 'C+', 'C-'].includes(symbol)) return '#f59e0b';
    if (['D', 'D+'].includes(symbol)) return '#6366f1';
    return '#ef4444'; // F
  };

  return (
    <div className="admin-page animate-in">
      <div className="page-header">
        <div className="title-section">
          <h1>Academic Grades</h1>
          <p className="breadcrumb">Admin · Management · Grading System</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '10px' }}>
          <label className="btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📤</span> Import from Excel (CSV)
            <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="data-section">
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search by student name, number or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Format: csv (UTF-8)</span>
            <button className="btn-secondary" onClick={fetchData}>Refresh</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>Loading academic records...</div>
        ) : enrollments.length === 0 ? (
          <div className="empty-state card-style">No academic records found.</div>
        ) : (
          <div className="students-grouped-grades">
            {Object.values(enrollments.reduce((acc, item) => {
              const sId = item.student?.id || 'unknown';
              if (!acc[sId]) acc[sId] = { student: item.student, records: [] };
              acc[sId].records.push(item);
              return acc;
            }, {})).map((group, idx) => (
              <div key={group.student?.id || idx} className="student-grade-card card-style animate-in" style={{ marginBottom: '30px', overflow: 'hidden' }}>
                <div className="student-header-banner" style={{
                  padding: '18px 25px',
                  background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      {group.student?.name_en?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#1e293b', fontSize: '17px' }}>
                        {group.student?.name_en || group.student?.name_ar}
                      </h4>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        ID: <strong>{group.student?.student_number}</strong> • Total Records: {group.records.length}
                      </span>
                    </div>
                  </div>
                  <a
                    href={gradesApi.exportTranscript(group.student?.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 15px',
                      textDecoration: 'none'
                    }}
                  >
                    📥 Download Transcript (CSV/Excel)
                  </a>
                </div>

                <div className="table-responsive">
                  <table className="modern-table" style={{ margin: 0, border: 'none' }}>
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: '25px' }}>Course</th>
                        <th>Semester</th>
                        <th>Midterm (15)</th>
                        <th>Practical (15)</th>
                        <th>Year Work (10)</th>
                        <th>Final (60)</th>
                        <th>Total (100)</th>
                        <th>Symbol</th>
                        <th style={{ textAlign: 'right', paddingRight: '25px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.records.map((item) => (
                        <tr key={item.id}>
                          <td style={{ paddingLeft: '25px' }}>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.course?.name_en}</div>
                            <small style={{ color: '#94a3b8' }}>{item.course?.code_en}</small>
                          </td>
                          <td>
                            <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '5px', fontSize: '12px', color: '#475569' }}>
                              {item.semester ? `${item.semester.year} ${item.semester.term}` : 'N/A'}
                            </span>
                          </td>
                          <td>{item.midterm_grade ?? 0}</td>
                          <td>{item.practical_grade ?? 0}</td>
                          <td>{item.year_work_grade ?? 0}</td>
                          <td>{item.final_exam_grade ?? 0}</td>
                          <td>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: item.grade >= 60 ? '#059669' : '#dc2626' }}>
                              {item.grade !== null ? `${item.grade}/100` : '--'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: `${getStatusColor(item.grade_symbol)}15`,
                              color: getStatusColor(item.grade_symbol),
                              fontWeight: '700',
                              fontSize: '12px'
                            }}>
                              {item.grade_symbol || 'NOT SET'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: '25px' }}>
                            <button className="action-btn edit" style={{ padding: '6px 10px' }} title="Edit Grade" onClick={() => handleEdit(item)}>✏️ Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <GradeFormModal
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
