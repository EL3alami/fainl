import { useState, useEffect } from "react";
import { departmentsApi } from "../services/api";
import "./Academic.css";

export default function Academic() {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", details: "" });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await departmentsApi.getAll();
        setDepartments(data);
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  const openModal = (title, details) => {
    setModalContent({ title, details });
    setShowModal(true);
  };

  if (loading) return null;

  return (
    <section className="academic-section animate-in">
      <div className="section-header">
        <h2>Academic Excellence</h2>
        <p className="academic-subtitle">
          Explore our specialized departments. Each program is meticulously crafted to empower the next generation of technology leaders through rigorous academics and hands-on research.
        </p>
      </div>

      {/* Modern Stats Section */}
      <div className="stats">
        <div className="stat-box">
          <h3>15:1</h3>
          <p>Student Ratio</p>
        </div>
        <div className="stat-box">
          <h3>35</h3>
          <p>Avg. Class Size</p>
        </div>
        <div className="stat-box">
          <h3>12+</h3>
          <p>Research Labs</p>
        </div>
        <div className="stat-box">
          <h3>FCI</h3>
          <p>Accredited</p>
        </div>
      </div>

      {/* Dynamic Grid of Departments */}
      <div className="programs">
        {departments.map((dept, index) => (
          <div key={dept.id} className="program-card">
            {index === 0 && <span className="badge">Featured</span>}

            <div className="program-icon">
              {dept.code.substring(0, 2)}
            </div>

            <h4>{dept.name_en}</h4>
            <small>DEPT CODE: {dept.code}</small>

            <p>
              {dept.description_en || "Join our community to explore deep insights into this academic field."}
            </p>

            <button onClick={() => openModal(dept.name_en, dept.description_en)}>
              Explore Department Details
            </button>
          </div>
        ))}

        {departments.length === 0 && (
          <div className="empty-notice" style={{ gridColumn: '1/-1', padding: '40px', background: '#f8fafc', borderRadius: '20px', color: '#64748b' }}>
            Academic departments and programs are currently being synchronized.
          </div>
        )}
      </div>

      {/* Premium Modal View */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-decor"></div>
            <h3>{modalContent.title}</h3>
            <div className="modal-desc">
              {modalContent.details || "Academic overview for this department is being finalized. Please check back shortly for full curriculum and research alignment."}
            </div>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Back to Overview
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
