import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, CircleMarker, Popup } from "react-leaflet";
import countriesData from "../data/countries.json";
import citiesCoords from "../data/cities.json";

const BASE_URL = "https://projectsens.pythonanywhere.com";

function ClickDebug() {
  useMapEvents({
    click: (e) => {
      console.log("map clicked at", e.latlng);
    }
  });
  return null;
}

function MapController({ visibleCities, onCountryClick, backendCountriesRef, backendIds, allCitiesRef }) {
  const map = useMap();

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
  }, [backendIds, getIso3]);

  const onEachFeature = useCallback((feature, layer) => {
    layer.on("click", () => {
      const iso3 = getIso3(feature);
      if (!iso3) return;

      const backendMatch = backendCountriesRef.current[iso3];
      if (backendMatch) {
        onCountryClick(backendMatch, iso3);
        map.fitBounds(layer.getBounds(), { padding: [40, 40] });
        const html = `
          <div style="min-width:220px">
            <div style="font-weight:700;margin-bottom:4px">${backendMatch.name} (${backendMatch._id})</div>
            <div><b>capital:</b> ${backendMatch.capital}</div>
            <div><b>nat_dish:</b> ${backendMatch.nat_dish}</div>
            <div><b>pop_dish_1:</b> ${backendMatch.pop_dish_1}</div>
            <div><b>pop_dish_2:</b> ${backendMatch.pop_dish_2}</div>
          </div>
        `;
        layer.bindPopup(html).openPopup();
      }
    });
  }, [backendCountriesRef, getIso3, map, onCountryClick]);

  return (
    <>
      <GeoJSON data={countriesData} style={styleFeature} onEachFeature={onEachFeature} />
      {visibleCities.map((city) => {
        const coords = citiesCoords[city.city];
        if (!coords) return null;
        return (
          <CircleMarker
            key={city.city}
            center={[coords.lat, coords.lng]}
            radius={8}
            pathOptions={{ color: "#ff6600", fillColor: "#ff6600", fillOpacity: 1 }}
          >
            <Popup>
              <div>
                <div style={{ fontWeight: 700 }}>{city.city}</div>
                {city.rec_restaurant && <div><b>rec restaurant:</b> {city.rec_restaurant}</div>}
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

  useEffect(() => {
    axios.get(`${BASE_URL}/countries`)
      .then(({ data }) => {
        const countries = data?.countries || {};
        setBackendCountries(countries);
        backendCountriesRef.current = countries;
      })
      .catch((err) => console.error("Error fetching countries:", err));

    axios.get(`${BASE_URL}/cities/read`)
      .then(({ data }) => { allCitiesRef.current = data?.Cities || {}; })
      .catch((err) => console.error("Error fetching cities:", err));
  }, []);

  const backendIds = useMemo(() => new Set(Object.keys(backendCountries)), [backendCountries]);

  const handleCountryClick = useCallback((country, iso3) => {
    setSelectedCountry(country);
    const cities = Object.values(allCitiesRef.current).filter(c => c.country_code === iso3);
    console.log("clicked:", iso3, "cities:", cities);
    setVisibleCities(cities);
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", border: "1px solid #ccc", borderRadius: "8px", textAlign: "left" }}>
        {selectedCountry ? (
          <>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{selectedCountry.name} ({selectedCountry._id})</div>
            <div><strong>capital:</strong> {selectedCountry.capital}</div>
            <div><strong>nat_dish:</strong> {selectedCountry.nat_dish}</div>
            <div><strong>pop_dish_1:</strong> {selectedCountry.pop_dish_1}</div>
            <div><strong>pop_dish_2:</strong> {selectedCountry.pop_dish_2}</div>
          </>
        ) : (
          <div style={{ color: "#666" }}>Click a <span style={{ color: "#1e90ff", fontWeight: 700 }}>blue</span> country to see details.</div>
        )}
      </div>

      <div style={{ height: "500px", width: "100%" }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickDebug />
          <MapController
            visibleCities={visibleCities}
            onCountryClick={handleCountryClick}
            backendCountriesRef={backendCountriesRef}
            backendIds={backendIds}
            allCitiesRef={allCitiesRef}
          />
        </MapContainer>
      </div>
    </div>
  );
}