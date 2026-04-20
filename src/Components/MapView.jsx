// import statements
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
// contains boundary conditions to see outlines of countries and states
import countriesData from "../data/countries.json";
import statesData from "../data/states.json";
// city marker data: lat and long coordinates
import citiesCoords from "../data/cities.json";
import Legend from "./Legend";
import { useFavorites } from "./useFavorites";
import './MapView.css';
import NavBar from './NavBar';
import { getDietaryIcons } from '../constants/dietaryIcons';
import { COUNTRY_IMAGE_URLS, STATE_IMAGE_URLS, CITY_IMAGE_URLS } from '../constants/imgUrls';

const BASE_URL = import.meta.env.VITE_API_URL;
// logs latitude and longitude data whenever you click on a new area on the map
function ClickDebug() {
  useMapEvents({
    click: (e) => {
      console.log("map clicked at", e.latlng);
    }
  });
  return null;
}

function capitalizeName(name) {
  if (!name) return '';
  return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

// Adds a favorite button into an open Leaflet popup
function useFavoritePopupButton({ isFavorited, toggleFavorite, navigate }) {
  const attachButton = useCallback((map) => {
    map.on("popupopen", (e) => {
      const container = e.popup.getElement();
      if (!container) return;
 
      // Avoid double-injecting
      if (container.querySelector(".popup-fav-btn")) return;
 
      const favDataEl = container.querySelector("[data-fav]");
      if (!favDataEl) return;
 
      let item;
      try { item = JSON.parse(favDataEl.dataset.fav); } catch { return; }
 
      const btn = document.createElement("button");
      btn.className = "popup-fav-btn";
      btn.title = "Save to favorites";
      btn.textContent = isFavorited(item.id) ? "⭐ Saved" : "☆ Save";
 
      btn.addEventListener("click", () => {
        const success = toggleFavorite(item);
        if (!success) {
          // If not logged in -> send to login, come back here after
          navigate("/Login", { state: { from: "/Favorites" } });
          return;
        }
        btn.textContent = isFavorited(item.id) ? "☆ Save" : "⭐ Saved";
      });
 
      favDataEl.appendChild(btn);
    });
  }, [isFavorited, toggleFavorite, navigate]);
 
  return attachButton;
}

// receives list of cities, click handler, and state codes
function StatesLayer({ visibleCities, onStateClick, backendStatesRef, backendStatesIds, attachFavButton}) {
  const map = useMap();

  useEffect(() => { attachFavButton(map); }, [map, attachFavButton]);

  const getStateCode = useCallback((feature) => {
    return feature?.properties?.state_code || null;
  }, []);

  // decides look of state, if state exists in backend data, it shows as blue to filter what's in our dataset
  // otherwise, it shows as gray
  const styleState = useCallback((feature) => {
    const stateCode = getStateCode(feature);
    const isInBackend = stateCode && backendStatesIds.has(stateCode);
  
    return {
      weight: 1.2,
      color: "#14532d",              // Dark forest green borders
      opacity: 0.9,
      fillOpacity: 0.8,
      fillColor: isInBackend ? "#15803d" : "#bbf7d0", // Dark vs light green
    };
  }, [backendStatesIds, getStateCode]);
  
  // adds state name on hover
  // when clicked, zooms the map to fit state boundaries
  // shows popup of state info and list of its cities
  const onEachState = useCallback((feature, layer) => {
    console.log("state feature:", feature?.properties);
    const stateName = feature?.properties?.name;
    if (stateName) {
      layer.bindTooltip(stateName, { permanet: false, direction: "center" });
    }

    layer.on("click", () => {
      const stateCode = getStateCode(feature);
      if (!stateCode) return;

      const backendMatch = backendStatesRef.current[stateCode];
      if (backendMatch) {
        onStateClick(backendMatch, stateCode);
        map.fitBounds(layer.getBounds(), { padding: [40, 40] });

        const _stateCities = visibleCities.filter(city => city.state_code === stateCode);
        const stateImg = STATE_IMAGE_URLS[stateCode];
        const favItem = JSON.stringify({
          id: stateCode, type: "state",
          name: `${backendMatch.name} (${backendMatch.state_code})`,
          subtitle: backendMatch.country_code,
          image: stateImg?.image || ""
        });
          const html = `
          <div class="state-popup-container">
            ${stateImg ? `
              <div class="popup-image-container">
                <img src="${stateImg.image}" class="popup-image" />
                <div class="popup-dish-label">
                  ${backendMatch.food_name || 'Regional Cuisine'} ${getDietaryIcons(backendMatch.food_dietary || [])}
                </div>
              </div>` : backendMatch.food_name ? `
              <div class="popup-dish-label">
                <strong>Popular Food:</strong> ${backendMatch.food_name} ${getDietaryIcons(backendMatch.food_dietary || [])}
              </div>` : ''}
            <div class="popup-state-name">${backendMatch.name}</div>
            <div><strong>State Code:</strong> ${backendMatch.state_code}</div>
            <div data-fav='${favItem}'></div>
          </div>
        `;
        layer.bindPopup(html, {
          offset: L.point(0, -10),
          autoPanPaddingTopLeft: L.point(0, 80),
          autoPanPaddingBottomRight: L.point(0, 20),
        }).openPopup();
      }
    });

  }, [backendStatesRef, getStateCode, map, onStateClick, visibleCities]);

  return (
    <GeoJSON key={`states-${backendStatesIds.size}`} data={statesData} style={styleState} onEachFeature={onEachState} bubblingMouseEvents={false}/>
  );

}

function MapController({ visibleCities, onCountryClick, backendCountriesRef, backendIds, showStates, 
  selectedCountry, onStateClick, backendStatesRef, backendStatesIds, onBackToCountries, attachFavButton, allCitiesRef }) {
  const map = useMap();

  useEffect(() => { attachFavButton(map); }, [map, attachFavButton]);

  useEffect(() => {
    const overlayPane = map.getPane('overlayPane')
    if (overlayPane) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutations) => {
          mutations.addedNodes.forEach((node) => {
            if (node.nodeName === 'path' || node.classList?.contains('leaflet-interactive')) {
              node.style.outline = 'none';
              node.addEventListener('focus', (e) => e.target.style.outline = 'none');
              node.addEventListener('blur', (e) => e.target.style.outline = 'none');
            }
          });
        });
      });
      observer.observe(overlayPane, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [map]);

  // Click on map background (ocean/gray areas) to go back to country view
  useEffect(() => {
    if (!showStates) return;

    const handleMapClick = (e) => {
      // Check if the click target is the map container (background), not a feature
      const clickedElement = e.originalEvent.target;
      const isMapBackground = clickedElement.classList.contains('leaflet-container') || 
                              clickedElement.classList.contains('leaflet-tile') ||
                              clickedElement.tagName === 'IMG'; // Tile images
      
      if (isMapBackground) {
        onBackToCountries();
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, showStates, onBackToCountries]);

  const getIso3 = useCallback((feature) => {
    return feature?.properties?.["ISO3166-1-Alpha-3"] || null;
  }, []);
  
  // same logic as states for frontend look, those in backend are highlighted in blue
  const styleFeature = useCallback((feature) => {
    const iso3 = getIso3(feature);
    const isInBackend = iso3 && backendIds.has(iso3);

    return {
      weight: 1.5,
      color: "#1e3a1e",              // Dark green borders
      fillOpacity: 0.85,
      fillColor: isInBackend ? "#166534" : "#a3c585",
    };
  }, [backendIds, getIso3]);

  const onEachFeature = useCallback((feature, layer) => {
    layer.on("click", () => {
      const iso3 = getIso3(feature);
      if (!iso3) return;

      const backendMatch = backendCountriesRef.current[iso3];
      if (backendMatch) {
        onCountryClick(backendMatch, iso3);
        map.fitBounds(layer.getBounds(), { padding: [40, 40] });
        
        const imgs = COUNTRY_IMAGE_URLS[backendMatch._id];
        const natImg = backendMatch.image_url || (typeof imgs === 'object' ? imgs.nat_dish : imgs) || '';
        const pop1Img = typeof imgs === 'object' ? imgs.pop_dish_1 : '';
        const pop2Img = typeof imgs === 'object' ? imgs.pop_dish_2 : '';
        const cityCount = Object.values(allCitiesRef.current).filter(c => c.country_code === iso3).length;

        const favItem = JSON.stringify({
          id: backendMatch._id, type: "country",
          name: backendMatch.name,
          subtitle: `Capital: ${backendMatch.capital}`,
          image: natImg
        });

        const html = `
          <div class="popup-container">
            ${natImg ? `
              <div class="popup-image-container">
                <img src="${natImg}" class="popup-image" />
                <div class="popup-dish-label">National Dish: ${capitalizeName(backendMatch.nat_dish)} ${getDietaryIcons(backendMatch.nat_dish_dietary)}</div>
              </div>` : backendMatch.nat_dish ? `
              <div class="popup-dish-label">
                <strong>National Dish:</strong> ${backendMatch.nat_dish} ${getDietaryIcons(backendMatch.nat_dish_dietary || [])}
              </div>` : ''}
            
            ${(pop1Img || pop2Img) ? `
              <div class="popup-dishes-grid">
                ${pop1Img ? `<div class="popup-dish-item">
                  <img src="${pop1Img}" class="popup-image" />
                  <div class="popup-dish-label">Popular Dish: ${capitalizeName(backendMatch.pop_dish_1)} ${getDietaryIcons(backendMatch.pop_dish_1_dietary)}</div>
                </div>` : ''}
                ${pop2Img ? `<div class="popup-dish-item">
                  <img src="${pop2Img}" class="popup-image" />
                  <div class="popup-dish-label">Popular Dish: ${capitalizeName(backendMatch.pop_dish_2)} ${getDietaryIcons(backendMatch.pop_dish_2_dietary)}</div>
                </div>` : ''}
              </div>` : (backendMatch.pop_dish_1 || backendMatch.pop_dish_2) ? `
              <div class="popup-dish-label">
                ${backendMatch.pop_dish_1 ? `<div><strong>Popular Dish 1:</strong> ${backendMatch.pop_dish_1} ${getDietaryIcons(backendMatch.pop_dish_1_dietary || [])}</div>` : ''}
                ${backendMatch.pop_dish_2 ? `<div><strong>Popular Dish 2:</strong> ${backendMatch.pop_dish_2} ${getDietaryIcons(backendMatch.pop_dish_2_dietary || [])}</div>` : ''}
              </div>` : ''}
            
            <div class="popup-country-name">${backendMatch.name}</div>
            <div><b>Capital:</b> ${capitalizeName(backendMatch.capital)}</div>
            ${cityCount > 0 ? `<div class="popup-city-count">🏙️ ${cityCount} ${cityCount === 1 ? 'city' : 'cities'} available</div>` : ''}
            <div data-fav='${favItem}'></div>
          </div>
        `;
        layer.bindPopup(html, {
          offset: L.point(0, -10),
          autoPanPaddingTopLeft: L.point(0, 80),
          autoPanPaddingBottomRight: L.point(0, 20),
        }).openPopup();
      }
    });
  }, [backendCountriesRef, getIso3, map, onCountryClick, allCitiesRef]);

  const WORLD_BOUNDS = [
    [-90, -180],
    [90, 180],
  ];

  // when a country is clicked, it looks at the country code, finds the matching backend data, and shows a popup of the dish info and image
  return (
    <>
      <GeoJSON key={backendIds.size} data={countriesData} style={styleFeature} onEachFeature={onEachFeature} />

      {showStates && selectedCountry && (
        <StatesLayer 
          visibleCities={visibleCities} 
          onStateClick={onStateClick} 
          backendStatesRef={backendStatesRef} 
          backendStatesIds={backendStatesIds} 
          countryCode={selectedCountry._id}
          attachFavButton={attachFavButton}
          />
      )}

      {visibleCities.map((city) => {
        const coords = citiesCoords[city.city];
        if (!coords) return null;

        const cityImg = CITY_IMAGE_URLS[city.city];
        
        // DEBUG
        console.log('CITY:', city.city, 'hasCityImg:', !!cityImg, 'cityImg:', cityImg);

        const favItem = JSON.stringify({
          id: city.city, type: "city",
          name: city.city,
          subtitle: city.state || city.country_code || "",
          image: cityImg?.image || ""
        });

        return (
          <CircleMarker
            key={city.city}
            center={[coords.lat, coords.lng]}
            radius={showStates ? 8 : 6}  // Bigger when state selected (reversed)
            pathOptions={{ 
              color: "#ffffff",                              // White border for contrast
              fillColor: showStates ? "#ff0000" : "#ff6600", // Red when state selected, orange otherwise
              fillOpacity: 1,
              weight: 2                                       // Border thickness
            }}
          >
            <Popup 
              offset={[0, -10]}
              autoPanPaddingTopLeft={[0, 80]}
              autoPanPaddingBottomRight={[0, 10]}
            >
            <div className="city-popup-container">
              {cityImg && (
                <div className="city-popup-image-container">
                  <img
                    src={cityImg.image}
                    alt={cityImg.restaurant_name}
                    className="city-popup-image"
                  />
                  <div className="city-popup-restaurant-label">
                    Popular Restaurant: {cityImg.restaurant_name}
                  </div>
                </div>
              )}
              <div className="city-popup-name">{city.city}</div>
              {city.state && <div><b>State:</b> {city.state}</div>}
              {city.rec_restaurant && <div><b>Recommended Restaurant:</b> {city.rec_restaurant}</div>}
              <div data-fav={favItem}></div>
            </div>
          </Popup>
          </CircleMarker>
        );  
      })}

      {/* LABELS LAYER - MUST BE LAST TO APPEAR ON TOP */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png"
        noWrap={true}
        bounds={WORLD_BOUNDS}
        pane="shadowPane"
        className="white-labels"
      />
    </>
  );
}
export default function MapView() {
  const [backendCountries, setBackendCountries] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [visibleCities, setVisibleCities] = useState([]);
  const allCitiesRef = useRef({});
  const backendCountriesRef = useRef({});
  const backendStatesRef = useRef({});
  const mapRef = useRef(null);
  const [backendStates, setBackendStates] = useState({});
  const [selectedState, setSelectedState] = useState(null);
  const [_visibleStates, _setVisibleStates] = useState([]);
  const [showStates, setShowStates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showEscHint, setShowEscHint] = useState(false); 

  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavorites();
  const attachFavButton = useFavoritePopupButton({ isFavorited, toggleFavorite, navigate });

  useEffect(() => {
    const fetchCountries = () => {
      axios.get(`${BASE_URL}/countries`)
        .then(({ data }) => {
          const countries = data?.countries || {};
          setBackendCountries(countries);
          backendCountriesRef.current = countries;
          console.log("Countries loaded:", Object.keys(countries).length);
        })
        .catch((err) => console.error("Error fetching countries:", err));
    };
  
    fetchCountries();
  
    // Poll for updates every 5 seconds when on map page
    const interval = setInterval(fetchCountries, 5000);
  
    axios.get(`${BASE_URL}/states/read`)
      .then(({ data }) => {
        const raw = data?.states ?? data?.States ?? [];
        const list = Array.isArray(raw) ? raw : Object.values(raw);
        const statesMap = {};
        list.forEach(s => {
          if (s.state_code) statesMap[s.state_code] = s;
        });
        setBackendStates(statesMap);
        backendStatesRef.current = statesMap;
      })
      .catch((err) => console.error("Error fetching states: ", err));
  
    axios.get(`${BASE_URL}/cities/read`)
      .then(({ data }) => { allCitiesRef.current = data?.Cities || {}; })
      .catch((err) => console.error("Error fetching cities:", err));
  
    return () => clearInterval(interval);
  }, []);

  const backendIds = useMemo(() => new Set(Object.keys(backendCountries)), [backendCountries]);
  const backendStatesIds = useMemo(() => new Set(Object.keys(backendStates)), [backendStates]);

  // code to fetch endpoints and data and stores the results
  const handleCountryClick = useCallback((country, iso3) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setShowStates(true);
    const cities = Object.values(allCitiesRef.current).filter(c => c.country_code === iso3);
    console.log("clicked:", iso3, "cities:", cities);
    setVisibleCities(cities);
  }, []);

  // when a country is clicked, turns on states layer to filter states only for that specific country
  const handleStateClick = useCallback((state, stateCode) => {
    setSelectedState(state);

    if (state.country_code && backendCountriesRef.current[state.country_code]) {
      setSelectedCountry(backendCountriesRef.current[state.country_code]);
    }

    const cities = Object.values(allCitiesRef.current).filter(c => c.state_code === stateCode);
    console.log("clicked state: ", stateCode, "cities: ", cities.length);
    setVisibleCities(cities);
    setSearchQuery("");
    setShowSearchResults(false);
  }, []);
  const handleBackToCountry = useCallback(() => {
    setSelectedState(null);
    if (selectedCountry) {
      const cities = Object.values(allCitiesRef.current).filter(
        c => c.country_code === selectedCountry._id
      );
      setVisibleCities(cities);

      const iso3 = selectedCountry._id;
      const countryFeature = countriesData.features.find(
        f => f.properties?.["ISO3166-1-Alpha-3"] === iso3
      );
      if (countryFeature && mapRef.current) {
        const layer = L.geoJSON(countryFeature);
        mapRef.current.fitBounds(layer.getBounds(), { padding: [40, 40] });
      }
    }
    setSearchQuery("");
    setShowSearchResults(false);
  }, [selectedCountry]);

  // same idea - when a state is clicked, filters so it looks at cities just belonging to that state
  const handleBackToCountries = useCallback (() => {
    setShowStates(false);
    setSelectedState(null);
    if (selectedCountry) {
      const cities = Object.values(allCitiesRef.current).filter(
        c => c.country_code === selectedCountry._id
      );
      setVisibleCities(cities);
    }
    mapRef.current?.setView([20, 0], 2);
    setSearchQuery("");
    setShowSearchResults(false);
  }, [selectedCountry]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const searchLower = query.toLowerCase();

    // search countries
    Object.values(backendCountriesRef.current).forEach(country => {
      if (country.name.toLowerCase().includes(searchLower)) {
        results.push({
          type: "country",
          id: country._id,
          name: country.name,
          country: country
        });
      }
    });

    Object.values(backendStatesRef.current).forEach(state => {
      if (state.name.toLowerCase().includes(searchLower) || state.state_code?.toLowerCase().includes(searchLower)) {
        
        let countryName = "Unknown";
        if (state.country_code && backendCountriesRef.current[state.country_code]) {
          countryName = backendCountriesRef.current[state.country_code].name;
        }

        results.push({
          type: 'state',
          id: state.state_code,
          name: state.name,
          countryCode: state.country_code,
          countryName: countryName,
          state: state
        });
      }
    });

    // search cities
    Object.values(allCitiesRef.current).forEach(city => {
      if (city.city.toLowerCase().includes(searchLower)) {
        results.push({
          type: "city",
          id: city.city,
          name: city.city,
          countryCode: city.country_code,
          stateCode: city.state_code
        });
      }
    });
    
    setSearchResults(results.slice(0, 10));
    setShowSearchResults(true);
  }, []);

  const handleSelectState = useCallback((result) => {
    setSearchQuery(result.name);
    setShowSearchResults(false);

    // COUNTRY SEARCH
    if (result.type === "country") {
      const country = result.country;
      setSelectedCountry(country);
      setShowStates(true);

      const cities = Object.values(allCitiesRef.current).filter(
        c => c.country_code === result.id
      );

      setVisibleCities(cities);
      return;
    }
    
    // STATE SEARCH
    if (result.countryCode && backendCountriesRef.current[result.countryCode]) {
      const country = backendCountriesRef.current[result.countryCode];

      if (!selectedCountry || selectedCountry._id !== result.countryCode) {
        setSelectedCountry(country);
        setShowStates(true);
        
        const countryCities = Object.values(allCitiesRef.current).filter(
          c => c.country_code === result.countryCode
        );
        setVisibleCities(countryCities);
      }      
      handleStateClick(result.state, result.id);
    }

    // CITY SEARCH
    if (result.type === "city") {
      const coords = citiesCoords[result.name];
      if (coords && mapRef.current) {
        mapRef.current.setView([coords.lat, coords.lng], 10);
      }

      const city = Object.values(allCitiesRef.current).find(
        c => c.city === result.name
      );

      if (city) {
        setVisibleCities([city]);
      }
    }
  }, [selectedCountry, handleStateClick]);

  // ESC key to go back to world view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showStates) {
        handleBackToCountries();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showStates, handleBackToCountries]);

  useEffect(() => {
    if (showStates) {
      setShowEscHint(true);
      const timer = setTimeout(() => setShowEscHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showStates]);

  const WORLD_BOUNDS = [
    [-90, -180],
    [90, 180],
  ];

  return (
    <div className="mapview-root">
      <NavBar
      searchQuery={searchQuery}
      onSearch={handleSearch}
      searchResults={searchResults}
      showSearchResults={showSearchResults}
      onSelectResult={handleSelectState}
      onClearSearch={() => {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearchResults(false);
      }}
      />
      <Legend showStates={showStates} />
      <div className="map-wrapper">
        <MapContainer
          rref={mapRef}
          center={[25, 15]}  // Slightly adjusted center
          zoom={2.5}         // Less zoomed in = see more
          minZoom={2}
          maxBounds={WORLD_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          className="map-container">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"
            noWrap={true}
            bounds={WORLD_BOUNDS}
            zIndex={9999}
            className="country-labels"
          />
          <ClickDebug />
          <MapController
            visibleCities={visibleCities}
            onCountryClick={handleCountryClick}
            backendCountriesRef={backendCountriesRef}
            backendIds={backendIds}
            allCitiesRef={allCitiesRef}
            showStates={showStates}
            selectedCountry={selectedCountry}
            onStateClick={handleStateClick}
            backendStatesRef={backendStatesRef}
            backendStatesIds={backendStatesIds}
            onBackToCountries={handleBackToCountries}
            attachFavButton={attachFavButton}
          />
        </MapContainer>
      </div>
      {showEscHint && (
        <div className="esc-hint">Press ESC to return to world view</div>
      )}
    </div>
  );
}