import axios from 'axios';
import { executeSupabaseRequest } from './supabaseAdapter';

const baseURL = import.meta.env.VITE_API_URL || (
    import.meta.env.PROD 
        ? 'https://api.nextkinlife.live' 
        : '/api'
);

export const axiosClient = axios.create({
    baseURL,
    adapter: async (config) => {
        try {
            let url = config.url || '';
            if (url.startsWith('http://') || url.startsWith('https://')) {
                try {
                    const parsed = new URL(url);
                    url = parsed.pathname.replace(/^\/functions\/v1\/?/, '').replace(/^\/api\/?/, '');
                } catch {}
            }

            let body = config.data;
            if (typeof body === 'string') {
                try {
                    body = JSON.parse(body);
                } catch {
                    // keep raw if not JSON
                }
            }

            const result = await executeSupabaseRequest({
                url,
                method: config.method ? config.method.toUpperCase() : 'GET',
                body,
                params: config.params,
                headers: config.headers
            });

            if (result && result.error) {
                const error = new Error(result.error.message || result.error.error || 'Request failed');
                error.config = config;
                error.response = {
                    data: result.error,
                    status: result.error.status || 400,
                    statusText: 'Bad Request',
                    headers: {},
                    config
                };
                return Promise.reject(error);
            }

            return {
                data: result ? result.data : {},
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
                request: {}
            };
        } catch (err) {
            console.error('axiosClient adapter error:', err);
            const error = new Error(err.message || 'Request failed');
            error.config = config;
            error.response = {
                data: { message: err.message },
                status: 500,
                statusText: 'Internal Server Error',
                headers: {},
                config
            };
            return Promise.reject(error);
        }
    }
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

