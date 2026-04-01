import React from "react";
import "./Common.css"; // 👈 reuse your shared styles

function Login() {
  return (
    <div className="page-container">
      <h1 className="page-title">Login</h1>

      <div
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          padding: "20px",
          border: "1px solid #333",
          borderRadius: "8px",
          backgroundColor: "#1a1a1a",
        }}
      >
        <form className="add-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;