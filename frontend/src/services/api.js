import axios from "axios";

const api = axios.create({
    // VITE_API_URL is set on Vercel, e.g. https://my-api.vercel.app/api. Locally it falls back to this machine.
    baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`,
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;