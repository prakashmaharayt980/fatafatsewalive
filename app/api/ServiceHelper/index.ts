import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import getEnv from './envchema';

const env = getEnv();
const baseURL = env.NEXT_PUBLIC_API_URL;
const n8nBaseURL = env.NEXT_PUBLIC_API_N8N_URL;

interface RequestConfig extends RequestInit {
    headers?: Record<string, string>;
    params?: Record<string, string>;
    meta?: {
        contentType?: string;
    };
    _retry?: boolean;
}

interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

const getAuthToken = async (): Promise<string | undefined> => {
    if (typeof window === "undefined") {
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            return cookieStore.get("access_token")?.value;
        } catch (e) {
            return undefined;
        }
    }
    return getCookie("access_token")?.toString();
};

class FetchInstance {
    private base: string;
    private defaultHeaders: Record<string, string>;
    private isPrivate: boolean;

    constructor(base: string, headers: Record<string, string>, isPrivate = false) {
        this.base = base;
        this.defaultHeaders = headers;
        this.isPrivate = isPrivate;
    }

    private async request<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        const fullUrl = url.startsWith('http') ? url : `${this.base}${url}`;
        
        let headers = { ...this.defaultHeaders, ...config.headers };

        if (this.isPrivate) {
            const token = await getAuthToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }

        // Handle Content-Type
        if (config.meta?.contentType) {
            headers["Content-Type"] = config.meta.contentType;
        } else if (!headers["Content-Type"] && !(config.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        // Handle Body
        let body = config.body;
        if (body && typeof body === 'object' && !(body instanceof FormData)) {
            body = JSON.stringify(body);
        }

        const fetchOptions: RequestInit = {
            ...config,
            headers,
            body,
        };

        try {
            let response = await fetch(fullUrl, fetchOptions);

            // Handle 401 Refresh Token logic
            if (response.status === 401 && this.isPrivate && !config._retry) {
                config._retry = true;
                const newAccessToken = await this.refreshToken();
                if (newAccessToken) {
                    // Update header and retry
                    headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return this.request<T>(url, { ...config, headers });
                }
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw {
                    response: {
                        data,
                        status: response.status,
                        statusText: response.statusText,
                    },
                    config,
                };
            }

            return {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            };
        } catch (error: any) {
            throw error;
        }
    }

    private async refreshToken(): Promise<string | null> {
        try {
            const refreshToken = getCookie("refresh_token");
            if (!refreshToken) throw new Error("No refresh token");

            const response = await fetch(`${baseURL}/v1/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'API-Key': env.NEXT_PUBLIC_API_KEY,
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!response.ok) throw new Error("Refresh failed");

            const data = await response.json();
            const newAccessToken = data.access;

            setCookie("access_token", newAccessToken, { maxAge: 60 * 60 * 24 });
            return newAccessToken;
        } catch (error) {
            deleteCookie("access_token");
            deleteCookie("refresh_token");
            if (typeof window !== "undefined") window.location.href = "/login";
            return null;
        }
    }

    public get<T = any>(url: string, config?: RequestConfig) {
        return this.request<T>(url, { ...config, method: 'GET' });
    }

    public post<T = any>(url: string, data?: any, config?: RequestConfig) {
        return this.request<T>(url, { ...config, method: 'POST', body: data });
    }

    public put<T = any>(url: string, data?: any, config?: RequestConfig) {
        return this.request<T>(url, { ...config, method: 'PUT', body: data });
    }

    public patch<T = any>(url: string, data?: any, config?: RequestConfig) {
        return this.request<T>(url, { ...config, method: 'PATCH', body: data });
    }

    public delete<T = any>(url: string, config?: RequestConfig) {
        return this.request<T>(url, { ...config, method: 'DELETE' });
    }
}

// Instances
export const n8nApi = new FetchInstance(n8nBaseURL, {
    "API-Key": env.NEXT_PUBLIC_API_KEY,
});

export const apiPublic = new FetchInstance(baseURL, {
    "API-Key": env.NEXT_PUBLIC_API_KEY,
});

export const apiPrivate = new FetchInstance(baseURL, {
    "API-Key": env.NEXT_PUBLIC_API_KEY,
}, true);

export { setCookie, deleteCookie, getCookie };
