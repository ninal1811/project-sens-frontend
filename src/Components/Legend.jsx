import './Legend.css';

export default function Legend({ showStates }) {
  return (
    <div className="legend-container">
      <span className="legend-title">Legend</span>
      <div className="legend-divider" />

      <div className="legend-item">
        <div className="legend-box" style={{ backgroundColor: '#166534' }} />
        <span>Country in database</span>
      </div>
      <div className="legend-item">
        <div className="legend-box" style={{ backgroundColor: '#a3c585' }} />
        <span>No data</span>
      </div>

      {showStates && (
        <>
          <div className="legend-item">
            <div className="legend-box" style={{ backgroundColor: '#15803d' }} />
            <span>State in database</span>
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