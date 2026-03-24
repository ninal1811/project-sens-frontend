import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import axios from 'axios'
import './Cities.css'

function CityCard({ cityData }) {
  const [open, setOpen] = useState(false);
  const { city, state_code, country_code, rec_restaurant } = cityData || {};

  return (
    <li className="city-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`city-toggle-btn ${open ? 'open' : ''}`}
      >
        <span>
          {city ?? "Unnamed city"} {state_code ? `(${state_code})` : ""}
          <span className="city-country-code">{country_code}</span>
        </span>
        <span className="city-expand-icon">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
       <div className="city-details">
       <p className="city-detail-text">
         <strong className="city-detail-label">City:</strong> {city ?? "—"}
       </p>
       <p className="city-detail-text">
         <strong className="city-detail-label">State Code:</strong> {state_code ?? "—"}
       </p>
       <p className="city-detail-text">
         <strong className="city-detail-label">Country Code:</strong> {country_code ?? "—"}
       </p>
       <p className="city-detail-text">
         <strong className="city-detail-label">Restaurant:</strong> {rec_restaurant ?? "—"}
       </p>
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

  const baseURL = import.meta.env.VITE_API_URL;

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
    <div className="cities-container-page">
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap", borderBottom: "1px solid #333", paddingBottom: "15px" }}>
        <Link to="/" className="nav-btn-states">← Back to Home</Link>
        <Link to="/Countries" className="nav-btn-states">View Countries</Link>
        <Link to="/States" className="nav-btn-states">View States</Link>
      </div>

      <h1 className="cities-page-title">Cities Database</h1>

      {error && (
        <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: "4px", color: "#c62828", display: "flex", alignItems: "center", gap: "15px" }}>
          <strong>Error:</strong> {error}
          <button onClick={fetchCities} className="error-inline-btn">Retry</button>
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
        <div className="loading-block">
          <div className="spinner"></div>
          <p>Loading cities...</p>
        </div>
      )}

      {displayData && displayData.length > 0 && (
        <ul className="city-list-page">
          {displayData.map((cityObj, idx) => (
            <CityCard
              cityData={cityObj}
              key={`${cityObj?.city ?? "no-city"}-${idx}`}
            />
          ))}
        </ul>
      )}

      {!isLoading && displayData?.length === 0 && !searchQuery && (
        <div className="empty-state-box">
          <p>No cities found.</p>
        </div>
      )}
    </div>
  );
}