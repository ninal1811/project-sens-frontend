import React, {useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Common.css"; 
import "./Register.css"; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validate() {
    if (!email.trim()) return "Email is required.";
    if (!email.includes('@')) return "Please enter a valid email.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to login with success message
        navigate('/login', { 
          state: { 
            message: `Account created! Please sign in with ${email}` 
          }
        });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title register-header">Create Your Account</h1>
      
      <p className="register-description">
        Join Project Sens to discover culinary delights worldwide
      </p>

      <div className="register-card"> 
        <form className="add-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="register-error" role="alert">
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
              placeholder="Password (min 6 characters)"
              className={`form-input ${error && !password ? "input-error" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              className={`form-input ${error && password !== confirmPassword ? "input-error" : ""}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </div>

          <p className="register-login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;