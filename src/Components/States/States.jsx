import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function StateCard({ stateData }) {
    const [open, setOpen] = useState(false);
    const { country_code, state_code, name } = stateData || {};

    return (
        <li style={{ 
            marginBottom: "1rem", 
            border: "1px solid #333", 
            borderRadius: "4px",
            backgroundColor: "#1a1a1a"
        }}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: 500,
                    backgroundColor: "#2d2d2d",
                    color: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <span style={{
                    color: "#ffffff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1
                }}>
                    {name ?? "Unnamed state"} {state_code ? `(${state_code})` : ""}
                </span>
                <span style={{ color: "#888" }}>{open ? "▾" : "▸"}</span>
            </button>
        </li>
    );
}

export default function States() {
    const [results, setResults] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedState, setSelectedState] = useState(null);
    
    const baseURL = import.meta.env.REACT_APP_API_URL || 'https://projectsens.pythonanywhere.com';

    useEffect(() => {
        axios
            .get(`${baseURL}/states/read`)
            .then(({ data }) => {
                console.log("States loaded:", data);
                const raw = data?.states ?? data?.States ?? [];
                const list = Array.isArray(raw) ? raw : Object.values(raw);
                setResults(list);
            })
            .catch((err) => {
                console.error("Failed to fetch state:", err);
                setResults([]);
            });
    }, []);

    const fetchStateDetails = useCallback(async (stateCode, countryCode) => {
      try {
          console.log(`Fetching details for: ${stateCode}/${countryCode}`);
          const response = await axios.get(`${baseURL}/states/${stateCode}/${countryCode}`);
          console.log("State details response:", response.data);
          
          if (response.data && response.data.States && response.data.States.details) {
              const stateDetails = response.data.States.details;
              console.log("Extracted state details:", stateDetails);
              return stateDetails;
          }
          
          return null;
      } catch (err) {
          console.error("Failed to fetch state details:", err);
          return null;
      }
  }, []);

    const searchStates = useCallback((query) => {
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
                
                const filtered = results.filter(state => {
                    const nameMatch = state.name?.toLowerCase().includes(searchLower) || false;
                    const codeMatch = state.state_code?.toLowerCase().includes(searchLower) || false;
                    const countryMatch = state.country_code?.toLowerCase().includes(searchLower) || false;
                    
                    return nameMatch || codeMatch || countryMatch;
                });

                console.log(`Found ${filtered.length} results for "${query}"`);
                setSearchResults(filtered);
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
        searchStates(query);
    };

    const handleSelectState = async (state) => {
        if (state.state_code && state.country_code) {
            const details = await fetchStateDetails(state.state_code, state.country_code);
            if (details) {
                setSelectedState(details);
            } else {
                setSelectedState(state);
            }
        } else {
            setSelectedState(state);
        }
        
        setSearchQuery("");
        setSearchResults(null);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults(null);
    };

    const clearSelectedState = () => {
        setSelectedState(null);
    };

    const displayData = searchResults || results;
    const isLoading = results === null;

    return (
        <div style={{ 
            maxWidth: "800px", 
            margin: "0 auto", 
            padding: "20px",
            backgroundColor: "#000000",
            minHeight: "100vh",
            color: "#ffffff"
        }}>
            <h1 style={{ 
                marginBottom: "20px",
                color: "#ffffff",
                borderBottom: "1px solid #333",
                paddingBottom: "10px"
            }}>
                States Database
            </h1>
            
            <div style={{ 
                marginBottom: "30px",
                position: "relative"
            }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        placeholder="Search states by name or code..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "4px",
                            border: "1px solid #333",
                            fontSize: "16px",
                            backgroundColor: "#1a1a1a",
                            color: "#ffffff",
                            outline: "none"
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            style={{
                                padding: "8px 16px",
                                background: "#333",
                                border: "1px solid #444",
                                borderRadius: "4px",
                                cursor: "pointer",
                                color: "#ffffff"
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {isSearching && (
                    <div style={{ 
                        marginTop: "10px",
                        color: "#888",
                        fontStyle: "italic"
                    }}>
                        Searching...
                    </div>
                )}

                {searchResults && searchResults.length > 0 && (
                    <div style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        right: "0",
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "4px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        overflowX: "hidden",
                        zIndex: 1000,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                        marginTop: "4px"
                    }}>
                        {searchResults.map((result) => (
                            <div
                                key={`${result.country_code}-${result.state_code}`}
                                onClick={() => handleSelectState(result)}
                                style={{
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #333",
                                    transition: "background-color 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backgroundColor: "#1a1a1a"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2d2d2d"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1a1a1a"}
                            >
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                    flex: 1,
                                    minWidth: 0
                                }}>
                                    <div style={{ 
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        color: "#ffffff",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "100%"
                                    }}>
                                        {result.name}
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "center",
                                        flexWrap: "wrap"
                                    }}>
                                        <span style={{
                                            fontSize: "11px",
                                            color: "#90caf9",
                                            backgroundColor: "#1e3a5f",
                                            padding: "2px 8px",
                                            borderRadius: "12px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {result.country_code}
                                        </span>
                                        <span style={{
                                            fontSize: "11px",
                                            color: "#a5d6a7",
                                            backgroundColor: "#1e3a2f",
                                            padding: "2px 8px",
                                            borderRadius: "12px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {result.state_code}
                                        </span>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: "20px",
                                    color: "#666",
                                    marginLeft: "12px"
                                }}>
                                    ›
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {searchQuery && searchResults?.length === 0 && !isSearching && (
                    <div style={{ 
                        marginTop: "10px",
                        padding: "12px",
                        textAlign: "center",
                        background: "#1a1a1a",
                        borderRadius: "4px",
                        color: "#888",
                        border: "1px solid #333"
                    }}>
                        No states found matching "{searchQuery}"
                    </div>
                )}
            </div>

            {selectedState && (
                <div style={{
                    marginBottom: "20px",
                    padding: "16px",
                    border: "1px solid #2196f3",
                    borderRadius: "8px",
                    backgroundColor: "#0a1929"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h3 style={{ margin: 0, color: "#90caf9" }}>
                            Selected State: {selectedState.name}
                        </h3>
                        <button
                            onClick={clearSelectedState}
                            style={{
                                padding: "4px 8px",
                                background: "#d32f2f",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Clear
                        </button>
                    </div>
                    <p style={{ color: "#e0e0e0" }}><strong style={{ color: "#aaa" }}>Country Code:</strong> {selectedState.country_code}</p>
                    <p style={{ color: "#e0e0e0" }}><strong style={{ color: "#aaa" }}>State Code:</strong> {selectedState.state_code}</p>
                    {selectedState.cities && selectedState.cities.length > 0 && (
                        <div style={{ color: "#e0e0e0" }}>
                            <strong style={{ color: "#aaa" }}>Cities:</strong>
                            <ul style={{ color: "#ccc", paddingLeft: "20px" }}>
                                {selectedState.cities.map((city, idx) => (
                                    <li key={idx}>{city.name || city}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {isLoading && <p style={{ color: "#888" }}>Loading states...</p>}

            {displayData && displayData.length > 0 && !selectedState && (
                <>
                    <p style={{ color: "#888", marginBottom: "10px" }}>
                        {searchQuery ? `Search results (${displayData.length})` : `All states (${displayData.length})`}
                    </p>
                    
                    <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                        {displayData.map((stateObj, idx) => (
                            <StateCard
                                stateData={stateObj}
                                key={`${stateObj?.country_code}-${stateObj?.state_code ?? "no-code"}-${idx}`}
                            />
                        ))}
                    </ul>
                </>
            )}

            {!isLoading && displayData?.length === 0 && !selectedState && (
                <p style={{ color: "#888" }}>No states found.</p>
            )}
        </div>
    );
}