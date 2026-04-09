import { useState } from "react";
import { Link, useLocation } from "react-router";
import "./NavBar.css";

export default function Navbar({ searchQuery, onSearch, searchResults, showSearchResults, onSelectResult, onClearSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const location = useLocation();

  const links = [
    { label: "Explore", to: "/" },
    { label: "Countries", to: "/Countries" },
    { label: "States", to: "/States" },
    { label: "Cities", to: "/Cities" },
    { label: "Favorites", to: "/Favorites" },
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

          {/* Search bar — only show on Explore page */}
          {location.pathname === "/" && onSearch && (
            <div className="navbar-search-wrapper">
              <div className="navbar-search-input-row">
                <span className="navbar-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search countries, states, cities..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="navbar-search-input"
                />
                {searchQuery && (
                  <button className="navbar-search-clear" onClick={onClearSearch}>✕</button>
                )}
              </div>
              {showSearchResults && searchResults?.length > 0 && (
                <div className="navbar-search-dropdown">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="navbar-search-result"
                      onClick={() => onSelectResult(result)}
                    >
                      <span className="navbar-search-result-name">{result.name}</span>
                      <span className="navbar-search-result-type">
                        {result.type === "country" && "Country"}
                        {result.type === "state" && `${result.countryName} · State`}
                        {result.type === "city" && "City"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {showSearchResults && searchResults?.length === 0 && searchQuery?.length >= 2 && (
                <div className="navbar-search-no-results">No results for "{searchQuery}"</div>
              )}
            </div>
          )}

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