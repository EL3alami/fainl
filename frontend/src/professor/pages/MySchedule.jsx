import { useState, useEffect } from "react";
import { professorsApi } from "../../services/api";
import "../../admin/pages/AdminPages.css";

export default function MySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [professor, setProfessor] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.info) {
      setProfessor(user.info);
      fetchMySchedule(user.info.id);
    }
  }, []);

  const fetchMySchedule = async (id) => {
    try {
      setLoading(true);
      const data = await professorsApi.getMySchedule(id);

      const mapped = data.map(s => ({
        id: s.id,
        course: s.course?.name_en,
        code: s.course?.code_en,
        level: s.course?.level,
        day: s.day,
        time: `${s.start_time} - ${s.end_time}`,
        room: s.room,
        type: s.type
      }));

      // Sort by day
      const dayOrder = { Saturday: 0, Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5 };
      mapped.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));

      setSchedule(mapped);
    } catch (err) {
      console.error("Failed to fetch professor schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  return (
    <div className="admin-page animate-in">
      <div className="page-header">
        <div className="title-section">
          <h1>My Teaching Schedule</h1>
          <p className="breadcrumb">Professor · {professor?.name_en} · Active Semester</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading your timetable...</div>
      ) : schedule.length === 0 ? (
        <div className="empty-state card-style">
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>📅</div>
          <h3>No Classes Assigned</h3>
          <p>You haven't been assigned any teaching slots for the current active semester yet.</p>
        </div>
      ) : (
        <div className="data-section">
          <div className="table-wrapper card-style" style={{ marginBottom: "30px" }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time Slot</th>
                  <th>Course & Level</th>
                  <th>Location</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((cls) => (
                  <tr key={cls.id}>
                    <td style={{ fontWeight: 800, color: '#4f46e5' }}>{cls.day}</td>
                    <td style={{ fontWeight: 600 }}>{cls.time}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{cls.course}</div>
                      <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                        <span style={{ fontSize: '10px', background: '#eef2ff', color: '#4f46e5', padding: '1px 6px', borderRadius: '4px' }}>LVL {cls.level}</span>
                        <small style={{ color: '#64748b' }}>{cls.code}</small>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                        🏛️ {cls.room}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>{cls.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Weekly Outlook</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {days.map((day) => {
              const dayClasses = schedule.filter((cls) => cls.day === day);
              return (
                <div key={day} className="card-style" style={{ padding: "20px", borderTop: dayClasses.length > 0 ? "4px solid #4f46e5" : "1px solid #e2e8f0" }}>
                  <h3 style={{ marginTop: 0, marginBottom: '15px', color: dayClasses.length > 0 ? "#1e293b" : "#94a3b8", display: 'flex', justifyContent: 'space-between' }}>
                    {day}
                    {dayClasses.length > 0 && <span style={{ fontSize: '12px', background: '#4f46e5', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{dayClasses.length}</span>}
                  </h3>
                  {dayClasses.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "14px", fontStyle: 'italic' }}>No lectures today</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {dayClasses.map((cls) => (
                        <div key={cls.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid #7c3aed" }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{cls.course}</div>
                          <div style={{ fontSize: '12px', color: "#64748b", display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span>⏰ {cls.time}</span>
                            <span>🏛️ {cls.room}</span>
                            <span style={{ fontWeight: 600, color: '#4f46e5' }}>{cls.type === 'lecture' ? '📖 Lecture' : '🔬 Laboratory'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
