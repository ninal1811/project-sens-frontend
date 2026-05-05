import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import axios from 'axios'
import '../Common.css';
import './Cities.css'
import { CITY_IMAGE_URLS } from '../../constants/imgUrls';
import { useAuth } from '../../hooks/useAuth';
import ScrollToTop from '../ScrollToTop';

function capitalizeName(city) {
  if (!city) return '';
  return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

function CityCard({ cityData, onDelete, onUpdate, canModify }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { city, state_code, country_code, rec_restaurant } = cityData || {};
  const [editForm, setEditForm] = useState({
    city: cityData?.city || '',
    state_code: cityData?.state_code || '',
    country_code: cityData?.country_code || '',
    rec_restaurant: cityData?.rec_restaurant || ''
  });

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      city: cityData?.city || '',
      state_code: cityData?.state_code || '',
      country_code: cityData?.country_code || '',
      rec_restaurant: cityData?.rec_restaurant || ''
    });
  };

  const handleSave = async () => {
    if (!editForm._id || !editForm.name || !editForm.capital) {
      alert('Please fill in all required fields');
      return;
    }
  
    setIsUpdating(true);
    try {
      await onUpdate(countryData, {
        ...editForm,
        city: capitalizeName(editForm.city),
        state_code: editForm.state_code.toUpperCase(),
        country_code: editForm.country_code.toUpperCase(),
        rec_restaurant: capitalizeName(editForm.rec_restaurant)
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <li className="edit-card">
        <div className="edit-form">
          <input
            type="text"
            placeholder="City *"
            value={editForm.city}
            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
            className="edit-input"
            disabled={isUpdating}
          />

          <input
            type="text"
            placeholder="State Code *"
            value={editForm.state_code}
            onChange={(e) => setEditForm({ ...editForm, state_code: e.target.value.toUpperCase() })}
            className="edit-input"
            maxLength={3}
            disabled={isUpdating}
          />

          <input
            type="text"
            placeholder="Country Code *"
            value={editForm.country_code}
            onChange={(e) => setEditForm({ ...editForm, country_code: e.target.value.toUpperCase() })}
            className="edit-input"
            maxLength={3}
            disabled={isUpdating}
          />
  
          <input
            type="text"
            placeholder="Restaurant"
            value={capitalizeName(editForm.rec_restaurant)}
            onChange={(e) => setEditForm({ ...editForm, rec_restaurant: e.target.value })}
            className="edit-input"
            disabled={isUpdating}
          />
  
          <div className="form-actions">
            <button onClick={handleSave} disabled={isUpdating} className="btn btn-primary btn-small">
              {isUpdating ? "Saving..." : "Save"}
            </button>
            <button onClick={handleCancel} disabled={isUpdating} className="btn btn-secondary btn-small">
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="card">
      <div className='card-header'>
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
        {canModify && (
          <button
            onClick={handleEdit}
            className="btn-edit"
            title="Edit city"
          >
            ✎
          </button>
        )}

        {canModify && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-delete"
            title="Delete city"
          >
            {isDeleting ? "..." : "×"}
          </button>
        )}
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
       {CITY_IMAGE_URLS[city] ? (
         <div className="city-image-wrapper">
           <img 
             src={CITY_IMAGE_URLS[city].image} 
             alt={CITY_IMAGE_URLS[city].restaurant_name || rec_restaurant}
           />
         </div>
       ) : (
         <p style={{ fontSize: "13px", color: "#666", fontStyle: "italic", marginTop: "12px" }}>No restaurant photo available</p>
       )}
        </div>
      )}
    </li>
  );
}

