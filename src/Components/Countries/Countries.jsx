import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import axios from 'axios'
import '../Common.css';
import './Countries.css';

function CountryCard({ countryData }) {
  const [open, setOpen] = useState(false);
  const { _id, name, capital, nat_dish, pop_dish_1, pop_dish_2 } = countryData || {};

  return (
    <li className="country-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`country-toggle-btn ${open ? 'open' : ''}`}
      >
        <span className="country-toggle-label">
          {name ?? "Unnamed country"} {_id ? `(${_id})` : ""}
        </span>
        <span className="country-expand-icon">{open ? '▾' : '▸'} </span>
      </button>
      {open && (
        <div className="country-details">
        <p className="country-detail-text">
          <strong className="country-detail-label">Code:</strong> {_id ?? '—'}
        </p>
        <p className="country-detail-text">
          <strong className="country-detail-label">Name:</strong>{' '}
          <span className="country-capitalize">{name ?? '—'}</span>
        </p>
        <p className="country-detail-text">
          <strong className="country-detail-label">Capital:</strong>{' '}
          <span className="country-capitalize">{capital ?? '—'}</span>
        </p>
        <p className="country-detail-text">
          <strong className="country-detail-label">National Dish:</strong> {nat_dish ?? '—'}
        </p>
        <p className="country-detail-text">
          <strong className="country-detail-label">Popular Dish 1:</strong> {pop_dish_1 ?? '—'}
        </p>
        <p className="country-detail-text">
          <strong className="country-detail-label">Popular Dish 2:</strong> {pop_dish_2 ?? '—'}
        </p>
        </div>
      )}
    </li>
  );
}

export default function Countries() {
  const [results, setResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.VITE_API_URL;

  const sortCountriesAlphabetically = (countriesArray) => {
    if (!countriesArray || !Array.isArray(countriesArray)) return [];
    return [...countriesArray].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  };

  const fetchCountries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${baseURL}/countries`);
      const raw = data?.countries ?? {};
      const sortedList = sortCountriesAlphabetically(Array.isArray(raw) ? raw : Object.values(raw));
      setResults(sortedList);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch countries');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const searchCountries = useCallback((query) => {
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

        const filtered = results.filter(country => {
          const nameMatch = country.name?.toLowerCase().includes(searchLower) || false;
          const codeMatch = country._id?.toLowerCase().includes(searchLower) || false;
          const capitalMatch = country.capital?.toLowerCase().includes(searchLower) || false;
          const dishMatch = country.nat_dish?.toLowerCase().includes(searchLower) || false;
          return nameMatch || codeMatch || capitalMatch || dishMatch;
        });

        console.log(`Found ${filtered.length} results for "${query}"`);
        const sortedFiltered = sortCountriesAlphabetically(filtered);
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
    searchCountries(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const displayData = searchResults || (results ? sortCountriesAlphabetically(results) : null);

  return (
    <div className="page-container">
      <div className="page-nav">
        <Link to="/" className="nav-btn">← Back to Home</Link>
        <Link to="/States" className="nav-btn">View States</Link>
        <Link to="/Cities" className="nav-btn">View Cities</Link>
      </div>

      <h1 className="page-title">Countries Database</h1>

      {error && (
        <div className="error-container">
          <strong>Error:</strong> {error}
          <button onClick={fetchCountries} className="error-inline-btn">Retry</button>
        </div>
      )}

      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search countries by name, code, capital, or dish..."
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
          <div className="no-results">No countries found matching "{searchQuery}"</div>
        )}
      </div>

      {isLoading && (
        <div className="loading-block">
          <div className="spinner"></div>
          <p>Loading countries...</p>
        </div>
      )}

      {displayData && displayData.length > 0 && (
        <ul className="country-list">
          {displayData.map((countryObj, idx) => (
            <CountryCard
              countryData={countryObj}
              key={`${countryObj?._id ?? "no-code"}-${idx}`}
            />
          ))}
        </ul>
      )}

      {!isLoading && displayData?.length === 0 && !searchQuery && (
        <div className="empty-state-box">
          <p>No countries found.</p>
        </div>
      )}
    </div>
  );
}