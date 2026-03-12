import { useState, useEffect } from "react";
import { professorsApi } from "../../services/api";
import {
  User,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  CreditCard,
  FileBadge
} from "lucide-react";
import "./ProfessorPages.css";

export default function ProfessorDashboard() {
  const [professorInfo, setProfessorInfo] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.info) {
      setProfessorInfo(user.info);
      fetchAssignments(user.info.id);
    }
  }, []);

  const fetchAssignments = async (profId) => {
    try {
      const data = await professorsApi.getMyCourses(profId);
      setMyCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = () => {
    alert("Faculty performance audit synchronized. System node active.");
  };

  if (loading || !professorInfo) return <div className="loading-container">Synchronizing Professor Infrastructure...</div>;

  return (
    <div className="prof-dash-wrapper">
      {/* PROFESSOR WELCOME BANNER V3 - PREMIUM */}
      <div className="prof-welcome-banner animate-in">
        <div className="prof-welcome-text">
          <div className="prof-badge-banner">
            <ShieldCheck size={14} /> <span>Verified Academic Node</span>
          </div>
          <h1>Welcome, <span style={{ color: '#10b981' }}>{professorInfo.name_en?.split(' ')[0]}</span></h1>
          <p>
            The faculty management system is synchronized. You have <strong>{myCourses.length} assigned courses</strong> across the <strong>{myCourses[0]?.semester?.year || 'current'}</strong> academic session.
          </p>
          <div className="welcome-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button className="primary-btn-v3" onClick={handleAudit} style={{ background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '14px', border: 'none', fontWeight: '1000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              System Performance <ArrowRight size={18} />
            </button>
            <button className="secondary-btn-v3" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '14px', fontWeight: '850', cursor: 'pointer' }}>
              Generate Session Report
            </button>
          </div>
        </div>
        <div className="banner-visuals-v3" style={{ display: 'none' }}>
          {/* Visual elements like the orbs in admin banner */}
        </div>
      </div>

      {/* STATS GRID V3 */}
      <div className="prof-stats-grid">
        <div className="prof-stat-card animate-in">
          <div className="prof-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <BookOpen size={28} />
          </div>
          <div className="prof-stat-info">
            <p>Active Courses</p>
            <h2>{myCourses.length}</h2>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '1000' }}>{professorInfo.department?.name_en || 'Faculty'} Assigned</span>
          </div>
        </div>

        <div className="prof-stat-card animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="prof-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <TrendingUp size={28} />
          </div>
          <div className="prof-stat-info">
            <p>Working Semester</p>
            <h2>{myCourses[0]?.semester?.term || 'Spring'}</h2>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '1000' }}>Academic Year {myCourses[0]?.semester?.year || '2026'}</span>
          </div>
        </div>

        <div className="prof-stat-card animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="prof-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <FileBadge size={28} />
          </div>
          <div className="prof-stat-info">
            <p>Assigned Credits</p>
            <h2>{myCourses.reduce((acc, c) => acc + (c.course?.credit_hours || 0), 0)}</h2>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '1000' }}>Total Monthly CH</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID V3 */}
      <div className="prof-main-grid">
        {/* LEFT: PROFILE INFO */}
        <div className="prof-profile-card animate-in">
          <div className="prof-avatar-large">
            {professorInfo.name_en?.charAt(0)}
          </div>
          <div className="prof-identity">
            <h3>{professorInfo.name_en}</h3>
            <span>{professorInfo.title?.replace('_', ' ') || 'Faculty Professor'}</span>
          </div>

          <div className="prof-info-list">
            <div className="prof-info-row">
              <span className="prof-info-label">Professional Rank</span>
              <div className="prof-info-value" style={{ textTransform: 'capitalize' }}>{professorInfo.title?.replace('_', ' ') || 'N/A'}</div>
            </div>
            <div className="prof-info-row">
              <span className="prof-info-label">Current Department</span>
              <div className="prof-info-value">{professorInfo.department?.name_en || 'General Department'}</div>
            </div>
            <div className="prof-info-row">
              <span className="prof-info-label">Academic Contact</span>
              <div className="prof-info-value">{professorInfo.admin_user?.email || 'N/A'}</div>
            </div>
            <div className="prof-info-row">
              <span className="prof-info-label">Teaching Experience</span>
              <div className="prof-info-value">High Performance Faculty Member</div>
            </div>
          </div>
        </div>

        {/* RIGHT: COURSE LIST PREVIEW */}
        <div className="prof-courses-card animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="prof-card-header">
            <h3><BookOpen size={20} style={{ marginRight: '10px', color: '#10b981' }} /> Assigned Academic Catalog</h3>
            <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontWeight: '1000' }}>LATEST SYNC</span>
          </div>

          <div className="courses-list-v3">
            {myCourses.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '850' }}>No academic courses are currently assigned.</p>}
            {myCourses.map((c, idx) => (
              <div key={idx} className="course-item-v3">
                <div className="course-icon-v3">📖</div>
                <div className="course-meta-v3">
                  <span className="course-name-v3">{c.course?.name_en}</span>
                  <span className="course-code-v3">CODE: {c.course?.code_en} · {c.course?.credit_hours} Credit Hours</span>
                </div>
                <div className="course-stat-v3">
                  <span className="course-type-v3">{c.course?.type?.replace('_', ' ') || 'Academic'}</span>
                </div>
              </div>
            ))}

            {myCourses.length > 0 && (
              <button onClick={() => window.location.href = '/professor/courses'} style={{ width: '100%', marginTop: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', padding: '14px', borderRadius: '14px', color: '#475569', fontWeight: '1000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                Explore Full Management Suite <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
