import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { isValidEmail, isValidUsername } from "../utils/validation";

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
        if (!isValidUsername(name)) {
            setMessage("Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores.");
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
            const response = await api.post("/auth/register", {
                name,
                email: email.toLowerCase(),
                password: formData.password
            });

            if (!response.data.user?.email) {
                setMessage("Registration could not be verified. Please try again.");
                return;
            }
            navigate("/login", {
                state: {
                    email: response.data.user.email
                }
            });

        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message;
            if (message?.toLowerCase().includes("already exists")) {
                setMessage("This email is already registered. Please log in.");
                navigate("/login", {
                    state: {
                        email,
                        message: "This email is already registered. Please log in."
                    }
                });
            } else {
                setMessage(message || "Registration failed. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            <h1 className="welcome-title">
        Welcome!! New User
    </h1>
            <h2>Create Account</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="name"
                    autoComplete="username"
                    required
                    placeholder="Username (3-20 characters)"
                    value={formData.name}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <div className="password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        minLength={6}
                        required
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
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
                <button type="submit" disabled={submitting}>
                    {submitting ? "Creating account..." : "Register"}
                </button>

            </form>
        </div>
    );
}

export default Register;