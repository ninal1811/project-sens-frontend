import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import axios from 'axios'
import './Cities.css'

function capitalizeCityName(city) {
  if (!city) return '';
  return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

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

function AddCityForm({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    city: '',
    state_code: '',
    country_code: '',
    rec_restaurant: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.city.trim()) {
      newErrors.city = 'City name is required';
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
        city: formData.city.trim(),
        state_code: formData.state_code.toUpperCase(),
        country_code: formData.country_code.toUpperCase(),
        rec_restaurant: formData.rec_restaurant.trim()
      });

      setFormData({
        city: '',
        state_code: '',
        country_code: '',
        rec_restaurant: ''
      })
      setErrors({});
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='add-form-container'>
      <h3 className='add-form-title'>Add New City</h3>
      <form onSubmit={handleSubmit} className='add-form'>
        <div>
          <input 
            type='text' 
            placeholder='City Name *'
            value={capitalizeCityName(formData.city)}
            onChange={(e) => {
              setFormData({...formData, city: e.target.value});
              setErrors({...errors, city: null});
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: `1px solid ${errors.city ? '#f44336' : '#333'}`,
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
            disabled={isSubmitting}
          />
          {errors.city && ( <p className='error-text'>{errors.city}</p> )}
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

        <div>
          <input
            type="text"
            placeholder="Recommended Restaurant *"
            value={formData.rec_restaurant}
            onChange={(e) => {
              setFormData({...formData, rec_restaurant: e.target.value.trim()});
              setErrors({...errors, rec_restaurant: null});
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: `1px solid ${errors.rec_restaurant ? '#f44336' : '#333'}`,
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
            disabled={isSubmitting}
          />
          {errors.rec_restaurant && ( <p className='error-text'>{errors.rec_restaurant}</p> )}
        </div>

        <div className='form-actions'>
          <button type='submit' disabled={isSubmitting}
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
            {isSubmitting ? "Adding..." : "Add City"}
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
  )
}

export default function Cities() {
  const [results, setResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
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
      console.log("Cities loaded:", data);
      
      let list = [];
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data.cities)) {
          list = data.cities;
        } else if (Array.isArray(data.Cities)) {
          list = data.Cities;
        } else if (data.cities && typeof data.cities === 'object'){
          list = Object.values(data.cities);
        } else if (data.Cities && typeof data.Cities === 'object') {
          list = Object.values(data.Cities);
        }
      }
      const sortedList = sortCitiesAlphabetically(list);
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

  const fetchCityDetails = useCallback(async (cityName) => {
    try {
      console.log(`Fetching details for: ${cityName}`);
      const response = await axios.get(`${baseURL}/cities/${cityName}`);
      console.log("City details response:", response.data);
      
      if (response.data) {
        return response.data.Cities?.details || response.data.details || response.data;
      }
      
      return null;
    } catch (err) {
      console.error("Failed to fetch city details:", err);
      return null;
    }
  }, [baseURL]);

  const addCity = async (cityData) => {
    console.log('sending to url:', `${baseURL}/cities/add`);
    console.log('with data', {
      city: cityData.city,
      state_code: cityData.state_code,
      country_code: cityData.country_code,
      rec_restaurant: cityData.rec_restaurant
    });

    try {
      const response = await axios.post(`${baseURL}/cities/add`, {
        city: cityData.city,
        state_code: cityData.state_code,
        country_code: cityData.country_code,
        rec_restaurant: cityData.rec_restaurant
      });
      if (response.status === 200 || response.status === 201) {
        alert('City added successfully!');
        setShowAddForm(false);
        await fetchCities();
      }
    } catch (err) {
      console.error("Failed to add city:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to add city. Please try again.';
      alert(errorMessage);
      throw err;
    }
  };

  const deleteCity = async (cityData) => {
    try {
        const response = await axios.delete(`${baseURL}/cities/${cityData.city}`);

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

  const _handleSelectState = async (city) => {
    if (city.cityName) {
        const details = await fetchCityDetails(city.cityName);
        if (details) {
          setSelectedCity(details);
        } else {
          setSelectedCity(city);
        }
    } else {
        setSelectedCity(city);
    }
    
    setSearchQuery("");
    setSearchResults(null);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const clearSelectedCity = () => {
    setSelectedCity(null);
  };

  const displayData = searchResults || (results ? sortCitiesAlphabetically(results) : null);

  return (
    <div className="cities-container">
      <div className='cities-nav'>
        <Link to="/" className="nav-btn-cities">← Back to Home</Link>
        <Link to="/Countries" className="nav-btn-cities">View Countries</Link>
        <Link to="/States" className="nav-btn-cities">View States</Link>
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
          {showAddForm ? "Cancel" : "+ Add New City"}
        </button>
      </div>

      <h1 className="cities-title">Cities Database</h1>

      {error && (
        <div className='error-container'>
          <strong>Error:</strong> {error}
          <button onClick={fetchCities} className="retry-btn">Retry</button>
        </div>
      )}

      {showAddForm && ( <AddCityForm onAdd={addCity} onCancel={() => setShowAddForm(false)}/> )}

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

      {selectedCity && (
        <div className='selected-city-container'>
          <div className='selected-header'>
            <h3 className='selected-title'>
              Selected City: {capitalizeCityName(selectedCity.city)}
            </h3>
            <button
              onClick={clearSelectedCity}
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
                {selectedCity.country_code}
              </p>
              <p className='detail-item'>
                <strong className='detail-label'>State Code:</strong> 
                {selectedCity.state_code}
              </p>
            </div>
          </div>
        )}

      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cities...</p>
        </div>
      )}

      {displayData && displayData.length > 0 && !selectedCity && (
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

      {!isLoading && displayData?.length === 0 && !selectedCity && (
        <div className='empty-city'>
          <p className='empty-text'>No city found.</p>
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
          >Add Your First City
          </button>
        </div>
      )}
      </div>
  );
}