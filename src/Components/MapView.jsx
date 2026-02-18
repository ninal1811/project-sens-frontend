import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import countriesData from "../data/countries.json";

export default function MapView() {
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
        <GeoJSON data={countriesData} />
      </MapContainer>
    </div>
  );
}