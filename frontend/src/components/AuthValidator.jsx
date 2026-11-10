import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTokenPayload, isAdminToken } from "../utils/auth";

const UnauthRoutes = ["/login", "/register", "/"];

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
                navigate("/dashboard");
            } else if (location.pathname === "/dashboard" && isAdminToken(token)) {
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
