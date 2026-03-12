import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { gradesApi, departmentsApi } from "../../services/api";
import "./AdminPages.css";

const GradeFormModal = ({ editing, formData, setFormData, handleSubmit, setShowForm }) => {
  return (
    <div className="modal">
      <div className="modal-content glass-effect animate-in" style={{ maxWidth: '500px', borderRadius: '24px', padding: '30px' }}>
        <div className="modal-header" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '800' }}>Record Grade</h3>
          <p className="subtitle" style={{ color: '#64748b' }}>Academic performance record for this enrollment.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px', padding: '16px', background: 'rgba(79, 70, 229, 0.05)', borderRadius: '16px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
            <div style={{ fontWeight: '800', fontSize: '18px', color: '#1e293b' }}>{editing?.student?.name_en}</div>
            <div style={{ fontSize: '14px', color: '#4f46e5', fontWeight: '600' }}>Course: {editing?.course?.name_en}</div>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Midterm (15)</label>
              <input type="number" max="15" value={formData.midterm_grade} onChange={(e) => setFormData({ ...formData, midterm_grade: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Practical (15)</label>
              <input type="number" max="15" value={formData.practical_grade} onChange={(e) => setFormData({ ...formData, practical_grade: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Year Work (10)</label>
              <input type="number" max="10" value={formData.year_work_grade} onChange={(e) => setFormData({ ...formData, year_work_grade: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Final Exam (60)</label>
              <input type="number" max="60" value={formData.final_exam_grade} onChange={(e) => setFormData({ ...formData, final_exam_grade: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px', borderRadius: '12px' }}>Save Academic Record</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Grades() {
  const [enrollments, setEnrollments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // New filters
  const [activeLevel, setActiveLevel] = useState(1);
  const [activeDept, setActiveDept] = useState(null); // ID of department

  const [formData, setFormData] = useState({
    midterm_grade: "", practical_grade: "", year_work_grade: "", final_exam_grade: ""
  });

  const { selectedSemester } = useOutletContext();

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = search ? `search=${search}` : '';
      if (selectedSemester) {
        query += (query ? '&' : '') + `semester_id=${selectedSemester.id}`;
      }
      query += (query ? '&' : '') + `level=${activeLevel}`;
      if (activeDept) {
        query += `&department_id=${activeDept}`;
      }
      const [gradesRes, deptsRes] = await Promise.all([
        gradesApi.getAll(query),
        departmentsApi.getAll()
      ]);
      setEnrollments(gradesRes.data || []);
      setDepartments(deptsRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedSemester, activeLevel, activeDept]);

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
      fetchData();
    } catch (err) {
      alert(err.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (symbol) => {
    if (!symbol) return '#94a3b8';
    const s = symbol.toUpperCase();
    if (s.startsWith('A')) return '#10b981';
    if (s.startsWith('B')) return '#3b82f6';
    if (s.startsWith('C')) return '#f59e0b';
    if (s.startsWith('D')) return '#6366f1';
    return '#ef4444';
  };

  const groupedEnrollments = Object.values(enrollments.reduce((acc, item) => {
    const sId = item.student?.id || 'unknown';
    if (!acc[sId]) acc[sId] = { student: item.student, records: [] };
    acc[sId].records.push(item);
    return acc;
  }, {}));

  // Filtering Logic
  const filteredGroups = groupedEnrollments.filter(group => {
    const s = group.student;
    if (!s) return false;

    // Level Filter
    if (s.level !== activeLevel) return false;

    // Dept Filter (Only for Level 3 and 4)
    if ((activeLevel === 3 || activeLevel === 4) && activeDept) {
      return s.department_id === parseInt(activeDept);
    }

    return true;
  });

  return (
    <div className="admin-page animate-in">
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <div className="title-section">
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b' }}>Academic Performance</h1>
          <p className="breadcrumb" style={{ fontSize: '14px', color: '#64748b' }}>Edu_Point · Master Registrar · Academic Records</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '15px' }}>
          <label className="btn-primary glass-effect" style={{ cursor: 'pointer', padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', fontWeight: '700' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Bulk Import CSV
            <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Level Selector Tabs */}
      <div className="level-tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '25px', background: '#f1f5f9', padding: '6px', borderRadius: '18px', width: 'fit-content' }}>
        {[1, 2, 3, 4].map(level => (
          <button
            key={level}
            onClick={() => { setActiveLevel(level); setActiveDept(null); }}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              border: 'none',
              fontWeight: '800',
              cursor: 'pointer',
              transition: '0.3s',
              background: activeLevel === level ? 'white' : 'transparent',
              color: activeLevel === level ? '#4f46e5' : '#64748b',
              boxShadow: activeLevel === level ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Level {level}
          </button>
        ))}
      </div>

      <div className="data-section">
        <div className="toolbar" style={{ marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, background: 'white', padding: '5px 15px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', marginRight: '10px' }}>🔍</span>
            <input
              placeholder="Search by student name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', padding: '12px', fontSize: '15px', width: '100%', outline: 'none' }}
            />
          </div>

          {/* Department Filter (Only for 3 & 4) */}
          {(activeLevel === 3 || activeLevel === 4) && (
            <div className="dept-filter" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#64748b', fontSize: '13px' }}>Department:</span>
              <select
                value={activeDept || ""}
                onChange={(e) => setActiveDept(e.target.value || null)}
                style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: '600', color: '#1e293b', outline: 'none' }}
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name_en}</option>)}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state" style={{ textAlign: "center", padding: "80px" }}>
            <div className="spinner"></div>
            <p style={{ color: '#64748b', marginTop: '15px' }}>Loading level data...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="empty-state card-style" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>📄</div>
            <h3>No students in Level {activeLevel}</h3>
            <p>No records found matching this level and department combination.</p>
          </div>
        ) : (
          <div className="grade-drill-down">
            {filteredGroups.map((group) => (
              <div key={group.student?.id} className={`student-drill-card card-style animate-in ${selectedStudentId === group.student?.id ? 'expanded' : ''}`}
                style={{
                  marginBottom: '20px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  border: selectedStudentId === group.student?.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                }}>
                <div
                  className="drill-header"
                  onClick={() => setSelectedStudentId(selectedStudentId === group.student?.id ? null : group.student?.id)}
                  style={{
                    padding: '25px 30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: selectedStudentId === group.student?.id ? 'rgba(79, 70, 229, 0.02)' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <div style={{
                      width: '55px', height: '55px', borderRadius: '18px',
                      background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                      color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center',
                      fontWeight: '900', fontSize: '24px'
                    }}>
                      {group.student?.name_en?.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{group.student?.name_en}</h4>
                      <code style={{ fontSize: '13px', color: '#4f46e5', fontWeight: '700' }}>#{group.student?.student_number}</code>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '13px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '12px', color: '#475569', fontWeight: '800' }}>
                      {group.records.length} Courses
                    </span>
                    <div style={{ transform: selectedStudentId === group.student?.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.4s' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                  </div>
                </div>

                {selectedStudentId === group.student?.id && (
                  <div className="drill-content animate-in" style={{ padding: '0 30px 30px 30px', borderTop: '1px solid #f1f5f9' }}>
                    <div className="drill-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
                      <div style={{ display: 'flex', gap: '24px' }}>
                        <div className="mini-stat">
                          <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Academic GPA</span>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#4f46e5' }}>{group.student?.cgpa || '0.00'}</div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const btn = document.getElementById(`export-btn-${group.student?.id}`);
                            if (btn) btn.innerHTML = '⏳ Exporting...';
                            await gradesApi.exportTranscript(group.student?.id);
                            if (btn) btn.innerHTML = '📥 Export Transcript';
                          } catch (e) {
                            alert("Failed to export transcript.");
                          }
                        }}
                        id={`export-btn-${group.student?.id}`}
                        className="btn-secondary"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                          background: '#f8fafc', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#1e293b', cursor: 'pointer'
                        }}
                      >
                        📥 Export Transcript
                      </button>
                    </div>

                    <div className="table-wrapper" style={{ marginTop: '10px', boxShadow: 'none', border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden' }}>
                      <table className="modern-table">
                        <thead style={{ background: '#f8fafc' }}>
                          <tr>
                            <th style={{ padding: '15px 20px' }}>Course</th>
                            <th>Mid</th><th>Prac</th><th>Year</th><th>Final</th>
                            <th>Grade</th>
                            <th style={{ textAlign: 'center' }}>Edit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.records.map((rec) => (
                            <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '20px' }}>
                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{rec.course?.name_en}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{rec.course?.code_en}</div>
                              </td>
                              <td style={{ fontWeight: '600' }}>{rec.midterm_grade ?? 0}</td>
                              <td style={{ fontWeight: '600' }}>{rec.practical_grade ?? 0}</td>
                              <td style={{ fontWeight: '600' }}>{rec.year_work_grade ?? 0}</td>
                              <td style={{ fontWeight: '600' }}>{rec.final_exam_grade ?? 0}</td>
                              <td>
                                <span style={{
                                  padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '900',
                                  background: `${getStatusColor(rec.grade_symbol)}15`, color: getStatusColor(rec.grade_symbol)
                                }}>
                                  {rec.grade_symbol || 'N/A'} ({rec.grade}%)
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button className="action-btn edit" onClick={() => handleEdit(rec)}>✏️</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
