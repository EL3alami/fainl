import { useState, useEffect } from "react";
import { studentsApi, professorsApi, departmentsApi, coursesApi } from "../../services/api";
import "./AdminPages.css";
import "./Dashboard.css";

const icons = {
  students: "🎓",
  professors: "👨‍🏫",
  departments: "🏛️",
  courses: "📚",
};

const colors = {
  students: { bg: "rgba(79, 70, 229, 0.08)", color: "#4f46e5", border: "rgba(79, 70, 229, 0.2)" },
  professors: { bg: "rgba(16, 185, 129, 0.08)", color: "#10b981", border: "rgba(16, 185, 129, 0.2)" },
  departments: { bg: "rgba(245, 158, 11, 0.08)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.2)" },
  courses: { bg: "rgba(139, 92, 246, 0.08)", color: "#8b5cf6", border: "rgba(139, 92, 246, 0.2)" },
};

function DashStatCard({ label, value, icon, colorKey, subtitle }) {
  const c = colors[colorKey];
  return (
    <div className="dash-stat-card animate-in" style={{ borderColor: c.border }}>
      <div className="dash-stat-icon" style={{ background: c.bg, color: c.color }}>
        {icon}
      </div>
      <div className="dash-stat-body">
        <p className="dash-stat-label">{label}</p>
        <h2 className="dash-stat-value" style={{ color: c.color }}>{value ?? "—"}</h2>
        {subtitle && <p className="dash-stat-sub">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: null,
    professors: null,
    departments: null,
    courses: null,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [stuData, profData, deptData, courseData] = await Promise.all([
        studentsApi.getAll(),
        professorsApi.getAll(),
        departmentsApi.getAll(),
        coursesApi.getAll(),
      ]);

      setStats({
        students: stuData.length,
        professors: profData.length,
        departments: deptData.length,
        courses: courseData.length,
      });

      setRecentStudents(stuData.slice(-5).reverse());
      setRecentCourses(courseData.slice(-6).reverse());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const gradeDistribution = [
    { label: "A", pct: 28, color: "#10b981" },
    { label: "B", pct: 35, color: "#4f46e5" },
    { label: "C", pct: 22, color: "#f59e0b" },
    { label: "D", pct: 10, color: "#8b5cf6" },
    { label: "F", pct: 5, color: "#ef4444" },
  ];

  if (loading) return <div className="loading-container">Loading dashboard...</div>;

  return (
    <div className="dash-wrapper animate-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Admin Dashboard</h1>
          <p className="breadcrumb">Faculty of Computers & Information · Overview</p>
        </div>
        <div className="dash-time">
          <span>📅 {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats-grid">
        <DashStatCard label="Total Students" value={stats.students} icon={icons.students} colorKey="students" subtitle="Enrolled this year" />
        <DashStatCard label="Faculty Members" value={stats.professors} icon={icons.professors} colorKey="professors" subtitle="Active professors" />
        <DashStatCard label="Departments" value={stats.departments} icon={icons.departments} colorKey="departments" subtitle="Academic divisions" />
        <DashStatCard label="Courses Offered" value={stats.courses} icon={icons.courses} colorKey="courses" subtitle="Current curriculum" />
      </div>

      {/* Middle Row */}
      <div className="dash-mid-row">
        {/* Recent Students */}
        <div className="dash-card" style={{ flex: 1 }}>
          <div className="dash-card-header">
            <h3>Recent Students</h3>
            <span className="dash-badge indigo">Latest Added</span>
          </div>
          <div className="recent-list">
            {recentStudents.length === 0 && <p className="empty-dash">No students yet.</p>}
            {recentStudents.map(s => (
              <div key={s.id} className="recent-item">
                <div className="recent-avatar">{s.name_en?.charAt(0) || "?"}</div>
                <div className="recent-info">
                  <strong>{s.name_en}</strong>
                  <span>#{s.student_number} · Level {s.level}</span>
                </div>
                <span className={`status-pill ${s.status}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="dash-card" style={{ minWidth: 280, flex: "none" }}>
          <div className="dash-card-header">
            <h3>Grade Distribution</h3>
            <span className="dash-badge purple">Academic</span>
          </div>
          <div className="grade-bars">
            {gradeDistribution.map(g => (
              <div key={g.label} className="grade-bar-row">
                <span className="grade-bar-label">{g.label}</span>
                <div className="grade-bar-bg">
                  <div
                    className="grade-bar-fill"
                    style={{ width: `${g.pct}%`, background: g.color }}
                  />
                </div>
                <span className="grade-bar-pct">{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Catalogue Preview */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>Course Catalogue Preview</h3>
          <span className="dash-badge green">Latest Courses</span>
        </div>
        <div className="course-preview-grid">
          {recentCourses.map(c => (
            <div key={c.id} className="course-chip">
              <span className="chip-code">{c.code_en}</span>
              <span className="chip-name">{c.name_en}</span>
              <span className="chip-hrs">{c.credit_hours}h</span>
            </div>
          ))}
          {recentCourses.length === 0 && <p className="empty-dash">No courses yet.</p>}
        </div>
      </div>
    </div>
  );
}
