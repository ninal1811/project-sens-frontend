import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import axios from 'axios'

function CityCard({ cityData }) {
  const [open, setOpen] = useState(false);
  const { city, state_code, country_code, rec_restaurant } = cityData || {};

  return (
    <li style={{ marginBottom: "1rem", border: "1px solid #333", borderRadius: "4px", backgroundColor: "#1a1a1a" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "0.75rem 1rem",
          cursor: "pointer",
          border: "none",
          backgroundColor: "#2d2d2d",
          color: "#ffffff",
          borderRadius: open ? "4px 4px 0 0" : "4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 500,
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3d3d3d"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2d2d2d"}
      >
        <span>
          {city ?? "Unnamed city"} {state_code ? `(${state_code})` : ""}
          <span style={{ marginLeft: "10px", fontSize: "12px", color: "#888" }}>{country_code}</span>
        </span>
        <span style={{ color: "#888" }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #333", backgroundColor: "#242424", borderRadius: "0 0 4px 4px" }}>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>City:</strong> {city ?? "—"}</p>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>State Code:</strong> {state_code ?? "—"}</p>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>Country Code:</strong> {country_code ?? "—"}</p>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>Restaurant:</strong> {rec_restaurant ?? "—"}</p>
        </div>
      )}
    </li>
  );
}

export default function Cities() {
  const [results, setResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.REACT_APP_API_URL || 'https://projectsens.pythonanywhere.com';

  const sortCitiesAlphabetically = (citiesArray) => {
    if (!citiesArray || !Array.isArray(citiesArray)) return [];
    return [...citiesArray].sort((a, b) => {
      const nameA = (a.city || '').toLowerCase();
      const nameB = (b.city || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  };

  const fetchCities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${baseURL}/cities/read`);
      const raw = data?.Cities ?? data?.cities ?? {};
      const sortedList = sortCitiesAlphabetically(Array.isArray(raw) ? raw : Object.values(raw));
      setResults(sortedList);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch cities');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const searchCities = useCallback((query) => {
    if (query.length < 2) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      try {
        if (!results || results.length === 0) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        const searchLower = query.toLowerCase();

        const filtered = results.filter(city => {
          const nameMatch = city.city?.toLowerCase().includes(searchLower) || false;
          const stateMatch = city.state_code?.toLowerCase().includes(searchLower) || false;
          const countryMatch = city.country_code?.toLowerCase().includes(searchLower) || false;
          const restaurantMatch = city.rec_restaurant?.toLowerCase().includes(searchLower) || false;
          return nameMatch || stateMatch || countryMatch || restaurantMatch;
        });

        console.log(`Found ${filtered.length} results for "${query}"`);
        const sortedFiltered = sortCitiesAlphabetically(filtered);
        setSearchResults(sortedFiltered);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [results]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchCities(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const displayData = searchResults || (results ? sortCitiesAlphabetically(results) : null);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", minHeight: "100vh", color: "#ffffff" }}>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap", borderBottom: "1px solid #333", paddingBottom: "15px" }}>
        <Link to="/" className="nav-btn-states">← Back to Home</Link>
        <Link to="/Countries" className="nav-btn-states">View Countries</Link>
        <Link to="/States" className="nav-btn-states">View States</Link>
      </div>

      <h1 style={{ marginBottom: "25px", fontSize: "28px", fontWeight: 600 }}>Cities Database</h1>

      {error && (
        <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: "4px", color: "#c62828", display: "flex", alignItems: "center", gap: "15px" }}>
          <strong>Error:</strong> {error}
          <button onClick={fetchCities} style={{ padding: "5px 10px", background: "#c62828", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search cities by name, state, country, or restaurant..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
            onFocus={(e) => e.target.style.borderColor = "#4caf50"}
            onBlur={(e) => e.target.style.borderColor = "#333"}
          />
          {searchQuery && (
            <button onClick={clearSearch} className="clear-btn"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#444"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#333"}
            >Clear</button>
          )}
        </div>

        {isSearching && (
          <div className="searching-indicator">Searching...</div>
        )}

        {searchQuery && searchResults?.length === 0 && !isSearching && (
          <div className="no-results">No cities found matching "{searchQuery}"</div>
        )}
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          <div className="spinner"></div>
          <p style={{ marginTop: "15px" }}>Loading cities...</p>
        </div>
      )}

      {displayData && displayData.length > 0 && (
        <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
          {displayData.map((cityObj, idx) => (
            <CityCard
              cityData={cityObj}
              key={`${cityObj?.city ?? "no-city"}-${idx}`}
            />
          ))}
        </ul>
      )}

      {!isLoading && displayData?.length === 0 && !searchQuery && (
        <div style={{ textAlign: "center", padding: "50px 20px", backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #333" }}>
          <p style={{ color: "#888", fontSize: "16px" }}>No cities found.</p>
        </div>
      )}
    </div>
  );
}