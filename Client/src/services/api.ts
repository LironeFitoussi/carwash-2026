import axios from "axios";

// In development, use relative URLs to leverage Vite proxy
// In production, use the full API URL from environment variable
const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (import.meta.env.DEV) {
        return '';
    }
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000,
});

// Token provider — set by AppInitializer after Auth0 loads
let _getToken: (() => Promise<string>) | null = null;

export function setTokenProvider(fn: () => Promise<string>) {
    _getToken = fn;
}

// Request interceptor: attach fresh Auth0 token on every request
api.interceptors.request.use(async (config) => {
    if (_getToken) {
        try {
            const token = await _getToken();
            config.headers.Authorization = `Bearer ${token}`;
        } catch {
            // Token refresh failed — let the request go through without a token;
            // the 401 response interceptor will handle the redirect.
        }
    }
    return config;
});

// Response interceptor: redirect to /auth on 401 (only if not already there)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;
