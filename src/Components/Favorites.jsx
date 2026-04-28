import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "./Favorites.css";
import ScrollToTop from "./ScrollToTop";

const TYPE_LABELS = { country: "🌍 Country", state: "📍 State", city: "🏙️ City" };
const SORT_OPTIONS = {
  NAME_ASC: { label: "Name (A-Z)", value: "name_asc" },
  NAME_DESC: { label: "Name (Z-A)", value: "name_desc" },
  RECENT: { label: "Recently Added", value: "recent" }
};

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      const stored = JSON.parse(sessionStorage.getItem("favorites") || "[]");
      const storedWithTimestamps = stored.map(item => ({
        ...item,
        timestamp: item.timestamp || Date.now()
      }));
      setFavorites(storedWithTimestamps);
      if (storedWithTimestamps.length !== stored.length) {
        sessionStorage.setItem("favorites", JSON.stringify(storedWithTimestamps));
      }
    } catch { setFavorites([]); }
  }, [isLoggedIn]);

  function removeFavorite(id) {
    const next = favorites.filter(f => f.id !== id);
    setFavorites(next);
    sessionStorage.setItem("favorites", JSON.stringify(next));
  }

  function addTimestampToFavorite(fav) {
    const updated = { ...fav, timestamp: Date.now() };
    return updated;
  }

  const getSortedFavorites = () => {
    let filtered = [...favorites];
    
    if (filterType !== "all") {
      filtered = filtered.filter(f => f.type === filterType);
    }
    
    switch(sortBy) {
      case "name_asc":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case "recent":
      default:
        return filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
  };

  const sortedFavorites = getSortedFavorites();

  if (!isLoggedIn) {
    return (
      <div className="home-root">
        <NavBar />
        <div className="favorites-empty">
          <div className="favorites-empty-icon">⭐</div>
          <h2>Sign in to see your favorites</h2>
          <p>Save countries, states, and cities you love while exploring the map.</p>
          <button className="btn btn-primary" onClick={() => navigate("/Login", { state: { from: "/Favorites" } })}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-root">
      <NavBar />
      <div className="favorites-page">
        <div className="favorites-header">
          <h1 className="favorites-title">⭐ My Favorites</h1>
          {favorites.length > 0 && (
            <div className="sort-container">
              <button 
                className="sort-button"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                Sort by: {SORT_OPTIONS[sortBy.toUpperCase()]?.label || "Recently Added"} ▼
              </button>
              {showSortMenu && (
                <div className="sort-menu">
                  {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                    <button
                      key={key}
                      className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                    >
                      {option.label}
                      {sortBy === option.value && " ✓"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">🗺️</div>
            <h2>No favorites yet</h2>
            <p>Click the ⭐ in any country, state, or city popup on the map to save it here.</p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Explore the Map
            </button>
          </div>
        ) : (
          <>
            <div className="favorites-count">
              {sortedFavorites.length} of {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {["all", "country", "state", "city"].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: filterType === type ? "2px solid #4caf50" : "1px solid #444",
                    backgroundColor: filterType === type ? "#4caf50" : "#2d2d2d",
                    color: filterType === type ? "white" : "#ccc",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: filterType === type ? "bold" : "normal",
                    transition: "all 0.2s"
                  }}
                >
                  {type === "all" ? "All" : TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            <div className="favorites-grid">
              {sortedFavorites.map(fav => (
                <div key={fav.id} className="favorite-card">
                  {fav.image && (
                    <img src={fav.image} alt={fav.name} className="favorite-card-image" />
                  )}
                  <div className="favorite-card-body">
                    <div className="favorite-card-type">{TYPE_LABELS[fav.type] || fav.type}</div>
                    <div className="favorite-card-name">{fav.name}</div>
                    {fav.subtitle && <div className="favorite-card-subtitle">{fav.subtitle}</div>}
                  </div>
                  <button
                    className="favorite-card-remove"
                    onClick={() => removeFavorite(fav.id)}
                    title="Remove from favorites"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
}