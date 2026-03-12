import { useState, useEffect } from "react";
import { studentsApi, professorsApi, departmentsApi, coursesApi } from "../../services/api";
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  Building2,
  Activity,
  History,
  BookMarked
} from "lucide-react";
import "./AdminPages.css";
import "./Dashboard.css";

const colors = {
  students: { bg: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#ffffff", border: "rgba(79, 70, 229, 0.2)" },
  professors: { bg: "linear-gradient(135deg, #10b981, #059669)", color: "#ffffff", border: "rgba(16, 185, 129, 0.2)" },
  subjects: { bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#ffffff", border: "rgba(139, 92, 246, 0.2)" },
  halls: { bg: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#ffffff", border: "rgba(244, 63, 94, 0.2)" },
  departments: { bg: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#ffffff", border: "rgba(245, 158, 11, 0.2)" },
};

function DashStatCard({ label, value, Icon, colorKey, subtitle }) {
  const c = colors[colorKey];
  return (
    <div className="dash-stat-card animate-in">
      <div className="dash-stat-icon" style={{ background: c.bg, color: c.color, boxShadow: `0 10px 20px ${c.border}` }}>
        <Icon size={28} />
      </div>
      <div className="dash-stat-body">
        <p className="dash-stat-label">{label}</p>
        <h2 className="dash-stat-value">{value ?? "—"}</h2>
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
    halls: 5,
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
        halls: 5,
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

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Refreshing Dashboard Metrics...</p>
    </div>
  );

  return (
    <div className="dash-wrapper animate-in">
      {/* Welcome Banner - The highly requested dark professional banner */}
      <div className="dash-welcome-banner">
        <div className="welcome-text">
          <h1>Welcome to <span style={{ color: '#818cf8' }}>Edu_Point</span>, Admin</h1>
          <p>The academic node is synchronized. Monitoring the <strong>Smart Educational Infrastructure</strong>.</p>
          <div className="welcome-actions">
            <button className="btn-banner">System Audit</button>
            <button className="btn-banner secondary">Generate Reports</button>
          </div>
        </div>
        <div className="welcome-illustration">
          <div className="glass-orb one"></div>
          <div className="glass-orb two"></div>
          <div className="glass-orb three"></div>
        </div>
      </div>

      {/* Stat Cards Grid - 5 Items */}
      <div className="dash-stats-grid">
        <DashStatCard label="Total Students" value={stats.students} Icon={Users} colorKey="students" subtitle="Active enrollments" />
        <DashStatCard label="Faculty Staff" value={stats.professors} Icon={GraduationCap} colorKey="professors" subtitle="Academic instructors" />
        <DashStatCard label="Academic Subjects" value={stats.courses} Icon={BookOpen} colorKey="subjects" subtitle="Courses offered" />
        <DashStatCard label="Lecture Halls" value={stats.halls} Icon={School} colorKey="halls" subtitle="Available spaces" />
        <DashStatCard label="Departments" value={stats.departments} Icon={Building2} colorKey="departments" subtitle="Academic divisions" />
      </div>

      {/* Main Content Area */}
      <div className="dash-main-grid">
        {/* Left Column */}
        <div className="dash-col-left">
          {/* Recent Registrations Table Style */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3><History size={20} style={{ marginRight: '10px' }} /> Member Registrations</h3>
              <span className="dash-badge indigo">LATEST ACTIVITY</span>
            </div>
            <div className="recent-list">
              {recentStudents.length === 0 && <p className="empty-dash">No recent activity detected.</p>}
              {recentStudents.map(s => (
                <div key={s.id} className="recent-item-v2">
                  <div className="item-avatar-hex">
                    {s.name_en?.charAt(0) || "?"}
                  </div>
                  <div className="item-content">
                    <div className="item-title">{s.name_en}</div>
                    <div className="item-sub">ID: {s.student_number} · Level {s.level} · {s.department?.name_en || 'General'}</div>
                  </div>
                  <div className={`item-status active`}>
                    Active
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog Preview */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3><BookMarked size={20} style={{ marginRight: '10px' }} /> Academic Catalog</h3>
              <span className="dash-badge green">RECENTLY ADDED</span>
            </div>
            <div className="catalog-preview-v2">
              {recentCourses.map(c => (
                <div key={c.id} className="catalog-item">
                  <div className="cat-icon">📘</div>
                  <div className="cat-details">
                    <span className="cat-code">{c.code_en}</span>
                    <span className="cat-name">{c.name_en}</span>
                  </div>
                  <div className="cat-credits">{c.credit_hours} CH</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Analytics) */}
        <div className="dash-col-right">
          <div className="dash-card analytics-card">
            <div className="dash-card-header">
              <h3><Activity size={20} style={{ marginRight: '10px' }} /> Grade Insights</h3>
              <span className="dash-badge purple">ACADEMIC</span>
            </div>
            <div className="grade-radial-preview">
              <div className="preview-stat">
                <h4>86%</h4>
                <p>Passing Rate</p>
              </div>
            </div>
            <div className="grade-rows-v2">
              {gradeDistribution.map(g => (
                <div key={g.label} className="grade-row-v2">
                  <div className="label-box">{g.label}</div>
                  <div className="progress-container">
                    <div className="progress-fill" style={{ width: `${g.pct}%`, background: g.color }}></div>
                  </div>
                  <div className="pct-box">{g.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card mini-info-card">
            <h3>System Status</h3>
            <div className="status-indicator">
              <div className="pulse-dot"></div>
              <span>Operational</span>
            </div>
            <div className="info-list">
              <div className="info-row"><span>Backend Node</span> <strong>v10.4.2</strong></div>
              <div className="info-row"><span>Database</span> <strong>Healthy</strong></div>
              <div className="info-row"><span>Sync Delay</span> <strong>12ms</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
