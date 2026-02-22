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
            Join Arish University and begin your journey into the world of
            technology, innovation, and advanced computing sciences.
          </p>

          <div className="hero-actions">
            <a href="#programs" className="primary-btn">Explore Programs</a>
          </div>
        </div>
      </div>
    </section>
  );
}
