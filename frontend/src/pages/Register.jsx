import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { LIMITS, registerValidators } from "../utils/validation";
import { useFieldErrors } from "../utils/useFieldErrors";
import FieldError from "../components/FieldError";
import AuthLayout from "../components/AuthLayout";

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
  const { errors, recheckField, checkAll, fieldProps } = useFieldErrors(registerValidators);
  const values = { ...formData, confirmPassword };

  // Updates the field that matches the input's name attribute (name / email / password)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    const nextValues = { ...values, [e.target.name]: e.target.value };
    recheckField(e.target.name, nextValues);
    if (e.target.name === "password") recheckField("confirmPassword", nextValues);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Client-side validation; errors are shown under each field and the request is not sent
    if (!checkAll(values)) return;
    const name = formData.name.trim();
    const email = formData.email.trim();

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
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create an account</h1>
          <p>Get started with Los Polos Hermanos to report and track issues.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
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
              maxLength={LIMITS.name.max}
              value={formData.name}
              onChange={handleChange}
              {...fieldProps("name", values)}
            />
            <FieldError name="name" message={errors.name} />
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
              maxLength={LIMITS.email.max}
              value={formData.email}
              onChange={handleChange}
              {...fieldProps("email", values)}
            />
            <FieldError name="email" message={errors.email} />
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
                value={formData.password}
                onChange={handleChange}
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
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  recheckField("confirmPassword", { ...values, confirmPassword: e.target.value });
                }}
                {...fieldProps("confirmPassword", values)}
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
            <FieldError name="confirmPassword" message={errors.confirmPassword} />
          </div>

          {message && (
            <div className="form-feedback error" role="alert" style={{ marginBottom: "16px" }}>
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit"
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
    </AuthLayout>
  );
}

export default Register;