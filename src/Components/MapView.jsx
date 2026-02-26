import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, CircleMarker, Popup } from "react-leaflet";
import countriesData from "../data/countries.json";
import statesData from "../data/states.json";
import citiesCoords from "../data/cities.json";
import { COUNTRY_IMAGE_URLS } from '../constants/imgUrls';
import { data } from "react-router";
import Legend from "./Legend";

const BASE_URL = "https://projectsens.pythonanywhere.com";


function ClickDebug() {
  useMapEvents({
    click: (e) => {
      console.log("map clicked at", e.latlng);
    }
  });
  return null;
}

function StatesLayer({ visibleCities, onStateClick, backendStatesRef, backendStatesIds, countryCode }) {
  const map = useMap();

  const getStateCode = useCallback((feature) => {
    return feature?.properties?.state_code || null;
  }, []);

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

        const stateCities = visibleCities.filter(city => city.state_code === stateCode);
        const html = `
          <div style="min-width: 250px">
            <div style="font-weight: 700; margin-bottom: 8px; font-size: 1.1rem">
              ${backendMatch.name} (${backendMatch.state_code})
            </div>
            <div><b>capital:</b> ${backendMatch.capital || 'N/A'} </div>
            <div style="margin-top: 8px">
              <b>cities (${stateCities.length}): </b>
              <ul style="margin: 4px 0 0 16px; padding: 0">
                ${stateCities.slice(0,5).map(city => `<li>${city.name}</li>`).join('')}
                ${stateCities.length > 5 ? `<li>... and ${stateCities.length - 5} more</li>` : ''}
              </ul>
            </div>
        `;
        layer.bindPopup(html).openPopup();
      }
    });

  }, [backendStatesRef, getStateCode, map, onStateClick, visibleCities]);

  return (
    <GeoJSON key="states-layer" data={statesData} style={styleState} onEachFeature={onEachState}/>
  );

}

