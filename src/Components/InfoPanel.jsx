export default function InfoPanel({ selectedCountry, showStates, onBackToCountries}) {
  if (!selectedCountry) {
    return (
      <div style={{ color: "#666" }}>
        Click a <span style={{ color: "#1e90ff", fontWeight: 700 }}>blue</span> country to see details.
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {showStates && (
          <button onClick={onBackToCountries}>← Back to World</button>
        )}
      </div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, textTransform: "capitalize" }}>{selectedCountry.name}</div>
      <div><strong>Capital:</strong> {selectedCountry.capital.charAt(0).toUpperCase() + selectedCountry.capital.slice(1)}</div>
      <div><strong>National Dish:</strong> {selectedCountry.nat_dish}</div>
      <div><strong>Popular Dish 1:</strong> {selectedCountry.pop_dish_1}</div>
      <div><strong>Popular Dish 2:</strong> {selectedCountry.pop_dish_2}</div>
    </>
  );
}