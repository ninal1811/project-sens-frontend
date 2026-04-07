import { STATE_IMAGE_URLS } from '../constants/imgUrls';
export default function InfoPanel({ selectedCountry, selectedState, showStates, onBackToCountries, onBackToCountry }) {
  if (!selectedCountry) {
    return (
      <div className="info-empty">
        <div className="info-empty-text">
          Click a <span className="info-empty-highlight">highlighted</span> country to explore its food culture
        </div>
      </div>
    );
  }
  const stateImg = selectedState ? STATE_IMAGE_URLS[selectedState.state_code] : null;
  return (
    <>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
        {showStates && (
          <button 
            onClick={onBackToCountries}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1e90ff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            ← Back to World
          </button>
        )}
        {selectedState && onBackToCountry && (
          <button 
            onClick={onBackToCountry}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            ← Back to {selectedCountry.name}
          </button>
        )}
      </div>
      {selectedState ? (
        <>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, textTransform: "capitalize" }}>{selectedState.name} ({selectedState.state_code})</div>
          <div><strong>Country:</strong> <span style={{ textTransform: "capitalize" }}>{selectedCountry.name}</span></div>
          {stateImg && <div><strong>Popular Dish:</strong> {stateImg.food_name}</div>}
        </>
      ) : (
        <>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, textTransform: "capitalize" }}>{selectedCountry.name}</div>
          <div><strong>Capital:</strong> {selectedCountry.capital.charAt(0).toUpperCase() + selectedCountry.capital.slice(1)}</div>
          <div><strong>National Dish:</strong> {selectedCountry.nat_dish}</div>
          <div><strong>Popular Dish 1:</strong> {selectedCountry.pop_dish_1}</div>
          <div><strong>Popular Dish 2:</strong> {selectedCountry.pop_dish_2}</div>
        </>
      )}
    </>
  );
}