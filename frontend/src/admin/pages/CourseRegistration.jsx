import { useState, useEffect } from "react";
import { registrationApi, semestersApi } from "../../services/api";
import "./AdminPages.css";

export default function CourseRegistration() {
  const [registrations, setRegistrations] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState(null);

  // For editing the dates
  const [editingSemesterId, setEditingSemesterId] = useState(null);
  const [editForm, setEditForm] = useState({ reg_start: "", reg_end: "" });

  // For adding a new semester
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
  }, []);

  const handleAddSemester = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await semestersApi.create(newSemester);
      alert("New semester created successfully!");
      setShowAddModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.message || "Failed to create semester.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const semData = await semestersApi.getAll();
      setSemesters(semData);

      const active = semData.find(s => s.is_active);
      setActiveSemester(active);

      if (active) {
        fetchRegistrations(active.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // ... rest of the functions
  const fetchRegistrations = async (semesterId) => {
    try {
      setLoading(true);
      const res = await registrationApi.getAllRegistrations(semesterId);
      setRegistrations(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSemester = async (id) => {
    try {
      setLoading(true);
      await semestersApi.activate(id);
      const semData = await semestersApi.getAll();
      setSemesters(semData);

      const active = semData.find(s => s.is_active);
      setActiveSemester(active);
      if (active) {
        fetchRegistrations(active.id);
      }
      alert("Registration period changed successfully.");
    } catch (err) {
      alert(err.message || "Failed to change semester.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (sem) => {
    setEditingSemesterId(sem.id);
    setEditForm({
      reg_start: sem.reg_start || "",
      reg_end: sem.reg_end || ""
    });
  };

  const handleSaveDates = async (sem) => {
    try {
      setLoading(true);
      await semestersApi.update(sem.id, {
        ...sem,
        reg_start: editForm.reg_start,
        reg_end: editForm.reg_end
      });
      alert("Registration dates updated.");
      setEditingSemesterId(null);
      fetchInitialData();
    } catch (err) {
      alert(err.message || "Failed to update dates.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && semesters.length === 0) return <div className="loading-container">Loading registration data...</div>;

  return (
    <div className="admin-page animate-in">
      <div className="page-header">
        <div className="title-section">
          <h1>Course Registration Control</h1>
          <p className="breadcrumb">Admin · Management · Registration Periods</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>+</span> Add New Semester
        </button>
      </div>

      <div className="data-section">
        <div className="section-title-box" style={{ marginBottom: '20px' }}>
          <h3>Registration Periods</h3>
          <p>Control when students can register by setting Start and End dates for the active semester.</p>
        </div>

        <div className="modern-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {semesters.map((sem) => (
            <div key={sem.id} className={`modern-card ${sem.is_active ? 'active-border' : ''}`} style={{ border: sem.is_active ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
              <div className="card-header">
                <span className={`tag-${sem.is_active ? 'dept_mandatory' : 'general_mandatory'}`} style={{ marginBottom: '10px' }}>
                  {sem.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <h3>{sem.year} - {sem.term.charAt(0).toUpperCase() + sem.term.slice(1)}</h3>
              </div>
              <div className="card-stats" style={{ marginTop: '15px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
                  <strong>Semester:</strong> {sem.start_date} to {sem.end_date}
                </p>
                <hr style={{ borderColor: '#f1f5f9', margin: '10px 0' }} />

                {editingSemesterId === sem.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Registration Start:</label>
                      <input type="date" value={editForm.reg_start} onChange={e => setEditForm({ ...editForm, reg_start: e.target.value })} style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Registration End:</label>
                      <input type="date" value={editForm.reg_end} onChange={e => setEditForm({ ...editForm, reg_end: e.target.value })} style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                      <button className="btn-primary" style={{ flex: 1, padding: '5px' }} onClick={() => handleSaveDates(sem)}>Save</button>
                      <button className="btn-secondary" style={{ flex: 1, padding: '5px' }} onClick={() => setEditingSemesterId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Registration Window:</strong>
                      <button onClick={() => startEditing(sem)} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>✎ Edit</button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <div style={{ background: '#f8fafc', padding: '5px 10px', borderRadius: '6px', flex: 1, border: '1px solid #e2e8f0' }}>
                        <small style={{ color: '#94a3b8', display: 'block' }}>Starts</small>
                        <span style={{ fontWeight: '600' }}>{sem.reg_start || 'Not set'}</span>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '5px 10px', borderRadius: '6px', flex: 1, border: '1px solid #e2e8f0' }}>
                        <small style={{ color: '#94a3b8', display: 'block' }}>Ends</small>
                        <span style={{ fontWeight: '600' }}>{sem.reg_end || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer" style={{ marginTop: '20px' }}>
                {!sem.is_active && (
                  <button className="btn-secondary" style={{ width: '100%' }} onClick={() => handleToggleSemester(sem.id)}>
                    Set as Active Semester
                  </button>
                )}
                {sem.is_active && (
                  <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '14px', display: 'block', textAlign: 'center', width: '100%' }}>
                    ✓ Current active period
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {semesters.length === 0 && (
          <div className="empty-state">No semesters defined. Please add one in settings or via DB.</div>
        )}

        {activeSemester && (
          <>
            <div className="section-title-box" style={{ marginTop: '40px', marginBottom: '20px' }}>
              <h3>Registered Students ({activeSemester.year} - {activeSemester.term})</h3>
              <p>List of all students who have registered courses in the active semester.</p>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>Loading registrations...</div>
            ) : registrations.length === 0 ? (
              <div className="empty-state card-style">No students registered for this semester yet.</div>
            ) : (
              <div className="students-grouped-list">
                {Object.values(registrations.reduce((acc, reg) => {
                  const sId = reg.student?.id || 'unknown';
                  if (!acc[sId]) acc[sId] = { student: reg.student, courses: [] };
                  acc[sId].courses.push(reg);
                  return acc;
                }, {})).map((group, idx) => (
                  <div key={group.student?.id || idx} className="student-registration-card card-style animate-in" style={{ marginBottom: '25px', overflow: 'hidden' }}>
                    <div className="student-header-banner" style={{
                      padding: '15px 25px',
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>
                          <span style={{ color: '#64748b', fontWeight: 'normal' }}>Student: </span>
                          {group.student?.name_en || group.student?.name_ar}
                        </h4>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          University ID: <strong>{group.student?.student_number}</strong> • Dept: {group.student?.department?.name_en}
                        </span>
                      </div>
                      <div className="course-count-tag" style={{
                        background: '#4f46e5',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {group.courses.length} Courses
                      </div>
                    </div>

                    <table className="modern-table" style={{ margin: 0, border: 'none' }}>
                      <thead style={{ background: '#fff' }}>
                        <tr>
                          <th style={{ paddingLeft: '25px' }}>Course Code</th>
                          <th>Course Name</th>
                          <th>Credits</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right', paddingRight: '25px' }}>Registered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.courses.map((reg) => (
                          <tr key={reg.id}>
                            <td style={{ paddingLeft: '25px' }}><span style={{ color: "#4f46e5", fontWeight: "700" }}>{reg.course?.code_en}</span></td>
                            <td>{reg.course?.name_en}</td>
                            <td>{reg.course?.credit_hours} hrs</td>
                            <td>
                              <span className={`tag-${reg.status === 'registered' ? 'dept_mandatory' : 'general_mandatory'}`} style={{ fontSize: '11px' }}>
                                {reg.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '25px', color: '#94a3b8', fontSize: '12px' }}>
                              {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-content glass-effect animate-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Add New Semester</h3>
              <p className="subtitle">Create a new academic period in the system.</p>
            </div>
            <form onSubmit={handleAddSemester}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Year</label>
                  <input type="number" value={newSemester.year} onChange={e => setNewSemester({ ...newSemester, year: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Term</label>
                  <select value={newSemester.term} onChange={e => setNewSemester({ ...newSemester, term: e.target.value })} required>
                    <option value="fall">Fall</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={newSemester.start_date} onChange={e => setNewSemester({ ...newSemester, start_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={newSemester.end_date} onChange={e => setNewSemester({ ...newSemester, end_date: e.target.value })} required />
                </div>
              </div>

              <div className="section-divider" style={{ margin: '20px 0', borderTop: '1px solid #e2e8f0' }}></div>
              <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--primary)' }}>Registration Window (Optional)</h4>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Reg. Start</label>
                  <input type="date" value={newSemester.reg_start} onChange={e => setNewSemester({ ...newSemester, reg_start: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Reg. End</label>
                  <input type="date" value={newSemester.reg_end} onChange={e => setNewSemester({ ...newSemester, reg_end: e.target.value })} />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '25px' }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Semester"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .active-border {
           box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 5px;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
        }
      `}} />
    </div>
  );
}