function MapController({ visibleCities, onCountryClick, backendCountriesRef, backendIds, allCitiesRef, showStates, selectedCountry, visibleStates, onStateClick, backendStatesRef, backendStatesIds }) {
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

  const styleFeature = useCallback((feature) => {
    const iso3 = getIso3(feature);
    const isInBackend = iso3 && backendIds.has(iso3);

    return {
      weight: 1,
      color: "#444",
      fillOpacity: isInBackend ? 0.45 : 0.08,
      fillColor: isInBackend ? "#1e90ff" : "#999",
    };
  }, [backendIds, getIso3, showStates, selectedCountry]);

  const onEachFeature = useCallback((feature, layer) => {
    layer.on("click", () => {
      const iso3 = getIso3(feature);
      if (!iso3) return;

      const backendMatch = backendCountriesRef.current[iso3];
      if (backendMatch) {
        onCountryClick(backendMatch, iso3);
        map.fitBounds(layer.getBounds(), { padding: [40, 40] });
        const imageUrl = backendMatch.image_url || COUNTRY_IMAGE_URLS[backendMatch._id] || '';

        const html = `
          <div style="min-width:220px">
            ${imageUrl ? `<img src="${imageUrl}" style="width:100%;border-radius:4px;margin-bottom:8px" />` : ''}
            <div style="font-weight:700;margin-bottom:4px;text-transform:capitalize">${backendMatch.name}</div>
            <div><b>Capital:</b> ${backendMatch.capital.charAt(0).toUpperCase() + backendMatch.capital.slice(1)}</div>
            <div><b>National Dish:</b> ${backendMatch.nat_dish}</div>
            <div><b>Popular Dish 1:</b> ${backendMatch.pop_dish_1}</div>
            <div><b>Popular Dish 2:</b> ${backendMatch.pop_dish_2}</div>
          </div>
        `;
        layer.bindPopup(html).openPopup();
      }
    });
  }, [backendCountriesRef, getIso3, map, onCountryClick]);

  return (
    <>
      <GeoJSON data={countriesData} style={styleFeature} onEachFeature={onEachFeature} />

      {showStates && selectedCountry && (
        <StatesLayer visibleCities={visibleCities} onStateClick={onStateClick} backendStatesRef={backendStatesRef} backendStatesIds={backendStatesIds} countryCode={selectedCountry._id}/>
      )}

      {visibleCities.map((city) => {
        const coords = citiesCoords[city.city];
        if (!coords) return null;

        return (
          <CircleMarker
            key={city.city}
            center={[coords.lat, coords.lng]}
            radius={showStates ? 6 : 8}
            pathOptions={{ 
              color: showStates ? "#ff9900" : "#ff6600", 
              fillColor: showStates ? "#ff9900" : "#ff6600", 
              fillOpacity: 1 
            }}
          >
            <Popup>
              <div>
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
  const [visibleStates, setVisibleStates] = useState([]);
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
        const states = data?.states || {};
        setBackendStates(states);
        backendStatesRef.current = states;
      })
      .catch((err) => console.error("Error fetching states: ", err));

    axios.get(`${BASE_URL}/cities/read`)
      .then(({ data }) => { allCitiesRef.current = data?.Cities || {}; })
      .catch((err) => console.error("Error fetching cities:", err));
  }, []);

  const backendIds = useMemo(() => new Set(Object.keys(backendCountries)), [backendCountries]);
  const backendStatesIds = useMemo(() => new Set(Object.keys(backendStates)), [backendStates]);

  const handleCountryClick = useCallback((country, iso3) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setShowStates(true);
    const cities = Object.values(allCitiesRef.current).filter(c => c.country_code === iso3);
    console.log("clicked:", iso3, "cities:", cities);
    setVisibleCities(cities);
  }, []);

  const handleStateClick = useCallback((state, stateCode) => {
    setSelectedState(state);

    const cities = Object.values(allCitiesRef.current).filter(c => c.state_code === stateCode);
    console.log("clicked state: ", stateCode, "cities: ", cities.length);
    setVisibleCities(cities);
    setSearchQuery("");
    setShowSearchResults(false);
  }, []);

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

    setSearchResults(results.slice(0, 10));
    setShowSearchResults(true);
  }, []);

  const handleSelectState = useCallback((result) => {
    setSearchQuery(result.name);
    setShowSearchResults(false);
    
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
  }, [selectedCountry, handleStateClick]);

  const WORLD_BOUNDS = [
    [-90, -180],
    [90, 180],
  ];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ 
          marginBottom: "1rem", 
          padding: "0.75rem 1rem", 
          border: "1px solid #ccc", 
          borderRadius: "8px",
          position: "relative"
        }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search for states/provinces..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: "16px"
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                style={{
                  padding: "8px 12px",
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Clear
              </button>
            )}
          </div>
          
          {showSearchResults && searchResults.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: "1rem",
              right: "1rem",
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              maxHeight: "300px",
              overflowY: "auto",
              zIndex: 1000,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelectState(result)}
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                >
                  <div style={{ fontWeight: 600 }}>{result.name}</div>
                  <div style={{ fontSize: "0.9em", color: "#666" }}>
                    {result.countryName} {result.id && `(${result.id})`}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: "1rem",
              right: "1rem",
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "12px",
              textAlign: "center",
              color: "#666",
              zIndex: 1000
            }}>
              No states found matching "{searchQuery}"
            </div>
          )}
        </div>

      <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", border: "1px solid #ccc", borderRadius: "8px", textAlign: "left" }}>
        {selectedCountry ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {showStates && (
                <button onClick={handleBackToCountries}>← Back to World</button>
              )}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, textTransform: "capitalize" }}>{selectedCountry.name}</div>
            <div><strong>Capital:</strong> {selectedCountry.capital.charAt(0).toUpperCase() + selectedCountry.capital.slice(1)}</div>
            <div><strong>National Dish:</strong> {selectedCountry.nat_dish}</div>
            <div><strong>Popular Dish 1:</strong> {selectedCountry.pop_dish_1}</div>
            <div><strong>Popular Dish 2:</strong> {selectedCountry.pop_dish_2}</div>
          </>
        ) : (
          <div style={{ color: "#666" }}>Click a <span style={{ color: "#1e90ff", fontWeight: 700 }}>blue</span> country to see details.</div>
        )}
      </div>
      
      <Legend showStates={showStates} />
      <div style={{ height: "70vh", width: "100%" }}>
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