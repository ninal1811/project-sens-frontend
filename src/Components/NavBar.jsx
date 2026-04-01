import { useState } from "react";
import { Link, useLocation } from "react-router";
import "./NavBar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const location = useLocation();

  const links = [
    { label: "Explore", to: "/" },
    { label: "Countries", to: "/Countries" },
    { label: "States", to: "/States" },
    { label: "Cities", to: "/Cities" },
    { label: "Login", to: "/Login" },
  ];

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-icon">🌍</span>
            <span className="navbar-logo-text">
              Project<span className="navbar-logo-accent">Sens</span>
            </span>
          </Link>

          {/* Tagline */}
          <span className="navbar-tagline">Explore food culture, worldwide</span>

          {/* Nav links */}
          <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
            {links.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`navbar-link ${location.pathname === to ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}

            {/* Learn More button */}
            <button
              className="navbar-learn-more"
              onClick={() => setShowAbout(true)}
            >
              Learn More
            </button>
          </nav>

          {/* Hamburger (mobile) */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

        </div>
      </header>

      {/* About popup */}
      {showAbout && (
        <div className="about-overlay" onClick={() => setShowAbout(false)}>
          <div className="about-box" onClick={(e) => e.stopPropagation()}>
            Project Sens is an interactive map platform that lets users explore
            countries, states, and cities through location-based information,
            food culture, and recommended restaurants.
            <button
              className="about-close-btn"
              onClick={() => setShowAbout(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}