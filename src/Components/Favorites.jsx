import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "./Favorites.css";

const TYPE_LABELS = { country: "🌍 Country", state: "📍 State", city: "🏙️ City" };

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      const stored = JSON.parse(sessionStorage.getItem("favorites") || "[]");
      setFavorites(stored);
    } catch { setFavorites([]); }
  }, [isLoggedIn]);

  function removeFavorite(id) {
    const next = favorites.filter(f => f.id !== id);
    setFavorites(next);
    sessionStorage.setItem("favorites", JSON.stringify(next));
  }

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
        <h1 className="favorites-title">⭐ My Favorites</h1>

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
          <div className="favorites-grid">
            {favorites.map(fav => (
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
        )}
      </div>
    </div>
  );
}