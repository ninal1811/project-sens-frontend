import './Legend.css';

export default function Legend({ showStates }) {
  return (
    <div className="legend-container">
      <span className="legend-title">Legend</span>
      <div className="legend-divider" />

      <div className="legend-item">
        <div className="legend-box legend-box-country" />
        <span>Country</span>
      </div>
      <div className="legend-item">
        <div className="legend-box legend-box-no-data" />
        <span>No data</span>
      </div>

      {showStates && (
        <>
          <div className="legend-item">
            <div className="legend-box legend-box-state" />
            <span>State</span>
          </div>

          <div className="legend-item">
            <div className="legend-box legend-box-city" />
            <span>City</span>
          </div>
        </>
      )}

      <div className="legend-divider" />

      {/* Dietary Icons */}
      <div className="legend-dietary">
        <span className="dietary-label">Dietary</span>
        <span className="dietary-item">🌱 Veg</span>
        <span className="dietary-item">🥩 Meat</span>
        <span className="dietary-item">🐟 Seafood</span>
        <span className="dietary-item">🥬 Vegan</span>
      </div>
    </div>
  );
}