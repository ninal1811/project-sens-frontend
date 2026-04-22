import './DietaryFilter.css';

const FILTERS = [
  { tag: "vegan",      label: "Vegan",      icon: "🥬" },
  { tag: "vegetarian", label: "Vegetarian", icon: "🌱" },
  { tag: "meat",       label: "Meat",       icon: "🥩" },
  { tag: "seafood",    label: "Seafood",    icon: "🐟" },
];

export default function DietaryFilterBar({ active, onToggle }) {
  return (
    <div className="dietary-filter-bar">
      {FILTERS.map(({ tag, label, icon }) => {
        const isActive = active.has(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            title={label}
            className={`dietary-filter-btn ${isActive ? "active" : ""}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
      {active.size > 0 && (
        <button
          className="dietary-filter-clear"
          onClick={() => FILTERS.forEach(f => active.has(f.tag) && onToggle(f.tag))}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}