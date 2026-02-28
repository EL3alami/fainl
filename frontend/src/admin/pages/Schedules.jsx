import { useState, useEffect } from "react";
import { schedulesApi } from "../../services/api";
import "./AdminPages.css";

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await schedulesApi.getAll();
      setSchedules(data);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!window.confirm("Generating a new schedule will replace existing ones for the active semester. Continue?")) return;
    try {
      setLoading(true);
      const res = await schedulesApi.generate();
      alert(res.message);
      fetchSchedules();
    } catch (err) {
      alert(err.message || "Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await schedulesApi.delete(id);
      fetchSchedules();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-page animate-in">
      <div className="page-header">
        <div className="title-section">
          <h1>Course Timetables</h1>
          <p className="breadcrumb">Admin · Planning · Academic Schedule</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            ✨ Auto-Generate Schedule
          </button>
        </div>
      </div>

      <div className="data-section">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Processing academic schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="empty-state card-style">
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📅</div>
            <h3>No Schedules Found</h3>
            <p>Use the "Auto-Generate" button to create a timetable based on current course assignments.</p>
          </div>
        ) : (
          <div className="table-responsive card-style">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Course & Level</th>
                  <th>Professor</th>
                  <th>Time Slot</th>
                  <th>Location</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{s.course?.name_en}</div>
                      <div className="badge-wrapper" style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          Level {s.course?.level}
                        </span>
                        <span style={{ fontSize: '11px', background: '#f8fafc', color: '#64748b', padding: '2px 8px', borderRadius: '4px' }}>
                          {s.course?.code_en}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>👤</div>
                        <span>{s.professor?.name_en || "TBA"}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.day}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{s.start_time} - {s.end_time}</div>
                    </td>
                    <td>
                      <span className="tag-hall" style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}>
                        📍 {s.room}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="action-btn delete" onClick={() => handleDelete(s.id)} title="Remove Class">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
