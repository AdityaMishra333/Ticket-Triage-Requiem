import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { isValidEmail, isValidName } from "../utils/validation";

// Sign-up page for USERS only. It creates a normal user account
// (POST /auth/create); there is no admin registration here, because the
// admin role has to be set on the backend.
function Register() {
  const navigate = useNavigate();

  // Name, email and password are sent to the backend; confirmPassword is checked only in the browser
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

  // Updates the field that matches the input's name attribute (name / email / password)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Client-side validation; the first failing rule is shown and the request is not sent
    const name = formData.name.trim();
    const email = formData.email.trim();
    if (!isValidName(name)) {
      setMessage("Provide a valid UserName.");
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

      // Success: go to Login with the email prefilled and a success message
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
      // 409 = email already registered, so send the user to Login instead
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
          <h1>Create an account</h1>
          <p>Get started with Los Polos Hermanos to report and track issues.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
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

          {/* Email */}
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

          {/* Password (with show / hide button) */}
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
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm password (must match; checked in handleSubmit) */}
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
                {showConfirmPassword ? "Hide" : "Show"}
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

          {/* Link back to the Login page */}
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