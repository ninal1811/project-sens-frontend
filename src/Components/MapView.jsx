import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import countriesData from "../data/countries.json";

const BASE_URL = "https://projectsens.pythonanywhere.com";

export default function MapView() {

  const [backendCountries, setBackendCountries] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);

  // retrieve backend countries data
  useEffect(() => {
    axios
      .get(`${BASE_URL}/countries`)
      .then(({ data }) => {
        setBackendCountries(data?.countries || {});
      })
      .catch((err) => {
        console.error("Error fetching backend countries:", err);
        setBackendCountries({});
      });
  }, []);

  // set IDs
  const backendIds = useMemo(
    () => new Set(Object.keys(backendCountries)),
    [backendCountries]
  );

  // extract ISO3 code from GeoJSON
  const getIso3 = useCallback((feature) => {
    const p = feature?.properties || {};
    return (
      p["ISO3166-1-Alpha-3"] ||
      null
    );
  }, []);

  const styleFeature = useCallback(
    (feature) => {
      const iso3 = getIso3(feature);
      const isInBackend = iso3 && backendIds.has(iso3);
  
      return {
        weight: 1,
        color: "#444",
        fillOpacity: isInBackend ? 0.45 : 0.08,
        fillColor: isInBackend ? "#1e90ff" : "#999",
      };
    },
    [backendIds, getIso3]
  );

  // show country info if clicked 
  const onEachFeature = useCallback(
    (feature, layer) => {
      layer.on("click", () => {
        const iso3 = getIso3(feature);
        if (!iso3) return;
  
        const backendMatch = backendCountries[iso3];
  
        if (backendMatch) {
          setSelectedCountry(backendMatch);
  
          const html = `
            <div style="min-width:220px">
              <div style="font-weight:700;margin-bottom:4px">
                ${backendMatch.name} (${backendMatch._id})
              </div>
              <div><b>capital:</b> ${backendMatch.capital}</div>
              <div><b>nat_dish:</b> ${backendMatch.nat_dish}</div>
              <div><b>pop_dish_1:</b> ${backendMatch.pop_dish_1}</div>
              <div><b>pop_dish_2:</b> ${backendMatch.pop_dish_2}</div>
            </div>
          `;
  
          layer.bindPopup(html).openPopup();
        } else {
          setSelectedCountry(null);
          layer.closePopup();
        }
      });
    },
    [backendCountries, getIso3]
  );

  return (

    

    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={countriesData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />

      </MapContainer>
    </div>

  );
}