function AddCityForm({ onAdd, onCancel, countries = [], states = [] }) {
  const [formData, setFormData] = useState({
    city: '',
    state_code: '',
    country_code: '',
    rec_restaurant: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const filteredStates = formData.country_code
    ? states.filter(s => s.country_code === formData.country_code)
    : states;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.city.trim()) {
      newErrors.city = 'City name is required';
    }
    if (!formData.state_code) {
      newErrors.state_code = 'Please select a state';
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
        city: formData.city.trim(),
        state_code: formData.state_code,
        country_code: formData.country_code,
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
            value={capitalizeName(formData.city)}
            onChange={(e) => {
              setFormData({...formData, city: e.target.value});
              setErrors({...errors, city: null});
            }}
            className={`form-input ${errors.city ? 'error' : ''}`}
            disabled={isSubmitting}
          />
          {errors.city && ( <p className='error-text'>{errors.city}</p> )}
        </div>

        <div>
          <select
            value={formData.country_code}
            onChange={(e) => {
              setFormData({...formData, country_code: e.target.value, state_code: ''});
              setErrors({...errors, country_code: null, state_code: null});
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

        <div>
          <select
            value={formData.state_code}
            onChange={(e) => {
              setFormData({...formData, state_code: e.target.value});
              setErrors({...errors, state_code: null});
            }}
            className={`form-input ${errors.state_code ? 'error' : ''}`}
            disabled={isSubmitting || !formData.country_code}
          >
            <option value="">{formData.country_code ? 'Select State *' : 'Select a country first'}</option>
            {filteredStates.map(s => (
              <option key={s.state_code} value={s.state_code}>
                {s.name} ({s.state_code})
              </option>
            ))}
          </select>
          {errors.state_code && ( <p className='error-text'>{errors.state_code}</p> )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Recommended Restaurant *"
            value={capitalizeName(formData.rec_restaurant)}
            onChange={(e) => {
              setFormData({...formData, rec_restaurant: e.target.value.trim()});
              setErrors({...errors, rec_restaurant: null});
            }}
            className={`form-input ${errors.rec_restaurant ? 'error' : ''}`}
            disabled={isSubmitting}
          />
          {errors.rec_restaurant && ( <p className='error-text'>{errors.rec_restaurant}</p> )}
        </div>

        <div className='form-actions'>
          <button type='submit' 
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? "Adding..." : "Add City"}
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
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const { isLoggedIn, isDeveloper, userEmail } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
    const cityFromNavigation = location.state?.selectedCity;
    if (cityFromNavigation) {
      console.log("City received from navigation:", cityFromNavigation);
      if (results && results.length > 0) {
        const fullCityData = results.find(
          city => city.city === cityFromNavigation.name || 
          city.city === cityFromNavigation.city
        );
        if (fullCityData) {
          setSelectedCity(fullCityData);
        } else {
          setSelectedCity(cityFromNavigation);
        }
      } else {
        setSelectedCity(cityFromNavigation);
      }
      
      setTimeout(() => {
        const selectedElement = document.querySelector('.selected-city-container');
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [location.state?.selectedCity, results]);

  useEffect(() => {
    fetchCities();
    axios.get(`${baseURL}/countries`)
      .then(({ data }) => {
        const raw = data?.countries ?? {};
        const list = Array.isArray(raw) ? raw : Object.values(raw);
        setCountries(list.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      })
      .catch((err) => console.error("Failed to fetch countries:", err));
    axios.get(`${baseURL}/states/read`)
      .then(({ data }) => {
        const raw = data?.states ?? data?.States ?? [];
        const list = Array.isArray(raw) ? raw : Object.values(raw);
        setStates(list.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      })
      .catch((err) => console.error("Failed to fetch states:", err));
  }, [fetchCities, baseURL]);

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
    try {
      const response = await axios.post(`${baseURL}/cities/add`, {
        city: cityData.city,
        state_code: cityData.state_code,
        country_code: cityData.country_code,
        rec_restaurant: cityData.rec_restaurant,
        created_by: userEmail
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
            
            if (selectedCity && selectedCity.state_code === cityData.state_code && 
                selectedCity.country_code === cityData.country_code) {
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
    <div className="page-container">
      <div className='page-nav'>
        <Link to="/" className="nav-btn">← Back to Home</Link>
        <Link to="/Countries" className="nav-btn">View Countries</Link>
        <Link to="/States" className="nav-btn">View States</Link>
        <button
          onClick={() => {
            if (!isLoggedIn) {
              navigate('/Login', { state: { from: '/Cities' } });
              return;
            }
            setShowAddForm(!showAddForm);
          }}
          className={`add-btn ${showAddForm ? 'cancel-mode' : 'add-mode'}`}
        >
          {showAddForm ? "Cancel" : "+ Add New City"}
        </button>
      </div>

      <h1 className="page-title">Cities Database {results && results.length > 0 && <span style={{ fontSize: "16px", color: "#888", fontWeight: "normal" }}>({results.length} cities)</span>}</h1>

      {error && (
        <div className='error-container'>
          <strong>Error:</strong> {error}
          <button onClick={fetchCities} className="retry-btn">Retry</button>
        </div>
      )}

      {showAddForm && ( <AddCityForm onAdd={addCity} onCancel={() => setShowAddForm(false)} countries={countries} states={states}/> )}

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
              Selected City: {capitalizeName(selectedCity.city)}
            </h3>
            <button
              onClick={clearSelectedCity}
                className="btn btn-secondary btn-small"
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
              {selectedCity.rec_restaurant && (
                <p className='detail-item'>
                  <strong className='detail-label'>Recommended Restaurant:</strong> 
                  {selectedCity.rec_restaurant}
                </p>
              )}
              {CITY_IMAGE_URLS[selectedCity.city] ? (
                <div className="city-image-wrapper">
                  <img 
                    src={CITY_IMAGE_URLS[selectedCity.city].image} 
                    alt={CITY_IMAGE_URLS[selectedCity.city].restaurant_name || selectedCity.rec_restaurant}
                  />
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "#666", fontStyle: "italic", marginTop: "12px" }}>No restaurant photo available</p>
              )}
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
          <ul className="list">
            {displayData.map((cityObj, idx) => (
              <CityCard
                cityData={cityObj}
                key={`${cityObj?.city ?? "no-city"}-${idx}`}
                onDelete={deleteCity}
                canModify={isDeveloper || cityObj?.created_by === userEmail}
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
            className="btn btn-primary"
          >Add Your First City
          </button>
        </div>
      )}
      <ScrollToTop />
      </div>
  );
}