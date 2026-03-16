import { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router";
import axios from 'axios';

function capitalizeStateName(name) {
  if (!name) return '';
  return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

function StateCard({ stateData, onDelete, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
        name: stateData?.name || '',
        state_code: stateData?.state_code || '',
        country_code: stateData?.country_code || ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
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
            const _updateData = {
              ...editForm,
              name: capitalizeStateName(editForm.name)
            }
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

    if (isEditing) {
        return (
            <li style={{ 
                marginBottom: "1rem", 
                border: "1px solid #2196f3", 
                borderRadius: "4px",
                backgroundColor: "#0a1929",
                padding: "1rem"
            }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                        type="text"
                        placeholder="State Name *"
                        value={capitalizeStateName(editForm.name)}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        style={{
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #333",
                            backgroundColor: "#1a1a1a",
                            color: "#ffffff",
                            fontSize: "14px"
                        }}
                        disabled={isUpdating}
                    />
                    <input
                        type="text"
                        placeholder="State Code * (e.g., CA)"
                        value={editForm.state_code}
                        onChange={(e) => setEditForm({...editForm, state_code: e.target.value.toUpperCase()})}
                        style={{
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #333",
                            backgroundColor: "#1a1a1a",
                            color: "#ffffff",
                            fontSize: "14px"
                        }}
                        maxLength="3"
                        disabled={isUpdating}
                    />
                    <input
                        type="text"
                        placeholder="Country Code * (e.g., USA)"
                        value={editForm.country_code}
                        onChange={(e) => setEditForm({...editForm, country_code: e.target.value.toUpperCase()})}
                        style={{
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #333",
                            backgroundColor: "#1a1a1a",
                            color: "#ffffff",
                            fontSize: "14px"
                        }}
                        maxLength="3"
                        disabled={isUpdating}
                    />
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
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
        <li style={{ 
            marginBottom: "1rem", 
            border: "1px solid #333", 
            borderRadius: "4px",
            backgroundColor: "#1a1a1a",
            transition: "all 0.2s ease"
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                width: "100%"
            }}>
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    style={{
                        flex: 1,
                        textAlign: "left",
                        padding: "0.75rem 1rem",
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "4px 0 0 4px",
                        fontWeight: 500,
                        backgroundColor: "#2d2d2d",
                        color: "#ffffff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3d3d3d"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2d2d2d"}
                >
                    <span style={{
                        color: "#ffffff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1
                    }}>
                        {name ?? "Unnamed state"} {state_code ? `(${state_code})` : ""}
                        <span style={{ 
                            marginLeft: "10px",
                            fontSize: "12px",
                            color: "#888"
                        }}>
                            {country_code}
                        </span>
                    </span>
                    <span style={{ color: "#888", marginLeft: "10px" }}>{open ? "▾" : "▸"}</span>
                </button>
                <button
                    onClick={handleEdit}
                    style={{
                        padding: "0.75rem 1rem",
                        background: "#2196f3",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        transition: "background-color 0.2s"
                    }}
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
                <div style={{
                    padding: "1rem",
                    borderTop: "1px solid #333",
                    backgroundColor: "#242424",
                    borderRadius: "0 0 4px 4px"
                }}>
                    <p style={{ margin: "5px 0", color: "#ccc" }}>
                        <strong style={{ color: "#fff" }}>Full Name:</strong> {capitalizeStateName(name)}
                    </p>
                    <p style={{ margin: "5px 0", color: "#ccc" }}>
                        <strong style={{ color: "#fff" }}>State Code:</strong> {state_code}
                    </p>
                    <p style={{ margin: "5px 0", color: "#ccc" }}>
                        <strong style={{ color: "#fff" }}>Country Code:</strong> {country_code}
                    </p>
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
        
        if (!validateForm()) {
            return;
        }

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
        <div style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #4caf50",
            borderRadius: "8px",
            backgroundColor: "#1a2a1a"
        }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#4caf50" }}>Add New State</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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
                    {errors.name && (
                        <p style={{ margin: "5px 0 0 0", color: "#f44336", fontSize: "12px" }}>{errors.name}</p>
                    )}
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
                    {errors.state_code && (
                        <p style={{ margin: "5px 0 0 0", color: "#f44336", fontSize: "12px" }}>{errors.state_code}</p>
                    )}
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
                    {errors.country_code && (
                        <p style={{ margin: "5px 0 0 0", color: "#f44336", fontSize: "12px" }}>{errors.country_code}</p>
                    )}
                </div>
                
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
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
        <div style={{ 
            maxWidth: "900px", 
            margin: "0 auto", 
            padding: "20px",
            minHeight: "100vh",
            color: "#ffffff",
        }}>
            <div style={{
                marginBottom: "20px", 
                display: "flex", 
                gap: "10px",
                flexWrap: "wrap",
                borderBottom: "1px solid #333",
                paddingBottom: "15px"
            }}>
                <Link to="/" className="nav-btn"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#444"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#333"}
                >
                    ← Back to Home
                </Link>
                <Link to="/Countries" className="nav-btn"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#444"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#333"}
                >
                    View Countries
                </Link>
                <Link to="/Cities" className="nav-btn"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#444"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#333"}
                >
                    View Cities
                </Link>
                <button onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        padding: "8px 16px",
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

            <h1 style={{ 
                marginBottom: "25px",
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "600"
            }}>
                States Database
            </h1>

            {error && (
                <div style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#ffebee",
                    border: "1px solid #ef5350",
                    borderRadius: "4px",
                    color: "#c62828"
                }}>
                    <strong>Error:</strong> {error}
                    <button onClick={fetchStates}
                        style={{
                            marginLeft: "15px",
                            padding: "5px 10px",
                            background: "#c62828",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {showAddForm && ( <AddStateForm onAdd={addState} onCancel={() => setShowAddForm(false)}/> )}
            
            <div style={{ marginBottom: "30px", position: "relative" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        placeholder="Search states by name, code, or country code..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{
                            flex: 1,
                            padding: "12px 15px",
                            borderRadius: "6px",
                            border: "1px solid #333",
                            fontSize: "15px",
                            color: "#ffffff",
                            backgroundColor: "#1a1a1a",
                            outline: "none",
                            transition: "border-color 0.2s"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#4caf50"}
                        onBlur={(e) => e.target.style.borderColor = "#333"}
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            style={{
                                padding: "0 16px",
                                background: "#333",
                                border: "1px solid #444",
                                borderRadius: "6px",
                                cursor: "pointer",
                                color: "#ffffff",
                                fontSize: "14px",
                                transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#444"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#333"}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {isSearching && (
                    <div style={{ 
                        marginTop: "10px",
                        color: "#888",
                        fontStyle: "italic",
                        fontSize: "14px"
                    }}>
                        Searching...
                    </div>
                )}

                {searchQuery && searchResults?.length === 0 && !isSearching && (
                    <div style={{ 
                        marginTop: "10px",
                        padding: "15px",
                        textAlign: "center",
                        background: "#1a1a1a",
                        borderRadius: "6px",
                        color: "#888",
                        border: "1px solid #333",
                        fontSize: "14px"
                    }}>
                        No states found matching "{searchQuery}"
                    </div>
                )}
            </div>

            {selectedState && (
                <div style={{
                    marginBottom: "25px",
                    padding: "20px",
                    border: "1px solid #2196f3",
                    borderRadius: "8px",
                    backgroundColor: "#0a1929"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <h3 style={{ margin: 0, color: "#90caf9", fontSize: "18px" }}>
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
                    <div style={{ display: "grid", gap: "10px" }}>
                        <p style={{ margin: 0, color: "#e0e0e0" }}>
                            <strong style={{ color: "#aaa", minWidth: "100px", display: "inline-block" }}>Country Code:</strong> 
                            {selectedState.country_code}
                        </p>
                        <p style={{ margin: 0, color: "#e0e0e0" }}>
                            <strong style={{ color: "#aaa", minWidth: "100px", display: "inline-block" }}>State Code:</strong> 
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

            {isLoading && ( <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    <div style={{ 
                        display: "inline-block",
                        width: "40px",
                        height: "40px",
                        border: "3px solid #333",
                        borderTopColor: "#4caf50",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }} />
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
                    <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        marginBottom: "15px"
                    }}>
                    </div>
                    
                    <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
                        {displayData.map((stateObj, idx) => (
                            <StateCard
                                stateData={stateObj}
                                key={`${stateObj?.country_code}-${stateObj?.state_code ?? "no-code"}-${idx}`}
                                onDelete={deleteState}
                                onUpdate={updateState}
                            />
                        ))}
                    </ul>
                </>
            )}

            {!isLoading && displayData?.length === 0 && !selectedState && (
                <div style={{ 
                    textAlign: "center", 
                    padding: "50px 20px",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    border: "1px solid #333"
                }}>
                    <p style={{ color: "#888", fontSize: "16px", marginBottom: "15px" }}>
                        No states found.
                    </p>
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
                    >
                        Add Your First State
                    </button>
                </div>
            )}
        </div>
    );
} 