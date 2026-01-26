import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as yup from 'yup';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

declare module "axios" {
    export interface InternalAxiosRequestConfig {
        meta?: {
            contentType?: string;
        };
    }
    export interface AxiosRequestConfig {
        meta?: {
            contentType?: string;
        };
    }
}

const envSchema = yup.object({
    NEXT_PUBLIC_API_URL: yup.string().url().required("NEXT_PUBLIC_API_URL is missing or invalid"),
    NEXT_PUBLIC_API_KEY: yup.string().required("NEXT_PUBLIC_API_KEY is required"),
    NEXT_PUBLIC_API_N8N_URL: yup.string().url().required("NEXT_PUBLIC_API_N8N_URL is missing or invalid"),
});

const getEnv = () => {
    try {
        return envSchema.validateSync({
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
            NEXT_PUBLIC_API_N8N_URL: process.env.NEXT_PUBLIC_API_N8N_URL,
        });
    } catch (err: any) {
        return {
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
            NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
            NEXT_PUBLIC_API_N8N_URL: process.env.NEXT_PUBLIC_API_N8N_URL || '',
        };
    }
};

const env = getEnv();
const baseURL = env.NEXT_PUBLIC_API_URL;
const n8nBaseURL = env.NEXT_PUBLIC_API_N8N_URL;

// N8N API instance
export const n8nApi: AxiosInstance = axios.create({
    baseURL: n8nBaseURL,
    headers: {
        "Content-Type": "application/json",
        "API-Key": env.NEXT_PUBLIC_API_KEY,
    },
});

// Public API instance (no auth required)
export const apiPublic: AxiosInstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
        "API-Key": env.NEXT_PUBLIC_API_KEY,
    },
});

// Private API instance (auth required)
export const apiPrivate: AxiosInstance = axios.create({
    baseURL,
    headers: {
        "API-Key": env.NEXT_PUBLIC_API_KEY,
    },
});

// Request interceptor for auth token
apiPrivate.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getCookie("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Custom content type handling
    if (config.meta?.contentType) {
        config.headers["Content-Type"] = config.meta.contentType;
    } else if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }

    return config;
});

// Response interceptor for token refresh
apiPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getCookie("refresh_token");
                if (!refreshToken) throw new Error("No refresh token");

                const { data } = await apiPublic.post('/v1/refresh-token', {
                    refresh: refreshToken,
                });

                const newAccessToken = data.access;

                setCookie("access_token", newAccessToken, { maxAge: 60 * 60 * 24 });

                apiPrivate.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return apiPrivate(originalRequest);
            } catch (refreshError) {
                deleteCookie("access_token");
                deleteCookie("refresh_token");
                if (typeof window !== "undefined") window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export { setCookie, deleteCookie, getCookie };
