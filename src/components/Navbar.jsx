import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import logoImg from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="logo">
          <img src={logoImg} alt="FCI Arish Logo" />
        </div>

        <div className="brand">
          <h3>Faculty of Computers and Information</h3>
          <p>Arish University</p>
        </div>
      </div>

      <nav className="nav-links">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#departments">Departments</a>
        <a href="#programs">Programs</a>
        <a href="#news">News</a>
        <a href="#contact">Contact</a>
      </nav>

      <button className="apply-btn" onClick={handleLoginClick}>
        Log In
      </button>
    </header>
  );
}
