import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import axios from 'axios'

function CountryCard({ countryData }) {
  const [open, setOpen] = useState(false);
  const { _id, name, capital, nat_dish, pop_dish_1, pop_dish_2 } = countryData || {};

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
        <span style={{ textTransform: "capitalize" }}>
          {name ?? "Unnamed country"} {_id ? `(${_id})` : ""}
        </span>
        <span style={{ color: "#888" }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #333", backgroundColor: "#242424", borderRadius: "0 0 4px 4px" }}>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>Code:</strong> {_id ?? "—"}</p>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>Name:</strong> <span style={{ textTransform: "capitalize" }}>{name ?? "—"}</span></p>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>Capital:</strong> <span style={{ textTransform: "capitalize" }}>{capital ?? "—"}</span></p>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>National Dish:</strong> {nat_dish ?? "—"}</p>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>Popular Dish 1:</strong> {pop_dish_1 ?? "—"}</p>
          <p style={{ margin: "8px 0", color: "#e0e0e0" }}><strong style={{ color: "#4caf50", minWidth: "100px", display: "inline-block" }}>Popular Dish 2:</strong> {pop_dish_2 ?? "—"}</p>
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
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", minHeight: "100vh", color: "#ffffff" }}>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap", borderBottom: "1px solid #333", paddingBottom: "15px" }}>
        <Link to="/" className="nav-btn-states">← Back to Home</Link>
        <Link to="/States" className="nav-btn-states">View States</Link>
        <Link to="/Cities" className="nav-btn-states">View Cities</Link>
      </div>

      <h1 style={{ marginBottom: "25px", fontSize: "28px", fontWeight: 600 }}>Countries Database</h1>

      {error && (
        <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: "4px", color: "#c62828", display: "flex", alignItems: "center", gap: "15px" }}>
          <strong>Error:</strong> {error}
          <button onClick={fetchCountries} style={{ padding: "5px 10px", background: "#c62828", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Retry</button>
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
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          <div className="spinner"></div>
          <p style={{ marginTop: "15px" }}>Loading countries...</p>
        </div>
      )}

      {displayData && displayData.length > 0 && (
        <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
          {displayData.map((countryObj, idx) => (
            <CountryCard
              countryData={countryObj}
              key={`${countryObj?._id ?? "no-code"}-${idx}`}
            />
          ))}
        </ul>
      )}

      {!isLoading && displayData?.length === 0 && !searchQuery && (
        <div style={{ textAlign: "center", padding: "50px 20px", backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #333" }}>
          <p style={{ color: "#888", fontSize: "16px" }}>No countries found.</p>
        </div>
      )}
    </div>
  );
}