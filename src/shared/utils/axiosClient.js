import axios from 'axios';
import { API_BASE_URL } from '@/shared/utils/apiConfig';

export const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Interceptor to dynamically inject selectedCountry headers on every request
axiosClient.interceptors.request.use(
    (config) => {
        const countryData = localStorage.getItem("selectedCountry");
        if (countryData) {
            try {
                const country = JSON.parse(countryData);
                if (country?.name) {
                    config.headers["X-Country"] = country.name;
                    if (country.code) {
                        config.headers["X-Country-Code"] = country.code;
                    }
                } else if (country?.code) {
                    config.headers["X-Country"] = country.code;
                }
            } catch (e) {
                console.error("Error parsing selectedCountry for axios headers:", e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
