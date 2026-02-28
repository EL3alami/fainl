import "./About.css";
import aboutImg from "../assets/library.jpg";

export default function About() {
  const newAboutImg = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop";

  return (
    <section className="about-section">
      <div className="about-header">
        <span className="about-badge">University Excellence</span>
        <h2>Inside the Faculty of Computers & Information</h2>
        <p>
          At Arish University, we are crafting the blueprint for the digital era.
          Our faculty stands as a beacon of knowledge, bridging the gap between
          fundamental science and groundbreaking technological application.
        </p>
      </div>

      <div className="about-content">
        <div className="about-text">
          <div className="feature-item">
            <h3>Visionary Leadership</h3>
            <p>
              We offer a strong academic foundation in computing and AI. Our modern
              laboratories empower students to develop practical skills and innovative
              problem-solving abilities.
            </p>
          </div>

          <div className="feature-item">
            <h3>Global Standards</h3>
            <p>
              We are committed to equipping students with expertise needed to excel
              globally, fostering digital innovation and lifelong academic success.
            </p>
          </div>
        </div>

        <div className="about-image">
          <img src={newAboutImg} alt="Modern Tech Campus" />
          <div className="image-decorative-box"></div>
          <div className="experience-badge">
            <span>25+</span>
            <span>Years of Excellence</span>
          </div>
        </div>
      </div>
    </section>
  );
}
