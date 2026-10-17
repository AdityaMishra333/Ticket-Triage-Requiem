import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { validateLogin } from "../utils/validation";

function Login() {

    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(location.state?.email || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(location.state?.message || "");
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();
        setMessage("");

        const normalizedEmail = email.trim();
        const errors = validateLogin(normalizedEmail, password);
        if (Object.keys(errors).length > 0) {
            setMessage(Object.values(errors)[0]);
            return;
        }
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post("/auth/login", {
                email: normalizedEmail,
                password
            });

            const token = response.data.token;
            if (typeof token !== "string" || !token) {
                setMessage("Login could not be verified. Please try again.");
                return;
            }

            localStorage.setItem("token", token);
            navigate("/dashboard");

        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || "Invalid email or password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <h1 className="welcome-title">
                    Welcome!! To Ticket Triage System
            </h1>
            <h2>Customer Login</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className="password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="password-visibility"
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((visible) => !visible)}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                <div className="password-field">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        required
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                        className="password-visibility"
                        type="button"
                        aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                        aria-pressed={showConfirmPassword}
                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                    >
                        {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                </div>
                {message && <p className="form-feedback error" role="alert">{message}</p>}
                <a href="/forgot-password">
                    Forgot Password?
                </a>
                <button type="submit" disabled={submitting}>
                    {submitting ? "Signing in..." : "Login"}
                </button>
                <button type="button" onClick={() => navigate("/register")}>
                    Register
                </button>

            </form>

        </div>
    );
}

export default Login;