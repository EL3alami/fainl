import { useState, useEffect } from "react";
import { registrationApi, semestersApi } from "../../services/api";
import { useOutletContext } from "react-router-dom";
import "./AdminPages.css";

/* ====== Professional Custom Components ====== */

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  return (
    <div className="toast-container animate-in" style={{
      position: 'fixed', top: '30px', right: '30px', zIndex: 10001,
      background: 'white', padding: '16px 24px', borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: `1px solid ${type === 'error' ? '#fee2e2' : (type === 'warning' ? '#fef3c7' : '#ecfdf5')}`,
      display: 'flex', alignItems: 'center', gap: '15px', minWidth: '300px'
    }}>
      <div style={{ fontSize: '24px' }}>{icons[type] || '🔔'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>{type.toUpperCase()}</div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>{message}</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
    </div>
  );
};

const ConfirmDialog = ({ title, message, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal" style={{ zIndex: 10002 }}>
      <div className="modal-content animate-in" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>⚠️</div>
        <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '30px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ flex: 1, background: '#ef4444' }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : 'Proceed'}
          </button>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ====== Main Component ====== */

export default function CourseRegistration() {
  const { selectedSemester: contextSemester } = useOutletContext() || {};
  const [registrations, setRegistrations] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Custom Alert/Confirm State
  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Tabs for Students
  const [activeStudentLevel, setActiveStudentLevel] = useState(1);

  // For editing/adding
  const [editingSemesterId, setEditingSemesterId] = useState(null);
  const [editForm, setEditForm] = useState({ reg_start: "", reg_end: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSemester, setNewSemester] = useState({
    year: new Date().getFullYear(),
    term: "fall",
    start_date: "",
    end_date: "",
    reg_start: "",
    reg_end: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, [contextSemester]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const semData = await semestersApi.getAll();
      setSemesters(semData);

      const active = contextSemester || semData.find(s => s.is_active);
      setActiveSemester(active);

      if (active) {
        fetchRegistrations(active.id, activeStudentLevel);
      } else if (semData.length > 0) {
        showToast("Please select a working semester from the top bar.", "warning");
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (semesterId, level) => {
    try {
      setLoading(true);
      const res = await registrationApi.getAllRegistrations(semesterId, level);
      setRegistrations(res);
    } catch (err) {
      showToast("Could not load registration list", 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (url) => {
    setIsExporting(true);
    // Create a hidden link and click it - more reliable than window.open
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', ''); // Optional: will use server Header filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Smoothly turn off loading state
    setTimeout(() => setIsExporting(false), 2000);
    showToast("Exporting data... your file will download shortly.");
  };

  const handleExportBatch = () => {
    if (!activeSemester) {
      showToast("No active semester selected for export.", "error");
      return;
    }
    const url = registrationApi.exportRegistrations({
      semester_id: activeSemester.id,
      level: activeStudentLevel
    });
    downloadFile(url);
  };

  const handleExportStudent = (studentId) => {
    if (!activeSemester) return;
    const url = registrationApi.exportRegistrations({
      semester_id: activeSemester.id,
      student_id: studentId
    });
    downloadFile(url);
  };

  const handleAddSemester = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await semestersApi.create(newSemester);
      showToast("New academic semester initialized!");
      setShowAddModal(false);
      fetchInitialData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteSemester = (id) => {
    setConfirmData({
      title: "Danger Zone",
      message: "Deleting this semester will permanently wipe all associated student registrations. This action cannot be undone.",
      onConfirm: () => handleDeleteSemester(id)
    });
  };

  const handleDeleteSemester = async (id) => {
    try {
      setLoading(true);
      await semestersApi.delete(id);
      showToast("Semester removed from system.");
      setConfirmData(null);
      fetchInitialData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSemester = async (id) => {
    try {
      setLoading(true);
      await semestersApi.activate(id);
      fetchInitialData();
      showToast("Academic term activated successfully.");
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (sem) => {
    setEditingSemesterId(sem.id);
    setEditForm({ reg_start: sem.reg_start || "", reg_end: sem.reg_end || "" });
  };

  const handleSaveDates = async (sem) => {
    try {
      setLoading(true);
      await semestersApi.update(sem.id, {
        ...sem,
        reg_start: editForm.reg_start,
        reg_end: editForm.reg_end
      });
      showToast("Registration dates synchronized.");
      setEditingSemesterId(null);
      fetchInitialData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const groupedRegistrations = Object.values(registrations.reduce((acc, reg) => {
    const sId = reg.student?.id || 'unknown';
    if (!acc[sId]) acc[sId] = { student: reg.student, courses: [] };
    acc[sId].courses.push(reg);
    return acc;
  }, {}));

  const filteredStudentGroups = groupedRegistrations.filter(g => g.student?.level === activeStudentLevel);

  return (
    <div className="admin-page animate-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirmData && (
        <ConfirmDialog
          title={confirmData.title}
          message={confirmData.message}
          onConfirm={confirmData.onConfirm}
          onCancel={() => setConfirmData(null)}
          loading={loading}
        />
      )}

      <div className="page-header">
        <div className="title-section">
          <h1>Registration Gateway</h1>
          <p className="breadcrumb">Admin Portal · Registrar · System Control</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ borderRadius: '14px', padding: '12px 24px', fontWeight: '800' }}>
          ＋ Initialize Semester
        </button>
      </div>

      <div className="data-section" style={{ minHeight: '600px' }}>
        <div className="section-title-box" style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>Academic Calendar</h2>
          <p style={{ color: '#64748b' }}>Configure system-wide active terms and enrollment windows.</p>
        </div>

        <div className="modern-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' }}>
          {semesters.map((sem) => (
            <div key={sem.id} className={`modern-card ${sem.is_active ? 'active-border' : ''}`}
              style={{
                borderRadius: '26px',
                padding: '30px',
                background: 'white',
                border: sem.is_active ? '2.5px solid #4f46e5' : '1px solid #e2e8f0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: sem.is_active ? '0 20px 40px rgba(79, 70, 229, 0.1)' : '0 4px 12px rgba(0,0,0,0.02)'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    fontSize: '10px', fontWeight: '900', padding: '6px 12px', borderRadius: '12px',
                    background: sem.is_active ? '#ecfdf5' : '#f1f5f9',
                    color: sem.is_active ? '#059669' : '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {sem.is_active ? 'Currently Live' : 'Archived / Upcoming'}
                  </span>
                  <h3 style={{ margin: '12px 0 4px 0', fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{sem.year} {sem.term.toUpperCase()}</h3>
                </div>
                {!sem.is_active && (
                  <button
                    onClick={() => confirmDeleteSemester(sem.id)}
                    className="action-btn delete"
                    style={{ width: '36px', height: '36px', borderRadius: '12px' }}
                  >
                    🗑️
                  </button>
                )}
              </div>

              <div style={{ marginTop: '25px', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Registration Window</span>
                  <button onClick={() => startEditing(sem)} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#4f46e5', fontWeight: '800', cursor: 'pointer' }}>Edit Timeline</button>
                </div>

                {editingSemesterId === sem.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="date" value={editForm.reg_start} onChange={e => setEditForm({ ...editForm, reg_start: e.target.value })} style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #4f46e5' }} />
                    <input type="date" value={editForm.reg_end} onChange={e => setEditForm({ ...editForm, reg_end: e.target.value })} style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #4f46e5' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-primary" style={{ flex: 1, padding: '10px' }} onClick={() => handleSaveDates(sem)}>Sync</button>
                      <button className="btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => setEditingSemesterId(null)}>×</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>START DATE</div>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e293b' }}>{sem.reg_start || 'NOT SET'}</div>
                    </div>
                    <div style={{ borderLeft: '1.5px solid #e2e8f0', paddingLeft: '20px' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>END DATE</div>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e293b' }}>{sem.reg_end || 'NOT SET'}</div>
                    </div>
                  </div>
                )}
              </div>

              {!sem.is_active && (
                <button
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '25px', borderRadius: '16px', padding: '14px', fontWeight: '800', color: '#4f46e5', borderColor: '#4f46e5' }}
                  onClick={() => handleToggleSemester(sem.id)}
                >
                  Set as Operational Semester
                </button>
              )}
            </div>
          ))}
        </div>

        {activeSemester && (
          <div style={{ marginTop: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
              <div className="section-title-box">
                <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Live Enrollments ({activeSemester.year})</h2>
                <p style={{ color: '#64748b' }}>Monitor student batches and their course selections.</p>
              </div>
              <button
                onClick={handleExportBatch}
                className={`export-btn ${isExporting ? 'loading' : ''}`}
                disabled={isExporting}
                style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  border: '1.5px solid #059669',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {isExporting ? <span className="spinner-small"></span> : '📊'}
                Export Batch Excel
              </button>
            </div>

            {/* Level Tabs */}
            <div className="batch-tabs" style={{ display: 'flex', gap: '12px', marginBottom: '30px', background: '#f1f5f9', padding: '8px', borderRadius: '20px', width: 'fit-content' }}>
              {[1, 2, 3, 4].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => {
                    setActiveStudentLevel(lvl);
                    setSelectedStudentId(null);
                    if (activeSemester) {
                      fetchRegistrations(activeSemester.id, lvl);
                    }
                  }}
                  style={{
                    padding: '12px 30px', borderRadius: '16px', border: 'none', fontWeight: '900', cursor: 'pointer',
                    transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    background: activeStudentLevel === lvl ? 'white' : 'transparent',
                    color: activeStudentLevel === lvl ? '#4f46e5' : '#64748b',
                    boxShadow: activeStudentLevel === lvl ? '0 10px 20px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  Batch #{lvl}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading-state" style={{ textAlign: "center", padding: "60px" }}>
                <div className="spinner"></div>
                <p style={{ color: '#94a3b8', marginTop: '20px' }}>Indexing batch records...</p>
              </div>
            ) : filteredStudentGroups.length === 0 ? (
              <div className="empty-state" style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '24px' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>📋</div>
                <h3>Level {activeStudentLevel} - No Enrolees</h3>
                <p>No student records found for this academic level.</p>
              </div>
            ) : (
              <div className="enrollment-drill-down" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredStudentGroups.map((group) => (
                  <div key={group.student?.id} className={`drill-card animate-in ${selectedStudentId === group.student?.id ? 'expanded' : ''}`}
                    style={{
                      borderRadius: '24px', border: '1.5px solid #e2e8f0', background: 'white', overflow: 'hidden', transition: '0.4s',
                      boxShadow: selectedStudentId === group.student?.id ? '0 30px 60px rgba(79, 70, 229, 0.12)' : '0 4px 12px rgba(0,0,0,0.01)'
                    }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div
                        onClick={() => setSelectedStudentId(selectedStudentId === group.student?.id ? null : group.student?.id)}
                        style={{ padding: '25px 35px', display: 'flex', flex: 1, alignItems: 'center', gap: '25px', cursor: 'pointer', background: selectedStudentId === group.student?.id ? 'rgba(79, 70, 229, 0.03)' : 'white' }}
                      >
                        <div style={{ width: '55px', height: '55px', borderRadius: '18px', background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '20px', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)' }}>
                          {group.student?.name_en?.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#1e293b' }}>{group.student?.name_en}</h4>
                          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                            <code style={{ color: '#4f46e5', fontWeight: '800' }}>#{group.student?.student_number}</code> • {group.student?.department?.name_en}
                          </div>
                        </div>
                      </div>

                      <div style={{ paddingRight: '35px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExportStudent(group.student?.id); }}
                          className="action-btn"
                          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', width: 'auto', padding: '0 15px', color: '#64748b', fontSize: '12px', fontWeight: 'bold', height: '36px' }}
                          title="Export Student Courses"
                        >
                          📥 Excel
                        </button>
                        <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', padding: '8px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '900' }}>
                          {group.courses.length} Courses
                        </span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: selectedStudentId === group.student?.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.4s' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                        </div>
                      </div>
                    </div>

                    {selectedStudentId === group.student?.id && (
                      <div style={{ padding: '0 35px 35px 35px', borderTop: '1px solid #f1f5f9' }} className="animate-in">
                        <div style={{ marginTop: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                          <table className="modern-table">
                            <thead style={{ background: '#f8fafc' }}>
                              <tr>
                                <th style={{ padding: '15px 20px' }}>Academic Subject</th>
                                <th>Credits</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.courses.map(reg => (
                                <tr key={reg.id}>
                                  <td style={{ padding: '20px' }}>
                                    <div style={{ fontWeight: '800', color: '#1e293b' }}>{reg.course?.name_en}</div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                      <code style={{ fontSize: '11px', color: '#94a3b8' }}>{reg.course?.code_en}</code>
                                      {reg.assigned_professor && (
                                        <span style={{ fontSize: '11px', color: '#4f46e5', background: '#eef2ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                          👨‍🏫 {reg.assigned_professor.name_en || reg.assigned_professor.name_ar}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td style={{ fontWeight: '700' }}>{reg.course?.credit_hours} HR</td>
                                  <td><span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', padding: '5px 12px', borderRadius: '10px', fontWeight: '900' }}>CONFIRMED</span></td>
                                  <td style={{ textAlign: 'right', color: '#94a3b8', fontSize: '12px' }}>{new Date(reg.created_at).toLocaleDateString()}</td>
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
        )}
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-content glass-effect animate-in" style={{ maxWidth: '520px', borderRadius: '30px', padding: '40px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '26px', fontWeight: '900' }}>New Academic Term</h2>
              <p style={{ color: '#64748b' }}>Configure parameters for the next academic semester.</p>
            </div>
            <form onSubmit={handleAddSemester}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                <div className="form-group">
                  <label>Session Year</label>
                  <input type="number" value={newSemester.year} onChange={e => setNewSemester({ ...newSemester, year: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Term Type</label>
                  <select value={newSemester.term} onChange={e => setNewSemester({ ...newSemester, term: e.target.value })} required>
                    <option value="fall">Fall Semester</option><option value="spring">Spring Semester</option><option value="summer">Summer Term</option>
                  </select>
                </div>
                <div className="form-group"><label>Term Start</label><input type="date" value={newSemester.start_date} onChange={e => setNewSemester({ ...newSemester, start_date: e.target.value })} required /></div>
                <div className="form-group"><label>Term End</label><input type="date" value={newSemester.end_date} onChange={e => setNewSemester({ ...newSemester, end_date: e.target.value })} required /></div>
              </div>

              <div className="modal-actions" style={{ marginTop: '40px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '16px', borderRadius: '16px' }}>Initialize Session</button>
                <button type="button" className="btn-secondary" style={{ flex: 1, borderRadius: '16px' }} onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .drill-card:hover { border-color: #4f46e5 !important; transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }
        .drill-card.expanded { border-color: #4f46e5 !important; }
        .form-group label { display: block; font-size: 11px; font-weight: 900; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
        .form-group input, .form-group select { width: 100%; padding: 14px; border-radius: 14px; border: 1.5px solid #e2e8f0; font-size: 15px; outline: none; transition: 0.3s; background: #fcfcfd; }
        .form-group input:focus { border-color: #4f46e5; background: white; box-shadow: 0 0 0 5px rgba(79, 70, 229, 0.06); }
        @keyframes spinner { to { transform: rotate(360deg); } }
        .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #4f46e5; border-radius: 50%; animation: spinner 0.8s linear infinite; margin: 0 auto; }
        .spinner-small { width: 18px; height: 18px; border: 2px solid rgba(5, 150, 105, 0.1); border-top-color: #059669; border-radius: 50%; animation: spinner 0.8s linear infinite; }
      `}} />
    </div>
  );
}
