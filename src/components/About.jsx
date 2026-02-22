import "./About.css";
import aboutImg from "../assets/library.jpg";

export default function About() {
  return (
    <section className="about-section">
      <div className="about-header">
        <h2>About the Faculty</h2>
        <p>
          The Faculty of Computers and Information at Arish University nurtures 
          the next generation of technology leaders. Our programs combine 
          cutting-edge research, hands-on experience, and innovative learning 
          to prepare students for the digital world.
        </p>
      </div>

      <div className="about-content">
        <div className="about-text">
          <h3>Who We Are</h3>
          <p>
            We offer a strong academic foundation in computing, software engineering, 
            information systems, and artificial intelligence. Our dedicated faculty 
            and modern laboratories empower students to develop practical skills, 
            creativity, and problem-solving abilities.
          </p>

          <h3>Our Mission</h3>
          <p>
            We are committed to equipping students with the knowledge and expertise 
            needed to excel locally and globally, fostering innovation, critical 
            thinking, and lifelong learning.
          </p>
        </div>

        <div className="about-image">
          <img src={aboutImg} alt="About FCI Arish University" />
        </div>
      </div>
    </section>
  );
}
