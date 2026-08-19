export const API_BASE_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || "http://35.153.223.230:5000")
    : "/api";
