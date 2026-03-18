// import statements
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, CircleMarker, Popup } from "react-leaflet";
// contains boundary conditions to see outlines of countries and states
import countriesData from "../data/countries.json";
import statesData from "../data/states.json";
// city marker data: lat and long coordinates
import citiesCoords from "../data/cities.json";
import Legend from "./Legend";
import InfoPanel from "./InfoPanel";
import './MapView.css';
import { COUNTRY_IMAGE_URLS, STATE_IMAGE_URLS, CITY_IMAGE_URLS } from '../constants/imgUrls';

const BASE_URL = window.APP_CONFIG.API_URL || "https://projectsens.pythonanywhere.com";

// logs latitude and longitude data whenever you click on a new area on the map
function ClickDebug() {
  useMapEvents({
    click: (e) => {
      console.log("map clicked at", e.latlng);
    }
  });
  return null;
}

// receives list of cities, click handler, and state codes
function StatesLayer({ visibleCities, onStateClick, backendStatesRef, backendStatesIds}) {
  const map = useMap();

  const getStateCode = useCallback((feature) => {
    return feature?.properties?.state_code || null;
  }, []);

  // decides look of state, if state exists in backend data, it shows as blue to filter what's in our dataset
  // otherwise, it shows as gray
  const styleState = useCallback((feature) => {
    const stateCode = getStateCode(feature);
    const isInBackend = stateCode && backendStatesIds.has(stateCode);

    return {
      weight: 1,
      color: "#999",
      opacity: 0.8,
      fillOpacity: isInBackend ? 0.6 : 0.25,
      fillColor: isInBackend ? "#0d47a1" : "#000000",
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
        const html = `
          <div style="min-width: 250px">
            ${stateImg ? `
              <div style="text-align:center;margin-bottom:6px">
                <img src="${stateImg.image}" style="width:100%;border-radius:6px" />
                <div style="font-size:0.75rem;color:#666;margin-top:2px">${stateImg.food_name}</div>
              </div>` : ''}
            <div style="font-weight: 700; font-size: 1.1rem; text-transform: capitalize">
              ${backendMatch.name} (${backendMatch.state_code})
            </div>
          </div>
        `;
        layer.bindPopup(html).openPopup();
      }
    });

  }, [backendStatesRef, getStateCode, map, onStateClick, visibleCities]);

  return (
    <GeoJSON key="states-layer" data={statesData} style={styleState} onEachFeature={onEachState} bubblingMouseEvents={false}/>
  );

}

// map logic component
function MapController({ visibleCities, onCountryClick, backendCountriesRef, backendIds, showStates, selectedCountry, onStateClick, backendStatesRef, backendStatesIds }) {
  const map = useMap();

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

  const getIso3 = useCallback((feature) => {
    return feature?.properties?.["ISO3166-1-Alpha-3"] || null;
  }, []);
  
  // same logic as states for frontend look, those in backend are highlighted in blue
  const styleFeature = useCallback((feature) => {
    const iso3 = getIso3(feature);
    const isInBackend = iso3 && backendIds.has(iso3);

    return {
      weight: 1,
      color: "#444",
      fillOpacity: isInBackend ? 0.45 : 0.08,
      fillColor: isInBackend ? "#1e90ff" : "#999",
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

        const html = `
          <div style="min-width:260px">
            ${natImg ? `
              <div style="text-align:center;margin-bottom:6px">
                <img src="${natImg}" style="width:100%;border-radius:6px" />
                <div style="font-size:0.75rem;color:#666;margin-top:2px">National Dish: ${backendMatch.nat_dish}</div>
              </div>` : ''}
            ${(pop1Img || pop2Img) ? `
              <div style="display:flex;gap:6px;margin-bottom:8px">
                ${pop1Img ? `<div style="flex:1;text-align:center">
                  <img src="${pop1Img}" style="width:100%;border-radius:6px" />
                  <div style="font-size:0.75rem;color:#666;margin-top:2px">Popular Dish: ${backendMatch.pop_dish_1}</div>
                </div>` : ''}
                ${pop2Img ? `<div style="flex:1;text-align:center">
                  <img src="${pop2Img}" style="width:100%;border-radius:6px" />
                  <div style="font-size:0.75rem;color:#666;margin-top:2px">Popular Dish: ${backendMatch.pop_dish_2}</div>
                </div>` : ''}
              </div>` : ''}
            <div style="font-weight:700;text-transform:capitalize;margin-bottom:4px">${backendMatch.name}</div>
            <div><b>Capital:</b> ${backendMatch.capital.charAt(0).toUpperCase() + backendMatch.capital.slice(1)}</div>
          </div>
        `;
        layer.bindPopup(html).openPopup();
      }
    });
  }, [backendCountriesRef, getIso3, map, onCountryClick]);

  // when a country is clicked, it looks at the country code, finds the matching backend data, and shows a popup of the dish info and image
  return (
    <>
      <GeoJSON data={countriesData} style={styleFeature} onEachFeature={onEachFeature} />

      {showStates && selectedCountry && (
        <StatesLayer visibleCities={visibleCities} onStateClick={onStateClick} backendStatesRef={backendStatesRef} backendStatesIds={backendStatesIds} countryCode={selectedCountry._id}/>
      )}

      {visibleCities.map((city) => {
        const coords = citiesCoords[city.city];
        if (!coords) return null;

        const cityImg = CITY_IMAGE_URLS[city.city];

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
            <Popup>
              <div style={{ minWidth: "240px" }}>
                {cityImg && (
                  <div style={{ textAlign: "center", marginBottom: "6px" }}>
                    <img
                      src={cityImg.image}
                      alt={cityImg.restaurant_name}
                      style={{ width: "100%", borderRadius: "6px" }}
                    />
                    <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "2px" }}>
                      Popular Restaurant: {cityImg.restaurant_name}
                    </div>
                  </div>
                )}
                <div style={{ fontWeight: 700 }}>{city.city}</div>
                {city.state && <div><b>State:</b> {city.state}</div>}
                {city.rec_restaurant && <div><b>Recommended Restaurant:</b> {city.rec_restaurant}</div>}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
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

  useEffect(() => {
    axios.get(`${BASE_URL}/countries`)
      .then(({ data }) => {
        const countries = data?.countries || {};
        setBackendCountries(countries);
        backendCountriesRef.current = countries;
      })
      .catch((err) => console.error("Error fetching countries:", err));

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

  const WORLD_BOUNDS = [
    [-90, -180],
    [90, 180],
  ];

  return (
    <div className="mapview-root">
      <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search countries, states, or cities..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="search-clear-btn"
              >
                Clear
              </button>
            )}
          </div>
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelectState(result)}
                  className="search-result-item"
                >
                  <div className="search-result-name">{result.name}</div>
                  <div className="search-result-type">
                    {result.type === "country" && "Country"}
                    {result.type === "state" && `${result.countryName} (State)`}
                    {result.type === "city" && "City"}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
            <div className="search-no-results">
              No states found matching "{searchQuery}"
            </div>
          )}
        </div>

      <div className="info-panel-container">
        <InfoPanel
          selectedCountry={selectedCountry}
          selectedState={selectedState}
          showStates={showStates}
          onBackToCountries={handleBackToCountries}
        />
      </div>
      
      <Legend showStates={showStates} />
      <div className="map-wrapper">
        <MapContainer
          ref={mapRef}
          center={[20, 0]}
          zoom={2}
          maxBounds={WORLD_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap={true}
            bounds={WORLD_BOUNDS}
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
          />
        </MapContainer>
      </div>
    </div>
  );
}