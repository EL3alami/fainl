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
            <span>Faculty of Computers and Information</span>
          </h1>

          <p>
            The official Student Information System (SIS) for Arish University.
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
