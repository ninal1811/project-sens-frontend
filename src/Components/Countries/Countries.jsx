import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import '../Common.css';
import './Countries.css';
import { getDietaryIcons } from '../../constants/dietaryIcons';
import { useAuth } from '../../hooks/useAuth';

function capitalizeName(name) {
  if (!name) return '';
  return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

function CountryCard({ countryData, onDelete, onUpdate, onViewStates, canDelete, canModify }) {
  const [open, setOpen] = useState(false);
  const [states, setStates] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [statesLoaded, setStatesLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { _id, name, capital, nat_dish, pop_dish_1, pop_dish_2, nat_dish_dietary, pop_dish_1_dietary, pop_dish_2_dietary } = countryData || {};
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: countryData?._id || '',
    name: countryData?.name || '',
    capital: countryData?.capital || '',
    nat_dish: countryData?.nat_dish || '',
    nat_dish_dietary: countryData?.nat_dish_dietary || [],
    pop_dish_1: countryData?.pop_dish_1 || '',
    pop_dish_1_dietary: countryData?.pop_dish_1_dietary || [],
    pop_dish_2: countryData?.pop_dish_2 || '',
    pop_dish_2_dietary: countryData?.pop_dish_2_dietary || []
  });

  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      _id: countryData?._id || '',
      name: countryData?.name || '',
      capital: countryData?.capital || '',
      nat_dish: countryData?.nat_dish || '',
      nat_dish_dietary: countryData?.nat_dish_dietary || [],
      pop_dish_1: countryData?.pop_dish_1 || '',
      pop_dish_1_dietary: countryData?.pop_dish_1_dietary || [],
      pop_dish_2: countryData?.pop_dish_2 || '',
      pop_dish_2_dietary: countryData?.pop_dish_2_dietary || []
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
        _id: editForm._id.toUpperCase(),
        name: capitalizeName(editForm.name),
        capital: capitalizeName(editForm.capital),
        nat_dish: capitalizeName(editForm.nat_dish),
        pop_dish_1: capitalizeName(editForm.pop_dish_1),
        pop_dish_2: capitalizeName(editForm.pop_dish_2)
      });
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
          await onDelete(countryData);
      } catch (error) {
          console.error("Delete failed:", error);
      } finally {
          setIsDeleting(false);
      }
    }
  };

  useEffect(() => {
    const loadStates = async () => {
      if (open && !statesLoaded && !isLoadingStates) {
        setIsLoadingStates(true);
        try {
          const statesData = await onViewStates(_id);
          setStates(statesData || []);
          setStatesLoaded(true);
        } catch (error) {
          console.error("Failed to load states:", error);
          setStates([]);
          setStatesLoaded(true);
        } finally {
          setIsLoadingStates(false);
        }
      }
    };
    loadStates();
  }, [open, statesLoaded, isLoadingStates, _id, onViewStates]);

  useEffect(() => {
    setStatesLoaded(false);
    setStates([]);
  }, [_id]);

  const handleStateClick = (state) => {
    navigate('/States', { state: { selectedState: state } });
  };

  if (isEditing) {
    return (
      <li className="edit-card">
        <div className="edit-form">
          <input
            type="text"
            placeholder="Country Code *"
            value={editForm._id}
            onChange={(e) => setEditForm({ ...editForm, _id: e.target.value.toUpperCase() })}
            className="edit-input"
            maxLength={3}
            disabled={isUpdating}
          />
  
          <input
            type="text"
            placeholder="Country Name *"
            value={capitalizeName(editForm.name)}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="edit-input"
            disabled={isUpdating}
          />
  
          <input
            type="text"
            placeholder="Country Capital *"
            value={capitalizeName(editForm.capital)}
            onChange={(e) => setEditForm({ ...editForm, capital: e.target.value })}
            className="edit-input"
            disabled={isUpdating}
          />
  
          <input
            type="text"
            placeholder="National Dish"
            value={capitalizeName(editForm.nat_dish)}
            onChange={(e) => setEditForm({ ...editForm, nat_dish: e.target.value })}
            className="edit-input"
            disabled={isUpdating}
          />
  
          <input
            type="text"
            placeholder="Popular Dish 1"
            value={capitalizeName(editForm.pop_dish_1)}
            onChange={(e) => setEditForm({ ...editForm, pop_dish_1: e.target.value })}
            className="edit-input"
            disabled={isUpdating}
          />
  
          <input
            type="text"
            placeholder="Popular Dish 2"
            value={capitalizeName(editForm.pop_dish_2)}
            onChange={(e) => setEditForm({ ...editForm, pop_dish_2: e.target.value })}
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
          className={`country-toggle-btn ${open ? 'open' : ''}`}
        >
          <span className="country-toggle-label">
            {name ?? "Unnamed country"} {_id ? `(${_id})` : ""}
          </span>
          <span className="country-expand-icon">{open ? '▾' : '▸'} </span>
        </button>
        {canModify && (
          <button
            onClick={handleEdit}
            className="btn-edit"
            title="Edit country"
          >
            ✎
          </button>
        )}

        {canModify && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-delete"
            title="Delete country"
          >
            {isDeleting ? "..." : "×"}
          </button>
        )}
      </div>

      {open && (
        <div className="country-details">
          <div className='country-info-section'>
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
              <strong className="country-detail-label">National Dish:</strong> {capitalizeName(nat_dish) ?? '—'} {getDietaryIcons(nat_dish_dietary)}
            </p>
            <p className="country-detail-text">
              <strong className="country-detail-label">Popular Dish 1:</strong> {capitalizeName(pop_dish_1) ?? '—'} {getDietaryIcons(pop_dish_1_dietary)}
            </p>
            <p className="country-detail-text">
              <strong className="country-detail-label">Popular Dish 2:</strong> {capitalizeName(pop_dish_2) ?? '—'} {getDietaryIcons(pop_dish_2_dietary)}
            </p>
          </div>
          <div className='states-section'>
            <div className='states-header'>
              <h4 className='states-title'>
                States in {capitalizeName(name)}
                {states.length > 0 && <span className='state-count'>({states.length})</span>}
              </h4>
            </div>

            {isLoadingStates ? (
              <div className='states-loading'>
                <div className='small-spinner'></div>
                <p>Loading states...</p>
              </div>
            ) : states && states.length > 0 ? (
              <div className='states-list'>
                {states.map((state, idx) => (
                  <div key={idx} className='states-item-link' onClick={() => handleStateClick(state)}>
                    <div className='state-item'>
                      <span className='state-name'>{capitalizeName(state.name || state)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='no-states'>
                <p>No states found for this country.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function AddCountryForm({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    capital: '',
    nat_dish: '',
    nat_dish_dietary: [],
    pop_dish_1: '',
    pop_dish_1_dietary: [],
    pop_dish_2: '',
    pop_dish_2_dietary: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData._id.trim()) {
      newErrors._id = 'Country code is required (e.g., USA)';
    } else if (formData._id.length !== 3) {
      newErrors._id = 'Country code must be 3 characters';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Country name is required';
    }
    if (!formData.capital.trim()) {
      newErrors.capital = 'Country capital is required';
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
        _id: formData._id.trim().toUpperCase(),
        name: formData.name.trim(),
        capital: formData.capital.trim(),
        nat_dish: formData.nat_dish.trim(),
        nat_dish_dietary: formData.nat_dish_dietary,
        pop_dish_1: formData.pop_dish_1.trim(),
        pop_dish_1_dietary: formData.pop_dish_1_dietary,
        pop_dish_2: formData.pop_dish_2.trim(),
        pop_dish_2_dietary: formData.pop_dish_2_dietary
      });

      setFormData({
        _id: '',
        name: '',
        capital: '',
        nat_dish: '',
        nat_dish_dietary: [],
        pop_dish_1: '',
        pop_dish_1_dietary: [],
        pop_dish_2: '',
        pop_dish_2_dietary: []
      })
      setErrors({});
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => { 
    setFormData({...formData, [field]: e.target.value});
    if (errors[field]) {
      setErrors({...errors, [field]: null});
    }
  };

  return (
    <div className='add-form-container'>
      <h3 className='add-form-title'>Add New Country</h3>
      <form onSubmit={handleSubmit} className='add-form'>
        <div>
          <input
            value={formData._id.toUpperCase()}
            placeholder="Country Code *"
            onChange={handleChange('_id')}
            className={`form-input ${errors._id ? 'error' : ''}`}
            disabled={isSubmitting}
            maxLength={3}
          />
          {errors._id && ( <p className='error-text'>{errors._id}</p> )}
        </div>

        <div>
          <input 
            type='text' 
            placeholder='Country Name *'
            value={capitalizeName(formData.name)}
            onChange={handleChange('name')}
            className={`form-input ${errors.name ? 'error' : ''}`}
            disabled={isSubmitting}
          />
          {errors.name && ( <p className='error-text'>{errors.name}</p> )}
        </div>

        <div>
          <input
            type='text'
            placeholder="Country Captial *"
            value={capitalizeName(formData.capital)}
            onChange={handleChange('capital')}
            className={`form-input ${errors.capital ? 'error' : ''}`}
            disabled={isSubmitting}
          />
          {errors.capital && ( <p className='error-text'>{errors.capital}</p> )}
        </div>

        <div>
          <input
            type="text"
            placeholder="National Dish"
            value={capitalizeName(formData.nat_dish)}
            onChange={handleChange('nat_dish')}
            className={`form-input`}
            disabled={isSubmitting}
          />
        </div>
        <div className="dietary-checkboxes">
          <label className="dietary-label">National Dish Dietary:</label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.nat_dish_dietary.includes('vegetarian')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.nat_dish_dietary, 'vegetarian']
                  : formData.nat_dish_dietary.filter(d => d !== 'vegetarian');
                setFormData({...formData, nat_dish_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🌱 Vegetarian
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.nat_dish_dietary.includes('meat')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.nat_dish_dietary, 'meat']
                  : formData.nat_dish_dietary.filter(d => d !== 'meat');
                setFormData({...formData, nat_dish_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🥩 Meat
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.nat_dish_dietary.includes('seafood')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.nat_dish_dietary, 'seafood']
                  : formData.nat_dish_dietary.filter(d => d !== 'seafood');
                setFormData({...formData, nat_dish_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🐟 Seafood
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.nat_dish_dietary.includes('vegan')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.nat_dish_dietary, 'vegan']
                  : formData.nat_dish_dietary.filter(d => d !== 'vegan');
                setFormData({...formData, nat_dish_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🥬 Vegan
          </label>
        </div>
        <div>
          <input
            type="text"
            placeholder="Popular Dish 1"
            value={capitalizeName(formData.pop_dish_1)}
            onChange={handleChange('pop_dish_1')}
            className={`form-input`}
            disabled={isSubmitting}
          />
        </div>
        {/* Popular Dish 1 Dietary Checkboxes */}
        <div className="dietary-checkboxes">
          <label className="dietary-label">Popular Dish 1 Dietary:</label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.pop_dish_1_dietary.includes('vegetarian')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.pop_dish_1_dietary, 'vegetarian']
                  : formData.pop_dish_1_dietary.filter(d => d !== 'vegetarian');
                setFormData({...formData, pop_dish_1_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🌱 Vegetarian
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.pop_dish_1_dietary.includes('meat')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.pop_dish_1_dietary, 'meat']
                  : formData.pop_dish_1_dietary.filter(d => d !== 'meat');
                setFormData({...formData, pop_dish_1_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🥩 Meat
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.pop_dish_1_dietary.includes('seafood')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.pop_dish_1_dietary, 'seafood']
                  : formData.pop_dish_1_dietary.filter(d => d !== 'seafood');
                setFormData({...formData, pop_dish_1_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🐟 Seafood
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.pop_dish_1_dietary.includes('vegan')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.pop_dish_1_dietary, 'vegan']
                  : formData.pop_dish_1_dietary.filter(d => d !== 'vegan');
                setFormData({...formData, pop_dish_1_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🥬 Vegan
          </label>
        </div>       
        <div>
          <input
            type="text"
            placeholder="Popular Dish 2"
            value={capitalizeName(formData.pop_dish_2)}
            onChange={handleChange('pop_dish_2')}
            className={`form-input`}
            disabled={isSubmitting}
          />
        </div>
        {/* Popular Dish 2 Dietary Checkboxes */}
        <div className="dietary-checkboxes">
          <label className="dietary-label">Popular Dish 2 Dietary:</label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.pop_dish_2_dietary.includes('vegetarian')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.pop_dish_2_dietary, 'vegetarian']
                  : formData.pop_dish_2_dietary.filter(d => d !== 'vegetarian');
                setFormData({...formData, pop_dish_2_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🌱 Vegetarian
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.pop_dish_2_dietary.includes('meat')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.pop_dish_2_dietary, 'meat']
                  : formData.pop_dish_2_dietary.filter(d => d !== 'meat');
                setFormData({...formData, pop_dish_2_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🥩 Meat
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.pop_dish_2_dietary.includes('seafood')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.pop_dish_2_dietary, 'seafood']
                  : formData.pop_dish_2_dietary.filter(d => d !== 'seafood');
                setFormData({...formData, pop_dish_2_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🐟 Seafood
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.pop_dish_2_dietary.includes('vegan')}
              onChange={(e) => {
                const newDietary = e.target.checked
                  ? [...formData.pop_dish_2_dietary, 'vegan']
                  : formData.pop_dish_2_dietary.filter(d => d !== 'vegan');
                setFormData({...formData, pop_dish_2_dietary: newDietary});
              }}
              disabled={isSubmitting}
            />
            🥬 Vegan
          </label>
        </div>
        <div className='form-actions'>
          <button type='submit' 
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? "Adding..." : "Add Country"}
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

export default function Countries() {
  const [results, setResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { isLoggedIn, isDeveloper, userEmail } = useAuth();
  const navigate = useNavigate();
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

  const fetchStatesByCountry = useCallback(async (_id) => {
    try {
      console.log(`Fetching details for: ${_id}`);
      const response = await axios.get(`${baseURL}/states/country/${_id}`);
      console.log("States response:", response.data);
      
      if (!response.data) {
          console.error("No data received from states");
          return [];
      }

      let statesArray = [];
      if (response.data.success && response.data.states) {
        statesArray = response.data.states;
        console.log("Found states in response.data.states:", statesArray);
      } else if (response.data.states && Array.isArray(response.data.states)) {
        statesArray = response.data.states;
      } else if (response.data.States && typeof response.data.States === 'object') {
        statesArray = Object.values(response.data.States);
      } else if (Array.isArray(response.data)) {
        statesArray = response.data;
      } else if (typeof response.data === 'object') {
        statesArray = Object.values(response.data).filter(item => item && typeof item === 'object' && (item.name || item.state_name));
      }
      console.log("Extracted states array:", statesArray);
      console.log("Number of states found:", statesArray.length);
      
      const formattedStates = statesArray.map(state => {
          if (state && typeof state === 'object') {
              const stateName = state.city || state.name || state.state_name || 'Unnamed State';
              return {
                  name: stateName,
                  ...state
              };
          } else if (typeof state === 'string') {
              return { name: state };
          }
          return null;
      }).filter(state => state !== null);
      
      console.log("Formatted states:", formattedStates);
      return formattedStates;    
    } catch (err) {
        console.error("Failed to fetch states for country:", err);
        return [];
    }
  }, [baseURL]);

  const addCountry = async (countryData) => {
    try {
      const response = await axios.post(`${baseURL}/countries/add`, {
        country_code: countryData._id,
        name: countryData.name,
        capital: countryData.capital,
        nat_dish: countryData.nat_dish,
        nat_dish_dietary: countryData.nat_dish_dietary || [],
        pop_dish_1: countryData.pop_dish_1,
        pop_dish_1_dietary: countryData.pop_dish_1_dietary || [],
        pop_dish_2: countryData.pop_dish_2,
        pop_dish_2_dietary: countryData.pop_dish_2_dietary || [],
        created_by: userEmail
      });
      if (response.status === 200 || response.status === 201) {
        alert('Country added successfully!');
        setShowAddForm(false);
        await fetchCountries();
      }
    } catch (err) {
      console.error("Failed to add country:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to add country. Please try again.';
      alert(errorMessage);
      throw err;
    }
  };

  const deleteCountry = async (countryData) => {
    try {
        const response = await axios.delete(`${baseURL}/countries/${countryData._id}`);

        if (response.status === 200) {
            alert('Country deleted successfully!');
            await fetchCountries();
            
            if (selectedCountry && selectedCountry.capital === countryData.capital && 
                selectedCountry.country_code === countryData.country_code) {
                setSelectedCountry(null);
            }
        }
    } catch (err) {
        console.error("Failed to delete country:", err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to delete city. Please try again.';
        alert(errorMessage);
        throw err;
    }
  };

  const updateCountry = async (oldCountry, newCountryData) => {
    try {
      const response = await axios.post(`${baseURL}/countries/add`, {
        country_code: newCountryData._id,
        name: newCountryData.name,
        capital: newCountryData.capital,
        nat_dish: newCountryData.nat_dish,
        nat_dish_dietary: newCountryData.nat_dish_dietary || [],
        pop_dish_1: newCountryData.pop_dish_1,
        pop_dish_1_dietary: newCountryData.pop_dish_1_dietary || [],
        pop_dish_2: newCountryData.pop_dish_2,
        pop_dish_2_dietary: newCountryData.pop_dish_2_dietary || [],
        created_by: userEmail
      });
  
      if (response.status === 200) {
        alert('Country updated successfully!');
        await fetchCountries();
      }
    } catch (err) {
      console.error("Failed to update country:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update country. Please try again.';
      alert(errorMessage);
      throw err;
    }
  };

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

  const clearSelectedCountry = () => {
    setSelectedCountry(null);
  }

  const displayData = searchResults || (results ? sortCountriesAlphabetically(results) : null);

  return (
    <div className="page-container">
      <div className="page-nav">
        <Link to="/" className="nav-btn">← Back to Home</Link>
        <Link to="/States" className="nav-btn">View States</Link>
        <Link to="/Cities" className="nav-btn">View Cities</Link>
        <button
          onClick={() => {
            if (!isLoggedIn) {
              navigate('/Login', { state: { from: '/Countries' } });
              return;
            }
            setShowAddForm(!showAddForm);
          }}
          className={`add-btn ${showAddForm ? 'cancel-mode' : 'add-mode'}`}
        >
          {showAddForm ? "Cancel" : "+ Add New Country"}
        </button>
      </div>

      <h1 className="page-title">Countries Database</h1>

      {error && (
        <div className="error-container">
          <strong>Error:</strong> {error}
          <button onClick={fetchCountries} className="error-inline-btn">Retry</button>
        </div>
      )}

      {showAddForm && ( <AddCountryForm onAdd={addCountry} onCancel={() => setShowAddForm(false)}/> )}

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

      {displayData && displayData.length > 0 && !selectedCountry && (
        <>
        <div className='stats-display'></div>
        <ul className="list">
          {displayData.map((countryObj, idx) => (
            <CountryCard
              countryData={countryObj}
              key={`${countryObj?._id ?? "no-code"}-${idx}`}
              onDelete={deleteCountry}
              onUpdate={updateCountry}
              onViewStates={fetchStatesByCountry}
              canModify={isDeveloper || countryObj?.created_by === userEmail}
            />
          ))}
        </ul>
        </>
      )}

      {!isLoading && displayData?.length === 0 && !searchQuery && (
        <div className="empty-state-box">
          <p>No countries found.</p>
        </div>
      )}
    </div>
  );
}