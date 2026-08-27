import axios from 'axios';
import { supabase } from './supabaseClient';

const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_SUPABASE_URL || '';

export const axiosClient = axios.create({
    baseURL,
    withCredentials: true,
});

// Interceptor to dynamically inject selectedCountry and Supabase Auth headers on every request
axiosClient.interceptors.request.use(
    async (config) => {
        // 1. Country Header
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

        // 2. Supabase Anon Key
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (anonKey && !anonKey.includes("placeholder") && !config.headers["apikey"]) {
            config.headers["apikey"] = anonKey;
        }

        // 3. Supabase Bearer Token
        try {
            if (supabase) {
                const { data } = await supabase.auth.getSession();
                const token = data?.session?.access_token;
                if (token && !config.headers["Authorization"]) {
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
            }
        } catch {
            // Ignore
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
