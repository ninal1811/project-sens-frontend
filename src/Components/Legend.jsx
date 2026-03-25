export default function Legend({ showStates }) {
  return (
    <div style={{
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap",
      alignItems: "center",
      padding: "0.75rem 1rem",
      marginBottom: "0.5rem",
      background: "rgba(30, 30, 30, 0.9)",
      border: "1px solid #444",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "0.85rem",
    }}>
      <div style={{ fontWeight: 700 }}>Legend:</div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <div style={{ width: 14, height: 14, borderRadius: 2, background: "#1e90ff", opacity: 0.7 }} />
        <span>Country in database</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <div style={{ width: 14, height: 14, borderRadius: 2, background: "#999", opacity: 0.4 }} />
        <span>No data</span>
      </div>

      {showStates && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: 14, height: 14, borderRadius: 2, background: "#0d47a1" }} />
            <span>State in database</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff9900" }} />
            <span>City</span>
          </div>
        </>
      )}

      {/* Dietary Icons */}
      <div style={{ 
        borderLeft: "1px solid #555", 
        paddingLeft: "1rem", 
        marginLeft: "0.5rem",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap"
      }}>
        <span style={{ fontWeight: 600 }}>Dietary:</span>
        <span>🌱 Vegetarian</span>
        <span>🥩 Meat</span>
        <span>🐟 Seafood</span>
        <span>🥬 Vegan</span>
      </div>
    </div>
  );
}