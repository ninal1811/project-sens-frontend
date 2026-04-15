import React, {useState} from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Common.css"; 
import "./Login.css"; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  function validate() {
    if (!email.trim()) return "Email is required.";
    if (!email.includes('@')) return "Please enter a valid email.";
    if (!password) return "Password is required.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
 
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
 
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("email", email);
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title login-header">Welcome to Project Sens</h1>
      
      <p className="login-description">
        Sign in to explore culinary recommendations around the world
      </p>

      <div className="login-card"> 
        <form className="add-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              className={`form-input ${error && !email.trim() ? "input-error" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              className={`form-input ${error && !password ? "input-error" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>

          <p className="login-demo-text">
            Demo: foodie@example.com / password123
          </p>

          <p className="login-register-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;