import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTokenPayload, isAdminToken } from "../utils/auth";

const UnauthRoutes = ["/login", "/register", "/"];

// The backend has no profile endpoint, so validate the JWT locally (presence + exp).
function isTokenValid(token) {
    const payload = getTokenPayload(token);
    return !!payload && (!payload.exp || payload.exp * 1000 > Date.now());
}

export default function AuthValidator({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        async function validateToken() {
            const token = localStorage.getItem("token");

            if (UnauthRoutes.includes(location.pathname)) {
                // Already logged in: skip the login and sign-up pages
                if (isTokenValid(token)) {
                    navigate(isAdminToken(token) ? "/admin" : "/dashboard", { replace: true });
                }
                setIsLoading(false);
                return;
            }

            if (!isTokenValid(token)) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            } else if (location.pathname.startsWith("/admin") && !isAdminToken(token)) {
                // ADMIN ONLY pages: logged in, but not an admin -> back to the user dashboard.
                // UI guard only; the backend adminAuth middleware enforces the role on the API.
                navigate("/dashboard");
            } else if (location.pathname === "/dashboard" && isAdminToken(token)) {
                // Admins have no customer dashboard, their tickets page is /admin
                navigate("/admin", { replace: true });
            }
            setIsLoading(false);
        }

        validateToken();
    }, [location.pathname, navigate]);
    
    if (isLoading) {
        return null;
    }

    return children;
}