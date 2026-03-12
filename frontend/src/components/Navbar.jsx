import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  Send,
  HelpCircle,
  LogIn
} from "lucide-react";
import { useState, useEffect } from "react";
import "./Navbar.css";
import logoImg from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <header className={`navbar-container ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-wrapper">
        {/* LOGO AREA */}
        <div className="nav-brand-section" onClick={() => navigate("/")}>
          <div className="logo-box">
            <img src={logoImg} alt="Edu_Point Logo" />
          </div>
          <div className="brand-text">
            <h1 className="brand-name">Edu_Point</h1>
            <span className="brand-motto">Smart Academic Operating System</span>
          </div>
        </div>

        {/* DESKTOP LINKS */}
        <nav className="nav-desktop-links">
          <div className="nav-link-item">
            <a href="#home">Home</a>
            <div className="active-dot"></div>
          </div>
          <div className="nav-link-item">
            <a href="#about">About</a>
          </div>
          <div className="nav-link-item">
            <a href="#departments">Departments</a>
          </div>
          <div className="nav-link-item dropdown">
            <a href="#programs">Resources <ChevronRight size={14} className="chevron-icon" /></a>
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <div className="icon-box bg-indigo-50 text-indigo-600"><BookOpen size={18} /></div>
                <div className="item-txt">
                  <p className="item-title">E-Library</p>
                  <p className="item-desc">Digital academic resources</p>
                </div>
              </div>
              <div className="dropdown-item">
                <div className="icon-box bg-emerald-50 text-emerald-600"><LayoutDashboard size={18} /></div>
                <div className="item-txt">
                  <p className="item-title">Course Catalog</p>
                  <p className="item-desc">Browse available subjects</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-link-item">
            <a href="#contact">Contact</a>
          </div>
        </nav>

        {/* ACTION BUTTONS */}
        <div className="nav-actions">
          <button className="help-icon-btn">
            <HelpCircle size={20} />
          </button>
          <button className="portal-launch-btn" onClick={handleLoginClick}>
            <LogIn size={18} className="btn-icon" />
            <span>Login Area</span>
          </button>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-content">
          <div className="mobile-links">
            <a href="#home" onClick={() => setMobileMenuOpen(false)}><ChevronRight size={18} /> Home</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}><ChevronRight size={18} /> About Platform</a>
            <a href="#departments" onClick={() => setMobileMenuOpen(false)}><ChevronRight size={18} /> Departments</a>
            <a href="#programs" onClick={() => setMobileMenuOpen(false)}><ChevronRight size={18} /> Program Catalog</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}><ChevronRight size={18} /> Support</a>
          </div>
          <button className="mobile-login-btn" onClick={handleLoginClick}>
            Proceed to Secure Login
          </button>
        </div>
      </div>
    </header>
  );
}
