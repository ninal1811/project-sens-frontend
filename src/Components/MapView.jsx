import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, CircleMarker, Popup } from "react-leaflet";
import countriesData from "../data/countries.json";
import statesData from "../data/states.json";
import citiesCoords from "../data/cities.json";
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
        const imageUrl = backendMatch.image_url || (backendMatch._id === 'MAR' ? 'https://koshercowboy.com/wp-content/uploads/2017/10/couscous-Photo-source-sahara-experience.jpg' : '');

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
  }, [selectedCountry]);

  const WORLD_BOUNDS = [
    [-90, -180],
    [90, 180],
  ];

  return (
    <div style={{ width: "100%" }}>
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