import "./Hero.css";
import heroImg from "../assets/hero.jpg";

export default function Hero() {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      <div className="overlay">
        <div className="hero-content">
          <h1>
            Shape Your Future at
            <br />
            <span style={{ color: '#818cf8', fontWeight: '1000' }}>Edu_Point</span>
          </h1>

          <p>
            The official Smart Academic Platform for progressive learning.
            Empowering students and faculty with modern tools for innovation and academic excellence.
          </p>

          <div className="hero-actions">
            <a href="#programs" className="primary-btn">Explore Programs</a>
          </div>
        </div>
      </div>
    </section>
  );
}
