import './Legend.css';

export default function Legend({ showStates }) {
  return (
    <div className="legend-container">
      <span className="legend-title">Legend</span>
      <div className="legend-divider" />

      <div className="legend-item">
        <div className="legend-box legend-box-country"/>
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
            <span>City in database</span>
          </div>
        </>
      )}

      <div className="legend-divider" />

      {/* Dietary Icons */}
      <div className="legend-item">
        <span className="legend-title">Dietary</span>
        <span>🌱 Veg</span>
        <span>🥩 Meat</span>
        <span>🐟 Seafood</span>
        <span>🥬 Vegan</span>
      </div>
    </div>
  );
}