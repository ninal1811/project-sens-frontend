import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import "./NavBar.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const DEVELOPER_EMAIL = import.meta.env.VITE_DEVELOPER_EMAIL;

function capitalizeName(name) {
  if (!name) return '';
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export default function Navbar({ searchQuery, onSearch, searchResults, showSearchResults, onSelectResult, onClearSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem("loggedIn") === "true");
  const location = useLocation();
  const isDeveloper = isLoggedIn && !!DEVELOPER_EMAIL && sessionStorage.getItem('email') === DEVELOPER_EMAIL;
  const navigate = useNavigate();

  async function checkLoginStatus() {
    const sessionStoreLoggedIn = sessionStorage.getItem("loggedIn") === "true";
    try {
      const response = await fetch(`${API_URL}/auth/session`, {
        credentials: 'include'
      });
      const data = await response.json();
      // If the API confirms logged in, trust it. If it says no,
      // fall back to sessionStorage (backend cookie may not persist cross-origin).
      setIsLoggedIn(data.loggedIn || sessionStoreLoggedIn);
    } catch (error) {
      console.error('Session check failed:', error);
      setIsLoggedIn(sessionStoreLoggedIn);
    }
  }

  // Check login status on mount and when location changes
  useEffect(() => {
    console.log('NavBar useEffect triggered, pathname:', location.pathname);
    const timer = setTimeout(() => {
      checkLoginStatus();
    }, 0);
  
    return () => clearTimeout(timer);
  }, [location.pathname]);


  async function handleLogout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear session storage
      sessionStorage.removeItem('loggedIn');
      sessionStorage.removeItem('email');
      
      setIsLoggedIn(false);
      setMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  const links = [
    { label: "Explore", to: "/" },
    { label: "Countries", to: "/Countries" },
    { label: "States", to: "/States" },
    { label: "Cities", to: "/Cities" },
    { label: "Favorites", to: "/Favorites" },
  ];

  console.log('NavBar rendering, isLoggedIn:', isLoggedIn);

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
                      <span className="navbar-search-result-name">{capitalizeName(result.name)}</span>
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

            {/* Developer-only: Logs */}
            {isDeveloper && (
              <Link
                to="/Logs"
                className={`navbar-link navbar-dev-link ${location.pathname === "/Logs" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Logs
              </Link>
            )}

            {/* Login/Logout */}
            {isLoggedIn ? (
              <button
                className="navbar-link navbar-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={`navbar-link ${location.pathname === "/login" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}

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