import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const UnauthRoutes = ["/login", "/register", "/"];

// The backend has no profile endpoint, so validate the JWT locally (presence + exp).
function isTokenValid(token) {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return !payload.exp || payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default function AuthValidator({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        async function validateToken() {
            if (UnauthRoutes.includes(location.pathname)) {
                setIsLoading(false);
                return;
            }

            if (!isTokenValid(localStorage.getItem("token"))) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            }
            setIsLoading(false);
        }

        validateToken();
    }, [location.pathname, navigate]);
    
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return children;
}