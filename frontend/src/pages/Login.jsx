import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { validateLogin } from "../utils/validation";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const normalizedEmail = email.trim();
    const errors = validateLogin(normalizedEmail, password);
    if (Object.keys(errors).length > 0) {
      setMessage(Object.values(errors)[0]);
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post("/auth/login", {
        email: normalizedEmail.toLowerCase(),
        password
      });

      const token = response.data.token;
      if (typeof token !== "string" || !token) {
        setMessage("Login could not be verified. Please try again.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email: normalizedEmail.toLowerCase() }));

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      const data = error.response?.data;
      setMessage(
        (typeof data === "string" && data) ||
        data?.message ||
        (error.response ? "Invalid email or password." : "Cannot reach the server. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page dashboard-bg">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1>Sign in to AI TicketTriage</h1>
          <p>Enter your credentials to view your support tickets.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-field">
            <label className="field-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="field-input"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group-field">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <div className="password-input-group">
              <input
                id="login-password"
                className="field-input"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="password-toggle-btn"
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {message && (
            <div className="form-feedback error" role="alert" style={{ marginBottom: "16px" }}>
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "10px", marginTop: "4px" }}
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <div className="auth-footer-links">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;