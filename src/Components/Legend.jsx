import './Legend.css';

export default function Legend({ showStates }) {
  return (
    <div className="legend-container">
      <div className="legend-title">Legend:</div>

      <div className="legend-item">
        <div className="legend-box legend-box-country" />
        <span>Country in database</span>
      </div>

      <div className="legend-item">
        <div className="legend-box legend-box-no-data" />
        <span>No data</span>
      </div>

      {showStates && (
        <>
          <div className="legend-item">
            <div className="legend-box legend-box-state" />
            <span>State in database</span>
          </div>

          <div className="legend-item">
            <div className="legend-box legend-box-city" />
            <span>City</span>
          </div>
        </>
      )}

      {/* Dietary Icons */}
      <div className="dietary-icons-section">
        <span className="dietary-label">Dietary:</span>
        <span>🌱 Vegetarian</span>
        <span>🥩 Meat</span>
        <span>🐟 Seafood</span>
        <span>🥬 Vegan</span>
      </div>
    </div>
  );
}