import { useState , useEffect } from 'react'
import axios from 'axios'

function StateCard( {stateData} ) {
    // console.log(stateData);
    const [open, setOpen] = useState(false);
    const { country_code, state_code, name } = stateData || {};

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
        {name ?? "Unnamed state"} {state_code ? `(${state_code})` : ""}{" "}
        {open ? "▾" : "▸"}
      </button>

      {open && (
        <div style={{ padding: "0.75rem 1rem" }}>
          <p>
            <strong>country_code:</strong> {country_code ?? "—"}
          </p>
          <p>
            <strong>state_code:</strong> {state_code ?? "—"}
          </p>
          <p>
            <strong>name:</strong> {name ?? "—"}
          </p>
        </div>
      )}
    </li>
  );
}

export default function States() {
    const [results, setResults] = useState(null);
    // console.log(results);
    const baseURL = 'https://projectsens.pythonanywhere.com';
    const stateReadEP = 'states/read';

    useEffect(() => {
        axios
        .get(`${baseURL}/${stateReadEP}`).then(({data}) => {
            const raw = data?.states ?? data?.States ?? [];
            const list = Array.isArray(raw) ? raw : Object.values(raw);
            setResults(list);
        })
        .catch((err) => {
            console.error("Failed to fetch states:", err);
            setResults([]);
          });
      }, []);

    return (
        <div>
            <h1>state data</h1>
            {results === null && <p>Loading...</p>}

            {results && results.length === 0 && <p>No states found.</p>}

            {results && results.length > 0 && (
                <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                {results.map((stateObj, idx) => (
                    <StateCard
                    stateData={stateObj}
                    key={`${stateObj?.state_code ?? "no-code"}-${idx}`}
                    />
                ))}
            </ul>
            )}
        </div>
    );
}

// export default States
