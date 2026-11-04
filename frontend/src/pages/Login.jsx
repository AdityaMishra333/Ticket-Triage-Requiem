import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { LIMITS, loginValidators } from "../utils/validation";
import { useFieldErrors } from "../utils/useFieldErrors";
import FieldError from "../components/FieldError";
import AuthLayout from "../components/AuthLayout";
import { getTokenPayload, isAdminToken } from "../utils/auth";

// Shared login page for BOTH users and admins.
// The User / Admin toggle only changes the look and adds an admin-only check;
// both modes call the same backend endpoint (POST /auth/login).
function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Register redirects here with a prefilled email and a "Account created" message
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState(location.state?.message || "");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // false = User login (default), true = Admin login
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { errors, recheckField, checkAll, clearErrors, fieldProps } = useFieldErrors(loginValidators);
  const values = { email, password };

  // Called by the User / Admin toggle buttons; also clears any old error message
  const switchLoginMode = (adminMode) => {
    setIsAdminMode(adminMode);
    setMessage("");
    setNotice("");
    clearErrors();
  };

  // Runs for both user and admin sign in
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setNotice("");

    // Client-side validation before calling the backend
    if (!checkAll(values)) return;
    const normalizedEmail = email.trim();

    try {
      setSubmitting(true);
      const response = await api.post(isAdminMode ? "/admin/login" :"/auth/login", {
        email: normalizedEmail.toLowerCase(),
        password
      });

      const token = response.data.token;
      if (typeof token !== "string" || !token) {
        setMessage("Login could not be verified. Please try again.");
        return;
      }

      const role = getTokenPayload(token)?.role;
      // ADMIN ONLY: in Admin mode, reject accounts whose token role is not admin
      if (isAdminMode && !isAdminToken(token)) {
        setMessage("This account doesn't have administrator access.");
        return;
      }

      // Save the session (used later by AuthValidator and the API calls)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email: normalizedEmail.toLowerCase(), role }));

      // Admin token -> admin dashboard, everyone else -> user dashboard
      navigate(isAdminToken(token) ? "/admin" : "/dashboard");
    } catch (error) {
      // Show the backend's message if there is one, otherwise a generic error
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
    <AuthLayout className={isAdminMode ? "admin-login-mode" : ""}>
      <div className="auth-card">
        {/* User / Admin toggle. The sliding pill is pure CSS (see .login-mode-toggle in index.css) */}
        <div className="login-mode-toggle" role="group" aria-label="Choose login type">
          {/* USER mode button */}
          <button
            type="button"
            className={!isAdminMode ? "active" : ""}
            aria-pressed={!isAdminMode}
            onClick={() => switchLoginMode(false)}
          >
            User
          </button>
          {/* ADMIN mode button */}
          <button
            type="button"
            className={isAdminMode ? "active" : ""}
            aria-pressed={isAdminMode}
            onClick={() => switchLoginMode(true)}
          >
            Admin
          </button>
        </div>
        {/* Header: icon, title and subtitle change depending on the mode */}
        <div className="auth-header">
          <h1>{isAdminMode ? "Admin Sign In" : "Sign In To Los Polos Hermanos"}</h1>
          <p>
            {isAdminMode
              ? "Use your administrator credentials to continue."
              : "Enter your credentials to view your support tickets."}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
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
              maxLength={LIMITS.email.max}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                recheckField("email", { ...values, email: e.target.value });
              }}
              {...fieldProps("email", values)}
            />
            <FieldError name="email" message={errors.email} />
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
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  recheckField("password", { ...values, password: e.target.value });
                }}
                {...fieldProps("password", values)}
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
            <FieldError name="password" message={errors.password} />
          </div>

          {/* Error / info message (validation, wrong password, not an admin, ...) */}
          {notice && (
            <div className="form-feedback info" role="status" style={{ marginBottom: "16px" }}>
              <span>{notice}</span>
            </div>
          )}

          {message && (
            <div className="form-feedback error" role="alert" style={{ marginBottom: "16px" }}>
              <span>{message}</span>
            </div>
          )}

          {/* Submit button label: ADMIN -> "Admin sign in", USER -> "Sign in" */}
          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : isAdminMode ? "Admin Sign In" : "Sign in"}
          </button>

          {/* USER: link to the Register page. ADMIN: plain label, since admins can't sign up here */}
          <div className="auth-footer-links">
            {isAdminMode ? (
              "You Cannot Create An Admin Account"
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Login;