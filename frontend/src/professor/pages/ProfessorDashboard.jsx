import { useState, useEffect } from "react";
import { professorsApi } from "../../services/api";
import "../ProfessorLayout.css";

export default function ProfessorDashboard() {
  const [professorInfo, setProfessorInfo] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.info) {
      // Set info from the user.info object from Auth API
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

  if (loading || !professorInfo) return <div className="loading-container">Loading Professor Profile...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="title-section">
          <h1>Professor Portal | Welcome, {professorInfo.name_en || professorInfo.name_ar}</h1>
          <p className="breadcrumb">Academic · Dashboard · Profile</p>
        </div>
      </div>

      <div className="modern-grid animate-in">
        <div className="modern-card">
          <div className="card-header">
            <h3>👤 Profile Information</h3>
          </div>
          <div className="card-stats">
            <div className="stat-item">
              <span className="stat-label">Full Name</span>
              <span className="stat-value">{professorInfo.name_en}</span>
              <span className="stat-value" style={{ fontSize: '14px', dir: 'rtl' }}>{professorInfo.name_ar}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Title / Rank</span>
              <span className="stat-value" style={{ textTransform: 'capitalize' }}>
                {professorInfo.title?.replace('_', ' ')}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Department</span>
              <span className="stat-value">{professorInfo.department?.name_en || "General"}</span>
            </div>
          </div>
        </div>

        <div className="modern-card" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }}>
          <div className="card-header">
            <h3 style={{ color: 'white' }}>📈 Quick Overview</h3>
          </div>
          <div className="card-stats">
            <div className="stat-item">
              <span className="stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Assigned Courses</span>
              <span className="stat-value" style={{ color: 'white', fontSize: '32px' }}>{myCourses.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Active Semester</span>
              <span className="stat-value" style={{ color: 'white' }}>
                {myCourses[0]?.semester ? `${myCourses[0].semester.year} - ${myCourses[0].semester.term}` : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
