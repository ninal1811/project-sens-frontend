import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import axios from 'axios'

function CountryCard({ countryData }) {
  const [open, setOpen] = useState(false);
  const { _id, name, capital, nat_dish, pop_dish_1, pop_dish_2 } = countryData || {};

  return (
    <li style={{ marginBottom: "1rem" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "0.75rem 1rem",
          cursor: "pointer",
        }}
      >
        {name ?? "Unnamed country"} {_id ? `(${_id})` : ""}{" "}
        {open ? "▾" : "▸"}
      </button>

      {open && (
        <div style={{ padding: "0.75rem 1rem" }}>
          <p><strong>Code:</strong> {_id ?? "—"}</p>
          <p><strong>Name:</strong> {name ?? "—"}</p>
          <p><strong>Capital:</strong> {capital ?? "—"}</p>
          <p><strong>National Dish:</strong> {nat_dish ?? "—"}</p>
          <p><strong>Popular Dish 1:</strong> {pop_dish_1 ?? "—"}</p>
          <p><strong>Popular Dish 2:</strong> {pop_dish_2 ?? "—"}</p>
        </div>
      )}
    </li>
  );
}

export default function Countries() {
  const [results, setResults] = useState(null);
  const baseURL = import.meta.env.REACT_APP_API_URL || 'https://projectsens.pythonanywhere.com';

  useEffect(() => {
    axios
      .get(`${baseURL}/countries`)
      .then(({ data }) => {
        const raw = data?.countries ?? {};
        const list = Array.isArray(raw) ? raw : Object.values(raw);
        setResults(list);
      })
      .catch((err) => {
        console.error("Failed to fetch countries:", err);
        setResults([]);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
    <div style={{ marginBottom: "16px", textAlign: "left" }}>
      <Link to="/" className="nav-btn">← Back to Home</Link>
    </div>
      <h1>country data</h1>
      {results === null && <p>Loading...</p>}
      {results && results.length === 0 && <p>No countries found.</p>}
      {results && results.length > 0 && (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {results.map((countryObj, idx) => (
            <CountryCard
              countryData={countryObj}
              key={`${countryObj?._id ?? "no-code"}-${idx}`}
            />
          ))}
        </ul>
      )}
    </div>
  );
}