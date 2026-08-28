import axios from 'axios';
import { API_BASE_URL } from '@/shared/utils/apiConfig';

export const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Interceptor to dynamically inject Supabase & selectedCountry headers on every request
axiosClient.interceptors.request.use(
    (config) => {
        // Prevent leading slash from stripping baseURL pathname in Axios (e.g. /functions/v1)
        if (config.url && config.url.startsWith('/') && config.baseURL && !config.baseURL.endsWith('/')) {
            config.url = config.url.replace(/^\/+/, '');
        }

        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (supabaseAnonKey) {
            if (!config.headers['apikey']) {
                config.headers['apikey'] = supabaseAnonKey;
            }
            if (!config.headers['Authorization']) {
                const token = localStorage.getItem('token');
                config.headers['Authorization'] = `Bearer ${token || supabaseAnonKey}`;
            }
        }

        const countryData = localStorage.getItem('selectedCountry');
        if (countryData && !config.headers['X-Country']) {
            try {
                const country = JSON.parse(countryData);
                if (country?.name) {
                    config.headers['X-Country'] = country.name;
                    if (country.code) {
                        config.headers['X-Country-Code'] = country.code;
                    }
                } else if (country?.code) {
                    config.headers['X-Country'] = country.code;
                }
            } catch (e) {
                console.error('Error parsing selectedCountry for axios headers:', e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

