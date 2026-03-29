import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import axios from 'axios'
import './Cities.css'

function CityCard({ cityData, onDelete }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { city, state_code, country_code, rec_restaurant } = cityData || {};

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${city}?`)) {
      setIsDeleting(true);
      try {
          await onDelete(cityData);
      } catch (error) {
          console.error("Delete failed:", error);
      } finally {
          setIsDeleting(false);
      }
    }
  };

  return (
    <li className="city-card">
      <div className='city-card-header'>
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
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            padding: "0.75rem 1rem",
            background: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "0 4px 4px 0",
            cursor: isDeleting ? "not-allowed" : "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            opacity: isDeleting ? 0.7 : 1,
            ransition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = "#d32f2f")}
            onMouseLeave={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = "#f44336")}
            title="Delete city"
          >
            {isDeleting ? "..." : "×"}
        </button>
      </div>

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
  const [selectedCity, setSelectedCity] = useState(null);
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

  const deleteCity = async (city) => {
    try {
        const response = await axios.delete(`${baseURL}/cities/${city}`);

        if (response.status === 200) {
            alert('City deleted successfully!');
            await fetchCities();
            
            if (selectedCity && selectedCity.state_code === city.state_code && 
                selectedCity.country_code === city.country_code) {
                setSelectedCity(null);
            }
        }
    } catch (err) {
        console.error("Failed to delete city:", err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to delete city. Please try again.';
        alert(errorMessage);
        throw err;
    }
};

  const displayData = searchResults || (results ? sortCitiesAlphabetically(results) : null);

  return (
    <div className="cities-container">
      <div className='cities-nav'>
        <Link to="/" className="nav-btn-cities">← Back to Home</Link>
        <Link to="/Countries" className="nav-btn-cities">View Countries</Link>
        <Link to="/States" className="nav-btn-cities">View States</Link>
      </div>

      <h1 className="cities-title">Cities Database</h1>

      {error && (
        <div className='error-container'>
          <strong>Error:</strong> {error}
          <button onClick={fetchCities} className="retry-btn">Retry</button>
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
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cities...</p>
        </div>
      )}

      {displayData && displayData.length > 0 && (
        <>
          <div className='stats-display'></div>
          <ul className="city-list">
            {displayData.map((cityObj, idx) => (
              <CityCard
                cityData={cityObj}
                key={`${cityObj?.city ?? "no-city"}-${idx}`}
                onDelete={deleteCity}
              />
            ))}
          </ul>
        </>
      )}

      {!isLoading && displayData?.length === 0 && !searchQuery && (
        <div className="empty-state-box">
          <p>No cities found.</p>
        </div>
      )}
    </div>
  );
}