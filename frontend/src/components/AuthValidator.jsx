import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const UnauthRoutes = ["/login", "/register", "/"];

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

            try {
                setIsLoading(true);
                await api.get("/auth/profile");
            } catch {
                navigate("/login");
            } finally {
                setIsLoading(false);
            }
        }

        validateToken();
    }, [location.pathname, navigate]);
    
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return children;
}