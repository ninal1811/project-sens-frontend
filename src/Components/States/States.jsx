import { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router";
import axios from 'axios';
import './States.css'

function capitalizeStateName(name) {
    if (!name) return '';
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

function StateCard({ stateData, onDelete, onUpdate, onViewCities }) {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: stateData?.name || '',
        state_code: stateData?.state_code || '',
        country_code: stateData?.country_code || ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [cities, setCities] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [citiesLoaded, setCitiesLoaded] = useState(false);
    const { country_code, state_code, name } = stateData || {};

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            name: stateData?.name || '',
            state_code: stateData?.state_code || '',
            country_code: stateData?.country_code || ''
        });
    };

    const handleSave = async () => {
        if (!editForm.name || !editForm.state_code || !editForm.country_code) {
            alert('Please fill in all fields');
            return;
        }

        setIsUpdating(true);
        try {
            const _updateData = { ...editForm, name: capitalizeStateName(editForm.name) }
            await onUpdate(stateData, editForm);
            setIsEditing(false);
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            setIsDeleting(true);
            try {
                await onDelete(stateData);
            } catch (error) {
                console.error("Delete failed:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    useEffect(() => {
        const loadCities = async () => {
            if (open && !citiesLoaded && !isLoadingCities) {
                setIsLoadingCities(true);
                try {
                    const citiesData = await onViewCities(state_code, country_code);
                    setCities(citiesData || []);
                    setCitiesLoaded(true);
                } catch (error) {
                    console.error("Failed to load cities:", error);
                    setCities([]);
                    setCitiesLoaded(true);
                } finally {
                    setIsLoadingCities(false);
                }
            }
        };
        loadCities();
    }, [open, citiesLoaded, isLoadingCities, state_code, country_code, onViewCities]);

    useEffect(() => {
        setCitiesLoaded(false);
        setCities([]);
    }, [state_code, country_code]);

    if (isEditing) {
        return (
            <li className='edit-card'>
                <div className='edit-form'>
                    <input
                        type="text"
                        placeholder="State Name *"
                        value={capitalizeStateName(editForm.name)}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className='edit-input'
                        disabled={isUpdating}
                    />
                    <input
                        type="text"
                        placeholder="State Code * (e.g., CA)"
                        value={editForm.state_code}
                        onChange={(e) => setEditForm({...editForm, state_code: e.target.value.toUpperCase()})}
                        className='edit-input'
                        maxLength="3"
                        disabled={isUpdating}
                    />
                    <input
                        type="text"
                        placeholder="Country Code * (e.g., USA)"
                        value={editForm.country_code}
                        onChange={(e) => setEditForm({...editForm, country_code: e.target.value.toUpperCase()})}
                        className='edit-input'
                        maxLength="3"
                        disabled={isUpdating}
                    />
                    <div className='form-actions'>
                        <button
                            onClick={handleSave}
                            disabled={isUpdating}
                            style={{
                                padding: "6px 12px",
                                background: "#4caf50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isUpdating ? "not-allowed" : "pointer",
                                opacity: isUpdating ? 0.7 : 1
                            }}
                        >
                            {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isUpdating}
                            style={{
                                padding: "6px 12px",
                                background: "#666",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isUpdating ? "not-allowed" : "pointer",
                                opacity: isUpdating ? 0.7 : 1
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </li>
        );
    }

    return (
        <li className='state-card'>
            <div className='state-card-header'>
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className='expand-btn'
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3d3d3d"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2d2d2d"}
                >
                    <span className='state-info'> {name ?? "Unnamed state"} {state_code ? `(${state_code})` : ""}
                        <span className='country-badge'> {country_code} </span>
                    </span>
                    <span className='expand-icon'>{open ? "▾" : "▸"}</span>
                </button>
                <button
                    onClick={handleEdit}
                    className='btn-edit'
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1976d2"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2196f3"}
                    title="Edit state"
                >
                    ✎
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
                        transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = "#d32f2f")}
                    onMouseLeave={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = "#f44336")}
                    title="Delete state"
                >
                    {isDeleting ? "..." : "×"}
                </button>
            </div>
            
            {open && (
                <div className='card-details'>
                    <div className='state-info-section'>
                        <p className='detail-text'>
                            <strong className='detail-text'>Full Name:</strong> {capitalizeStateName(name)}
                        </p>
                        <p className='detail-text'>
                            <strong className='detail-text'>State Code:</strong> {state_code}
                        </p>
                        <p className='detail-text'>
                            <strong className='detail-text'>Country Code:</strong> {country_code}
                        </p>
                    </div>
                    <div className='cities-section'>
                        <div className='cities-header'>
                            <h4 className='cities-title'>
                                Cities in {capitalizeStateName(name)}
                                {cities.length > 0 && <span className='city-count'>({cities.length})</span>}
                            </h4>
                        </div>

                        {isLoadingCities ? (
                            <div className='cities-loading'>
                                <div className='small-spinner'></div>
                                <p>Loading cities...</p>
                            </div>
                        ) : cities && cities.length > 0 ? (
                            <div className='cities-list'>
                                {cities.map((city, idx) => (
                                    <div key={idx} className='city-item'>
                                        <span className='city-name'>{capitalizeStateName(city.name || city)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='no-cities'>
                                <p>No cities found for this state/province.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </li>
    );
}

function AddStateForm({ onAdd, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        state_code: '',
        country_code: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'State name is required';
        }
        if (!formData.state_code.trim()) {
            newErrors.state_code = 'State code is required';
        } else if (formData.state_code.length < 2 || formData.state_code.length > 3) {
            newErrors.state_code = 'State code must be 2-3 characters';
        }
        if (!formData.country_code.trim()) {
            newErrors.country_code = 'Country code is required';
        } else if (formData.country_code.length !== 3) {
            newErrors.country_code = 'Country code must be exactly 3 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) { return; }

        setIsSubmitting(true);
        try {
            await onAdd({
                name: formData.name.trim(),
                state_code: formData.state_code.toUpperCase(),
                country_code: formData.country_code.toUpperCase()
            });
            
            setFormData({
                name: '',
                state_code: '',
                country_code: ''
            });
            setErrors({});
        } catch (error) {
            console.error("Add failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='add-form-container'>
            <h3 className='add-form-title'>Add New State</h3>
            <form onSubmit={handleSubmit} className='add-form'>
                <div>
                    <input
                        type="text"
                        placeholder="State Name *"
                        value={capitalizeStateName(formData.name)}
                        onChange={(e) => {
                            setFormData({...formData, name: e.target.value});
                            setErrors({...errors, name: null});
                        }}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "4px",
                            border: `1px solid ${errors.name ? '#f44336' : '#333'}`,
                            backgroundColor: "#1a1a1a",
                            color: "#ffffff",
                            fontSize: "14px",
                            boxSizing: "border-box"
                        }}
                        disabled={isSubmitting}
                    />
                    {errors.name && ( <p className='error-text'>{errors.name}</p> )}
                </div>
                
                <div>
                    <input
                        type="text"
                        placeholder="State Code * (e.g., CA)"
                        value={formData.state_code}
                        onChange={(e) => {
                            setFormData({...formData, state_code: e.target.value.toUpperCase()});
                            setErrors({...errors, state_code: null});
                        }}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "4px",
                            border: `1px solid ${errors.state_code ? '#f44336' : '#333'}`,
                            backgroundColor: "#1a1a1a",
                            color: "#ffffff",
                            fontSize: "14px",
                            boxSizing: "border-box"
                        }}
                        maxLength="3"
                        disabled={isSubmitting}
                    />
                    {errors.state_code && ( <p className='error-text'>{errors.state_code}</p> )}
                </div>
                
                <div>
                    <input
                        type="text"
                        placeholder="Country Code * (e.g., USA)"
                        value={formData.country_code}
                        onChange={(e) => {
                            setFormData({...formData, country_code: e.target.value.toUpperCase()});
                            setErrors({...errors, country_code: null});
                        }}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "4px",
                            border: `1px solid ${errors.country_code ? '#f44336' : '#333'}`,
                            backgroundColor: "#1a1a1a",
                            color: "#ffffff",
                            fontSize: "14px",
                            boxSizing: "border-box"
                        }}
                        maxLength="3"
                        disabled={isSubmitting}
                    />
                    {errors.country_code && ( <p className='error-text'>{errors.country_code}</p> )}
                </div>
                
                <div className='form-actions'>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: "10px 20px",
                            background: "#4caf50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            opacity: isSubmitting ? 0.7 : 1,
                            fontSize: "14px",
                            fontWeight: "bold"
                        }}
                    >
                        {isSubmitting ? "Adding..." : "Add State"}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            style={{
                                padding: "10px 20px",
                                background: "#666",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                opacity: isSubmitting ? 0.7 : 1,
                                fontSize: "14px"
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default function States() {
    const [results, setResults] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedState, setSelectedState] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const baseURL = import.meta.env.REACT_APP_API_URL || 'https://projectsens.pythonanywhere.com';

    const sortStatesAlphabetically = (statesArray) => {
        if (!statesArray || !Array.isArray(statesArray)) return [];
        return [...statesArray].sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
    };

    const fetchStates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(`${baseURL}/states/read`);
            console.log("States loaded:", data);
            
            let list = [];
            if (data && typeof data === 'object') {
                if (Array.isArray(data)) {
                    list = data;
                } else if (Array.isArray(data.states)) {
                    list = data.states;
                } else if (Array.isArray(data.States)) {
                    list = data.States;
                } else if (data.states && typeof data.states === 'object'){
                    list = Object.values(data.states);
                } else if (data.States && typeof data.States === 'object') {
                    list = Object.values(data.States);

                }
            }

            const sortedList = sortStatesAlphabetically(list);
            setResults(sortedList);
        } catch (err) {
            console.error("Failed to fetch states:", err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch states');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [baseURL]);

    useEffect(() => {
        fetchStates();
    }, [fetchStates]);

    const fetchStateDetails = useCallback(async (stateCode, countryCode) => {
        try {
            console.log(`Fetching details for: ${stateCode}/${countryCode}`);
            const response = await axios.get(`${baseURL}/states/${stateCode}/${countryCode}`);
            console.log("State details response:", response.data);
            
            if (response.data) {
                return response.data.States?.details || response.data.details || response.data;
            }
            
            return null;
        } catch (err) {
            console.error("Failed to fetch state details:", err);
            return null;
        }
    }, [baseURL]);

    const fetchCitiesByState = useCallback(async (stateCode) => {
        try {
            console.log(`Fetching details for: ${stateCode}`);
            const response = await axios.get(`${baseURL}/cities/state/${stateCode}`);
            console.log("Cities response:", response.data);
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    return response.data;
                } else if (response.data.cities && Array.isArray(response.data.cities)) {
                    return response.data.cities;
                } else if (response.data.Cities && Array.isArray(response.data.Cities)) {
                    return response.data.Cities;
                } else if (response.data.results && Array.isArray(response.data.results)) {
                    return response.data.results;
                } else {
                    return [];
                }
            }
            return [];
        } catch (err) {
            console.error("Failed to fetch cities for state:", err);
            return [];
        }
    }, [baseURL]);

    const addState = async (stateData) => {
        try {
            const response = await axios.post(`${baseURL}/states/add`, {
                name: stateData.name,
                state_code: stateData.state_code,
                country_code: stateData.country_code
            });

            if (response.status === 200 || response.status === 201) {
                alert('State added successfully!');
                setShowAddForm(false);
                await fetchStates();
            }
        } catch (err) {
            console.error("Failed to add state:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to add state. Please try again.';
            alert(errorMessage);
            throw err;
        }
    };

    const updateState = async (oldState, newStateData) => {
        try {
            const response = await axios.put(`${baseURL}/states/${oldState.state_code}/${oldState.country_code}`, {
                name: newStateData.name,
                state_code: newStateData.state_code,
                country_code: newStateData.country_code
            });

            if (response.status === 200) {
                alert('State updated successfully!');
                await fetchStates();
            }
        } catch (err) {
            console.error("Failed to update state:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update state. Please try again.';
            alert(errorMessage);
            throw err;
        }
    };

    const deleteState = async (state) => {
        try {
            const response = await axios.delete(`${baseURL}/states/${state.state_code}/${state.country_code}`);

            if (response.status === 200) {
                alert('State deleted successfully!');
                await fetchStates();
                
                if (selectedState && selectedState.state_code === state.state_code && 
                    selectedState.country_code === state.country_code) {
                    setSelectedState(null);
                }
            }
        } catch (err) {
            console.error("Failed to delete state:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to delete state. Please try again.';
            alert(errorMessage);
            throw err;
        }
    };

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
                const sortedFiltered = sortStatesAlphabetically(filtered)
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
        searchStates(query);
    };

    const _handleSelectState = async (state) => {
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

    const displayData = searchResults || (results ? sortStatesAlphabetically(results) : null);

    return (
        <div className='states-container'>
            <div className='states-nav'>
                <Link to="/" className="nav-btn-states">← Back to Home</Link>
                <Link to="/Countries" className="nav-btn-states">View Countries</Link>
                <Link to="/Cities" className="nav-btn-states">View Cities</Link>
                <button onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        padding: "10px 20px",
                        background: showAddForm ? "#f44336" : "#4caf50",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginLeft: "auto",
                        transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => {
                        if (showAddForm) {
                            e.currentTarget.style.backgroundColor = "#d32f2f";
                        } else {
                            e.currentTarget.style.backgroundColor = "#45a049";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (showAddForm) {
                            e.currentTarget.style.backgroundColor = "#f44336";
                        } else {
                            e.currentTarget.style.backgroundColor = "#4caf50";
                        }
                    }}
                >
                    {showAddForm ? "Cancel" : "+ Add New State"}
                </button>
            </div>

            <h1 className='states-title'>States Database</h1>

            {error && (
                <div className='error-container'>
                    <strong>Error:</strong> {error}
                    <button onClick={fetchStates} className='retry-btn'>Retry</button>
                </div>
            )}

            {showAddForm && ( <AddStateForm onAdd={addState} onCancel={() => setShowAddForm(false)}/> )}
            
            <div className="search-section">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search states by name, code, or country code..."
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
                        >Clear
                        </button>
                    )}
                </div>

                {isSearching && (
                    <div className="searching-indicator">Searching...</div>
                )}

                {searchQuery && searchResults?.length === 0 && !isSearching && (
                    <div className='no-results'>No states found matching "{searchQuery}"</div>
                )}
            </div>

            {selectedState && (
                <div className='selected-state-container'>
                    <div className='selected-header'>
                        <h3 className='selected-title'>
                            Selected State: {capitalizeStateName(selectedState.name)}
                        </h3>
                        <button
                            onClick={clearSelectedState}
                            style={{
                                padding: "6px 12px",
                                background: "#d32f2f",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "13px",
                                transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#b71c1c"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#d32f2f"}
                        >
                            Clear
                        </button>
                    </div>
                    <div className='selected-details'>
                        <p className='detail-item'>
                            <strong className='detail-label'>Country Code:</strong> 
                            {selectedState.country_code}
                        </p>
                        <p className='detail-item'>
                            <strong className='detail-label'>State Code:</strong> 
                            {selectedState.state_code}
                        </p>
                        {selectedState.cities && selectedState.cities.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                                <strong style={{ color: "#aaa" }}>Cities ({selectedState.cities.length}):</strong>
                                <div style={{ 
                                    display: "flex", 
                                    flexWrap: "wrap", 
                                    gap: "8px", 
                                    marginTop: "10px" 
                                }}>
                                    {selectedState.cities.map((city, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                padding: "4px 12px",
                                                backgroundColor: "#1a1a1a",
                                                borderRadius: "16px",
                                                fontSize: "13px",
                                                color: "#ccc",
                                                border: "1px solid #333"
                                            }}
                                        >
                                            {city.name || city}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isLoading && ( <div className='loading-container'>
                <div className='spinner'/>
                    <p style={{ marginTop: "15px" }}>Loading states...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            {displayData && displayData.length > 0 && !selectedState && (
                <>
                    <div className='stats-display'></div>
                    <ul className='state-list'>
                        {displayData.map((stateObj, idx) => (
                            <StateCard
                                stateData={stateObj}
                                key={`${stateObj?.country_code}-${stateObj?.state_code ?? "no-code"}-${idx}`}
                                onDelete={deleteState}
                                onUpdate={updateState}
                                onViewCities={fetchCitiesByState}
                            />
                        ))}
                    </ul>
                </>
            )}

            {!isLoading && displayData?.length === 0 && !selectedState && (
                <div className='empty-state'>
                    <p className='empty-text'>No states found.</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        style={{
                            padding: "10px 20px",
                            background: "#4caf50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "bold"
                        }}
                    >Add Your First State
                    </button>
                </div>
            )}
        </div>
    );
} 