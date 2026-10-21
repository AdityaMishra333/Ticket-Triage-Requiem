import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { isValidEmail, isValidName } from "../utils/validation";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    if (!isValidName(name)) {
      setMessage("Name is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setMessage("Enter a valid email address.");
      return;
    }
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/create", {
        name,
        email: email.toLowerCase(),
        password: formData.password
      });

      navigate("/login", {
        state: {
          email: email.toLowerCase(),
          message: "Account created! You can now sign in."
        }
      });
    } catch (error) {
      console.error(error);
      const data = error.response?.data;
      const errMessage = (typeof data === "string" && data) || data?.message;
      if (error.response?.status === 409) {
        setMessage("This email is already registered. Please log in.");
        navigate("/login", {
          state: {
            email,
            message: "This email is already registered. Please log in."
          }
        });
      } else {
        setMessage(errMessage || (error.response ? "Registration failed. Please try again." : "Cannot reach the server. Please try again."));
      }
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
          <h1>Create an account</h1>
          <p>Get started with SupportDesk to report and track issues.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-field">
            <label className="field-label" htmlFor="reg-name">
              Name
            </label>
            <input
              id="reg-name"
              className="field-input"
              type="text"
              name="name"
              autoComplete="name"
              required
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group-field">
            <label className="field-label" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              className="field-input"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group-field">
            <label className="field-label" htmlFor="reg-password">
              Password
            </label>
            <div className="password-input-group">
              <input
                id="reg-password"
                className="field-input"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                minLength={6}
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-group-field">
            <label className="field-label" htmlFor="reg-confirm">
              Confirm Password
            </label>
            <div className="password-input-group">
              <input
                id="reg-confirm"
                className="field-input"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                className="password-toggle-btn"
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
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
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <div className="auth-footer-links">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;