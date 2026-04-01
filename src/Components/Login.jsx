import React from "react";
import "./Common.css"; 
import "./Login.css"; 

function Login() {
  return (
    <div className="page-container">
      <h1 className="page-title login-header">Login</h1>

      <div className="login-card"> 
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