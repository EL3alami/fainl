import { useState } from "react";
import "./Academic.css";

export default function Academic() {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", details: [] });

  const openModal = (title, details) => {
    setModalContent({ title, details });
    setShowModal(true);
  };

  return (
    <section className="academic-section">
      {/* Title */}
      <h2>Academic Excellence</h2>
      <p className="academic-subtitle">
        Explore our three core programs designed to prepare students for the modern technology industry.
      </p>

      {/* Stats */}
      <div className="stats">
        <div className="stat-box">
          <h3>15:1</h3>
          <p>Student–Faculty Ratio</p>
        </div>
        <div className="stat-box">
          <h3>35</h3>
          <p>Average Class Size</p>
        </div>
        <div className="stat-box">
          <h3>10+</h3>
          <p>Specialized Labs</p>
        </div>
        <div className="stat-box">
          <h3>5+</h3>
          <p>Industry Partnerships</p>
        </div>
      </div>

      {/* Programs */}
      <div className="programs">

        {/* Computer Science */}
        <div className="program-card popular">
          <span className="badge">Popular</span>
          <h4>Computer Science (CS)</h4>
          <small>B.Sc.</small>
          <p>
            Strong foundations in algorithms, operating systems, artificial intelligence,
            and software development.
          </p>
          <ul>
            <li>Algorithms & Data Structures</li>
            <li>Operating Systems</li>
            <li>Software Engineering</li>
          </ul>
          <button
            onClick={() =>
              openModal("Computer Science (CS)", [
                "Strong programming foundations",
                "Advanced algorithms",
                "Operating Systems",
                "Software Engineering",
                "Artificial Intelligence",
                "Database Systems",
              ])
            }
          >
            Learn More
          </button>
        </div>

        {/* Information Systems */}
        <div className="program-card">
          <h4>Information Systems (IS)</h4>
          <small>B.Sc.</small>
          <p>
            Focuses on technology + business to improve organizational performance.
          </p>
          <ul>
            <li>Database Systems</li>
            <li>Business Analysis</li>
            <li>Enterprise Systems</li>
          </ul>
          <button
            onClick={() =>
              openModal("Information Systems (IS)", [
                "Database Management",
                "Business Analysis",
                "Enterprise Systems",
                "Decision Support Systems",
                "Business Intelligence",
              ])
            }
          >
            Learn More
          </button>
        </div>

        {/* Information Technology */}
        <div className="program-card">
          <h4>Information Technology (IT)</h4>
          <small>B.Sc.</small>
          <p>
            Specializes in managing, securing, and deploying modern IT systems.
          </p>
          <ul>
            <li>Network Administration</li>
            <li>Cloud Services</li>
            <li>IT Infrastructure</li>
          </ul>
          <button
            onClick={() =>
              openModal("Information Technology (IT)", [
                "Network Security",
                "Cloud Computing",
                "IT Infrastructure",
                "Server Administration",
                "System Deployment",
              ])
            }
          >
            Learn More
          </button>
        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{modalContent.title}</h3>
            <ul>
              {modalContent.details.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
