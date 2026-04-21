import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from "react-router";
import axios from 'axios';
import '../Common.css';
import './States.css'
import { useAuth } from '../../hooks/useAuth';
import ScrollToTop from '../ScrollToTop';

function capitalizeName(name) {
    if (!name) return '';
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

function StateCard({ stateData, onDelete, onUpdate, onViewCities, countries = [], canModify }) {
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
    const navigate = useNavigate();

    const handleCityClick = (city) => {
        console.log("navigating to cities:", city);
        navigate('/Cities', { state: { selectedCity: city }});
    };

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
            const _updateData = { ...editForm, name: capitalizeName(editForm.name) }
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
                    const citiesData = await onViewCities(state_code);
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
    }, [open, citiesLoaded, isLoadingCities, state_code, onViewCities]);

    useEffect(() => {
        setCitiesLoaded(false);
        setCities([]);
    }, [state_code]);

    if (isEditing) {
        return (
            <li className='edit-card'>
                <div className='edit-form'>
                    <input
                        type="text"
                        placeholder="State Name *"
                        value={capitalizeName(editForm.name)}
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
                    <select
                        value={editForm.country_code}
                        onChange={(e) => setEditForm({...editForm, country_code: e.target.value})}
                        className='edit-input'
                        disabled={isUpdating}
                    >
                        <option value="">Select Country *</option>
                        {countries.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.name} ({c._id})
                            </option>
                        ))}
                    </select>
                    <div className='form-actions'>
                        <button
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="btn btn-primary btn-small"
                        >
                            {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isUpdating}
                            className="btn btn-secondary btn-small"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </li>
        );
    }

    return (
        <li className='card'>
            <div className='card-header'>
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
                {canModify && (
                  <button
                      onClick={handleEdit}
                      className='btn-edit'
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1976d2"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2196f3"}
                      title="Edit state"
                  >
                      ✎
                  </button>
                )}
                {canModify && (
                  <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="btn-delete"
                      title="Delete state"
                  >
                      {isDeleting ? "..." : "×"}
                  </button>
                )}
            </div>
            
            {open && (
                <div className='card-details'>
                    <div className='state-info-section'>
                        <p className='detail-text'>
                            <strong className='detail-text'>Full Name:</strong> {capitalizeName(name)}
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
                                Cities in {capitalizeName(name)}
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
                                    <div key={idx} className='city-item-link' onClick={() => handleCityClick(city)}>
                                        <div className='city-item'>
                                            <span className='city-name'>{capitalizeName(city.name || city)}</span>
                                        </div>
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

function AddStateForm({ onAdd, onCancel, countries = [] }) {
    const [formData, setFormData] = useState({
        name: '',
        state_code: '',
        country_code: '',
        food_name: '',           
        food_dietary: []
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
        if (!formData.country_code) {
            newErrors.country_code = 'Please select a country';
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
                country_code: formData.country_code.toUpperCase(),
                food_name: formData.food_name.trim(),
                food_dietary: formData.food_dietary
            });
            
            setFormData({
                name: '',
                state_code: '',
                country_code: '',
                food_name: '',
                food_dietary: []
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
                        value={capitalizeName(formData.name)}
                        onChange={(e) => {
                            setFormData({...formData, name: e.target.value});
                            setErrors({...errors, name: null});
                        }}
                        className={`form-input ${errors.name ? 'error' : ''}`}
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
                        className={`form-input ${errors.state_code ? 'error' : ''}`}
                        maxLength="3"
                        disabled={isSubmitting}
                    />
                    {errors.state_code && ( <p className='error-text'>{errors.state_code}</p> )}
                </div>
                
                <div>
                    <select
                        value={formData.country_code}
                        onChange={(e) => {
                            setFormData({...formData, country_code: e.target.value});
                            setErrors({...errors, country_code: null});
                        }}
                        className={`form-input ${errors.country_code ? 'error' : ''}`}
                        disabled={isSubmitting}
                    >
                        <option value="">Select Country *</option>
                        {countries.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.name} ({c._id})
                            </option>
                        ))}
                    </select>
                    {errors.country_code && ( <p className='error-text'>{errors.country_code}</p> )}
                </div>

                {/* Food Name Input */}
                <div>
                    <input
                        type="text"
                        placeholder="Popular Food (e.g., Clam Chowder)"
                        value={capitalizeName(formData.food_name)}
                        onChange={(e) => setFormData({...formData, food_name: e.target.value})}
                        className="form-input"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Dietary Checkboxes */}
                <div className="dietary-checkboxes">
                    <label className="dietary-label">Dietary Options:</label>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.food_dietary.includes('vegetarian')}
                            onChange={(e) => {
                                const dietary = e.target.checked
                                    ? [...formData.food_dietary, 'vegetarian']
                                    : formData.food_dietary.filter(d => d !== 'vegetarian');
                                setFormData({ ...formData, food_dietary: dietary });
                            }}
                            disabled={isSubmitting}
                        />
                        🌱 Vegetarian
                    </label>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.food_dietary.includes('meat')}
                            onChange={(e) => {
                                const dietary = e.target.checked
                                    ? [...formData.food_dietary, 'meat']
                                    : formData.food_dietary.filter(d => d !== 'meat');
                                setFormData({ ...formData, food_dietary: dietary });
                            }}
                            disabled={isSubmitting}
                        />
                        🥩 Meat
                    </label>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.food_dietary.includes('seafood')}
                            onChange={(e) => {
                                const dietary = e.target.checked
                                    ? [...formData.food_dietary, 'seafood']
                                    : formData.food_dietary.filter(d => d !== 'seafood');
                                setFormData({ ...formData, food_dietary: dietary });
                            }}
                            disabled={isSubmitting}
                        />
                        🐟 Seafood
                    </label>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.food_dietary.includes('vegan')}
                            onChange={(e) => {
                                const dietary = e.target.checked
                                    ? [...formData.food_dietary, 'vegan']
                                    : formData.food_dietary.filter(d => d !== 'vegan');
                                setFormData({ ...formData, food_dietary: dietary });
                            }}
                            disabled={isSubmitting}
                        />
                        🥬 Vegan
                    </label>
                </div>
                
                <div className='form-actions'>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary"
                    >
                        {isSubmitting ? "Adding..." : "Add State"}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="btn btn-secondary"
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
    const [countries, setCountries] = useState([]);
    const { isLoggedIn, isDeveloper, userEmail } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_URL;

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
        const stateFromNavigation = location.state?.selectedState;
        if (stateFromNavigation) {
            console.log("State received from navigation:", stateFromNavigation);
            if (results && results.length > 0) {
                const fullStateData = results.find(
                    state => state.name === stateFromNavigation.name || 
                    state.state_code === stateFromNavigation.state_code
                );
                if (fullStateData) {
                    setSelectedState(fullStateData);
                } else {
                    setSelectedState(stateFromNavigation);
                }
            } else {
                setSelectedState(stateFromNavigation);
            }
            
            setTimeout(() => {
                const selectedElement = document.querySelector('.selected-state-container');
                if (selectedElement) {
                    selectedElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
    }, [location.state?.selectedState, results]);

    useEffect(() => {
        fetchStates();
        axios.get(`${baseURL}/countries`)
            .then(({ data }) => {
                const raw = data?.countries ?? {};
                const list = Array.isArray(raw) ? raw : Object.values(raw);
                setCountries(list.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
            })
            .catch((err) => console.error("Failed to fetch countries:", err));
    }, [fetchStates, baseURL]);

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
            
            if (!response.data) {
                console.error("No data received from cities");
                return [];
            }

            let citiesArray = [];
            if (response.data.Cities && typeof response.data.Cities === 'object') {
                console.log("Found Cities object:", response.data.Cities);
                citiesArray = Object.values(response.data.Cities);
                console.log("Converted to array:", citiesArray);
            } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                const possibleCities = Object.values(response.data);
                if (possibleCities.length > 0 && possibleCities[0] && typeof possibleCities[0] === 'object') {
                    citiesArray = possibleCities;
                }
            } else if (Array.isArray(response.data)) {
                citiesArray = response.data;
            }
            console.log("Extracted cities array:", citiesArray);
            console.log("Number of cities found:", citiesArray.length);
            
            const formattedCities = citiesArray.map(city => {
                if (city && typeof city === 'object') {
                    const cityName = city.city || city.name || city.city_name || 'Unnamed City';
                    return {
                        name: cityName,
                        ...city
                    };
                } else if (typeof city === 'string') {
                    return { name: city };
                }
                return null;
            }).filter(city => city !== null);
            
            console.log("Formatted cities:", formattedCities);
            return formattedCities;    
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
                country_code: stateData.country_code,
                food_name: stateData.food_name || '',
                food_dietary: stateData.food_dietary || [],
                created_by: userEmail
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
            const response = await axios.post(`${baseURL}/states/add`, {
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
        <div className='page-container'>
            <div className='page-nav'>
                <Link to="/" className="nav-btn">← Back to Home</Link>
                <Link to="/Countries" className="nav-btn">View Countries</Link>
                <Link to="/Cities" className="nav-btn">View Cities</Link>
                <button
                    onClick={() => {
                        if (!isLoggedIn) {
                            navigate('/Login', { state: { from: '/States' } });
                            return;
                        }
                        setShowAddForm(!showAddForm);
                    }}
                    className={`add-btn ${showAddForm ? 'cancel-mode' : 'add-mode'}`}
                >
                    {showAddForm ? "Cancel" : "+ Add New State"}
                </button>
            </div>

            <h1 className='page-title'>States Database {results && results.length > 0 && <span style={{ fontSize: "16px", color: "#888", fontWeight: "normal" }}>({results.length} states)</span>}</h1>

            {error && (
                <div className='error-container'>
                    <strong>Error:</strong> {error}
                    <button onClick={fetchStates} className='retry-btn'>Retry</button>
                </div>
            )}

            {showAddForm && ( <AddStateForm onAdd={addState} onCancel={() => setShowAddForm(false)} countries={countries}/> )}
            
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
                            Selected State: {capitalizeName(selectedState.name)}
                        </h3>
                        <button
                            onClick={clearSelectedState}
                            className="btn btn-secondary btn-small"
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
                            <div className="selected-cities-block">
                                <strong className="selected-cities-label">
                                    Cities ({selectedState.cities.length}):</strong>
                                <div className="selected-cities-list">
                                    {selectedState.cities.map((city, idx) => (
                                        <span
                                            key={idx}
                                            className="selected-city-pill"
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
                    <p>Loading states...</p>
                </div>
            )}

            {displayData && displayData.length > 0 && !selectedState && (
                <>
                    <div className='stats-display'></div>
                    <ul className='list'>
                        {displayData.map((stateObj, idx) => (
                            <StateCard
                                stateData={stateObj}
                                key={`${stateObj?.country_code}-${stateObj?.state_code ?? "no-code"}-${idx}`}
                                onDelete={deleteState}
                                onUpdate={updateState}
                                onViewCities={fetchCitiesByState}
                                countries={countries}
                                canModify={isDeveloper || stateObj?.created_by === userEmail}
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
                        className="btn btn-primary"
                    >Add Your First State
                    </button>
                </div>
            )}
            <ScrollToTop />
        </div>
    );
}