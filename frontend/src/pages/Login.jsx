import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { validateLogin } from "../utils/validation";
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
  const [message, setMessage] = useState(location.state?.message || "");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // false = User login (default), true = Admin login
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Background photo layer (fixed behind the whole page). While the visitor is at the top the photo is
  // clear; as they scroll down to the login box it gradually blurs and darkens.
  // The scroll progress (0 -> 1) is written to the CSS variable --p, which index.css uses for blur/darkness.
  const bgRef = useRef(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, (window.scrollY - vh * 0.1) / (vh * 0.7)));
      bgRef.current?.style.setProperty("--p", progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Called by the User / Admin toggle buttons; also clears any old error message
  const switchLoginMode = (adminMode) => {
    setIsAdminMode(adminMode);
    setMessage("");
  };

  // Runs for both user and admin sign in
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Client-side validation before calling the backend
    const normalizedEmail = email.trim();
    const errors = validateLogin(normalizedEmail, password);
    if (Object.keys(errors).length > 0) {
      setMessage(Object.values(errors)[0]);
      return;
    }

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
    <>
    {/* COMIC HERO (login page only, shown to users and admins): the first screen a visitor sees.
        The quote is written over the fixed photo layer (.login-bg). */}
    {/* Fixed photo behind everything (the Gustavo Fring photo). Clear at the top, blurred when scrolled to the login box. */}
    <div ref={bgRef} className="login-bg" aria-hidden="true" />

    <section className="login-hero" aria-label="Welcome">
      <p className="login-hero-quote" aria-hidden="true">
        Hello, my name is Gustavo Fring. How can I help you?
      </p>
      <p className="login-hero-scroll">Scroll down for login</p>
    </section>

    {/* LOGIN BOX section (existing login page): user and admin sign in, below the hero */}
    <div id="login-box" className={`auth-page dashboard-bg login-page${isAdminMode ? " admin-login-mode" : ""}`}>
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
          <h1>{isAdminMode ? "Admin sign in" : "Sign in to Los Polos Hermanos"}</h1>
          <p>
            {isAdminMode
              ? "Use your administrator credentials to continue."
              : "Enter your credentials to view your support tickets."}
          </p>
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
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error / info message (validation, wrong password, not an admin, ...) */}
          {message && (
            <div className="form-feedback error" role="alert" style={{ marginBottom: "16px" }}>
              <span>{message}</span>
            </div>
          )}

          {/* Submit button label: ADMIN -> "Admin sign in", USER -> "Sign in" */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "10px", marginTop: "4px" }}
            disabled={submitting}
          >
            {submitting ? "Signing in..." : isAdminMode ? "Admin sign in" : "Sign in"}
          </button>

          {/* Shown in both modes; goes to the Register page (creates a normal user account) */}
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
    </>
  );
}

export default Login;