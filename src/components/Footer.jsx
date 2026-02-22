// Footer.jsx
import "./Footer.css";
import Logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-container">

        {/* Who We Are */}
        <div className="footer-col">
          <h3>Who We Are</h3>
          <ul>
            <li><a href="#">About the University</a></li>
              <li><a href="#">Arish University</a></li>
            <li><a href="#">Faculty of Computers & Information</a></li>
            <li><a href="#">Complaints & Suggestions</a></li>
            <li><a href="#">Your Opinion</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        {/* Useful Links */}
        <div className="footer-col">
          <h3>Your Links</h3>
          <ul>
            <li><a href="#">Site Map</a></li>
            <li><a href="#">Egyptian Universities</a></li>
            <li><a href="#">Research Academy</a></li>
            <li><a href="#">Egypt Knowledge Bank</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h3>Contact Us</h3>
          <ul>
            <li>📞 2-26831474+</li>
            <li>📧 ums.support@cis.asu.edu.eg</li>
          </ul>
        </div>

        {/* Logo + Social */}
        <div className="footer-col footer-logo">
          <img src={Logo} alt="UMS Logo" />
          <div className="social-icons">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-youtube"></i>
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-twitter"></i>
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        FCI-Al-Arish 2020 - 2025 ©
      </div>
    </footer>
  );
}
