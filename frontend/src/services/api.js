import axios from "axios";

const api = axios.create({
    // VITE_API_URL: full backend URL, e.g. https://my-api.vercel.app/api (separate Vercel projects).
    // Without it: dev talks to the local backend, production uses /api on the same domain.
    baseURL: import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? `http://${window.location.hostname}:5000/api` : "/api"),
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;