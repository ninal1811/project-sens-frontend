import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import axios from 'axios'

function CityCard({ cityData }) {
    const [open, setOpen] = useState(false);
    const { city, state_code, country_code, rec_restaurant } = cityData || {};

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
                {city ?? "Unnamed city"} {state_code ? `(${state_code})` : ""}{" "}
                {open ? "▾" : "▸"}
            </button>

            {open && (
                <div style={{ padding: "0.75rem 1rem" }}>
                    <p>
                        <strong>city:</strong> {city ?? "—"}
                    </p>
                    <p>
                        <strong>state_code:</strong> {state_code ?? "—"}
                    </p>
                    <p>
                        <strong>country_code:</strong> {country_code ?? "—"}
                    </p>
                    <p>
                        <strong>rec_restaurant:</strong> {rec_restaurant ?? "—"}
                    </p>
                </div>
            )}
        </li>
    );
}

export default function Cities() {
    const [results, setResults] = useState(null);
    const baseURL = import.meta.env.REACT_APP_API_URL || 'https://projectsens.pythonanywhere.com';
    const cityReadEP = 'cities/read';

    useEffect(() => {
        axios
            .get(`${baseURL}/${cityReadEP}`)
            .then(({ data }) => {
                const raw = data?.Cities ?? data?.cities ?? {};
                const list = Array.isArray(raw) ? raw : Object.values(raw);
                setResults(list);
            })
            .catch((err) => {
                console.error("Failed to fetch cities:", err);
                setResults([]);
            });
    }, []);

    return (
        <div style={{ padding: "20px" }}>
        <div style={{ 
            marginBottom: "16px",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-start"
         }}>
            <Link to="/" className="nav-btn">← Back to Home</Link>
            <Link to="/States" className="nav-btn">View States</Link>
            <Link to="/Countries" className="nav-btn">View Countries</Link>
        </div>
            <h1>city data</h1>
            {results === null && <p>Loading...</p>}

            {results && results.length === 0 && <p>No cities found.</p>}

            {results && results.length > 0 && (
                <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                    {results.map((cityObj, idx) => (
                        <CityCard
                            cityData={cityObj}
                            key={`${cityObj?.city ?? "no-city"}-${idx}`}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}