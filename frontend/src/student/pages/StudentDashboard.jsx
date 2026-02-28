import { useState, useEffect } from "react";
import { registrationApi, gradesApi, newsApi, studentsApi } from "../../services/api";
import { withStudentVerification } from "./studentAuth";
import "../../admin/pages/AdminPages.css";
import "./Dashboard.css";

function StudentDashboardContent({ studentSession, onLogout }) {
  const sessionStudent = studentSession?.student;
  const semester = studentSession?.semester;
  const [student, setStudent] = useState(sessionStudent);
  const [enrollments, setEnrollments] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStudent?.id) fetchData();
  }, [sessionStudent]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrolled, newsData, freshStudent] = await Promise.all([
        registrationApi.getMyCourses(sessionStudent.id),
        newsApi.getAll('published=1'),
        studentsApi.get(sessionStudent.id).catch(() => null)
      ]);
      setEnrollments(enrolled);
      setNews(newsData.slice(0, 3)); // Display only latest 3
      if (freshStudent) {
        setStudent(freshStudent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalHrs = enrollments.reduce((s, e) => s + (e.course?.credit_hours || 0), 0);

  return (
    <div className="stu-dash-wrapper animate-in">
      {/* Hero Banner */}
      <div className="stu-dash-banner">
        <div className="stu-dash-avatar">{student?.name_en?.charAt(0) || "S"}</div>
        <div className="stu-dash-greeting">
          <h1>Welcome back, {student?.name_en?.split(" ")[0]}! 👋</h1>
          <p>{student?.department?.name_en} · Level {student?.level} · {student?.student_number}</p>
        </div>
        <button className="btn-secondary stu-logout-btn" onClick={onLogout}>Logout</button>
      </div>

      {/* Quick Stats */}
      <div className="stu-stats-row">
        <div className="stu-stat-pill" style={{ "--clr": "#4f46e5" }}>
          <span className="stu-stat-icon">📊</span>
          <div>
            <span className="stu-stat-val">{parseFloat(student?.cgpa || 0).toFixed(3)}</span>
            <span className="stu-stat-lbl">CGPA</span>
          </div>
        </div>
        <div className="stu-stat-pill" style={{ "--clr": "#10b981" }}>
          <span className="stu-stat-icon">✅</span>
          <div>
            <span className="stu-stat-val">{student?.total_passed_hrs || 0}</span>
            <span className="stu-stat-lbl">Passed Hrs</span>
          </div>
        </div>
        <div className="stu-stat-pill" style={{ "--clr": "#f59e0b" }}>
          <span className="stu-stat-icon">📚</span>
          <div>
            <span className="stu-stat-val">{enrollments.length}</span>
            <span className="stu-stat-lbl">Enrolled</span>
          </div>
        </div>
        <div className="stu-stat-pill" style={{ "--clr": "#8b5cf6" }}>
          <span className="stu-stat-icon">⏱️</span>
          <div>
            <span className="stu-stat-val">{totalHrs}</span>
            <span className="stu-stat-lbl">Current Hrs</span>
          </div>
        </div>
      </div>

      {/* Active Semester Info */}
      {semester && (
        <div className="stu-semester-banner">
          <span className="tag-dept_mandatory">ACTIVE SEMESTER</span>
          <strong style={{ marginLeft: 12 }}>{semester.year} — {semester.term.charAt(0).toUpperCase() + semester.term.slice(1)}</strong>
          <span style={{ marginLeft: 20, color: "#64748b", fontSize: 14 }}>
            {semester.start_date} → {semester.end_date}
          </span>
        </div>
      )}

      {/* Enrolled Courses & News Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 30, alignItems: "start" }}>
        {/* Enrolled Courses */}
        <div className="dash-card" style={{ marginBottom: 0 }}>
          <div className="dash-card-header">
            <h3>My Registered Courses</h3>
            <span className="dash-badge indigo">{enrollments.length} Courses</span>
          </div>

          {loading ? (
            <p style={{ color: "#94a3b8", padding: "20px 0" }}>Loading courses...</p>
          ) : enrollments.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0" }}>
              No courses registered for this semester yet. Go to <strong>Course Registration</strong> to enroll.
            </div>
          ) : (
            <div className="table-wrapper card-style" style={{ boxShadow: "none", border: "1px solid #f1f5f9" }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course</th>
                    <th>Credits</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => (
                    <tr key={e.id}>
                      <td><strong style={{ color: "#4f46e5" }}>{e.course?.code_en}</strong></td>
                      <td>{e.course?.name_en}</td>
                      <td>{e.course?.credit_hours} hrs</td>
                      <td>
                        <span className={`tag-${e.status === "registered" ? "dept_mandatory" : "general_mandatory"}`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Latest Announcements */}
        <div className="dash-card" style={{ marginBottom: 0 }}>
          <div className="dash-card-header">
            <h3>Latest Announcements</h3>
            <a href="#" style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", textDecoration: "none" }}>View All</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {news.length === 0 && !loading && <p style={{ color: "#94a3b8" }}>No news available.</p>}
            {news.map(item => (
              <div key={item.id} className="news-item-mini" style={{ display: "flex", gap: 14, padding: "12px", borderRadius: 16, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                <div style={{ width: 80, height: 60, borderRadius: 10, overflow: "hidden", background: "#e2e8f0", flexShrink: 0 }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📰</div>}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withStudentVerification(StudentDashboardContent);
