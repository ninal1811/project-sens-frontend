import { MapContainer, TileLayer } from "react-leaflet";

export default function MapView() {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[37.8, -96]}
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
