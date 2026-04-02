import React, {useState} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Common.css"; 
import "./Login.css"; 

const DEMO_USER = { username: "foodie", password: "password123" };

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();
  const location                = useLocation();

  // After user logins, revert them to what they were looking at
  const from = location.state?.from || "/";

  function validate() {
    if (!username.trim()) return "Username is required.";
    if (!password)        return "Password is required.";
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
 
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
 
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (username === DEMO_USER.username && password === DEMO_USER.password) {
        // Store a simple session flag
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("username", username);
        navigate(from, { replace: true });
      } else {
        setError(`Invalid credentials. Try: ${DEMO_USER.username} / ${DEMO_USER.password}`);
      }
    }, 800);
  }

  return (
    <div className="page-container">
      <h1 className="page-title login-header">Login</h1>

      <div className="login-card"> 
        <form className="add-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              className={`form-input ${error && !username.trim() ? "input-error" : ""}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
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
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;