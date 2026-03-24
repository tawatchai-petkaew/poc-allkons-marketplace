import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { getProxyUrls, getServiceUrls } from "@/utils/serviceConfig";
import { getSessionCookie } from "./auth-cookies";
import { useUserStore } from "@/store/user.store";
// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// API endpoints that should NOT trigger automatic token refresh
// These are auth-related endpoints that either:
// 1. Don't have tokens yet (login endpoints)
// 2. Are already handling token refresh
// 3. Are logging out
const EXCLUDED_PATHS = [
  "/v1/auth/login-otp", // Login endpoint (no token yet)
  "/v1/auth/login", // Login endpoint (no token yet)
  "/v1/auth/refresh", // Refresh endpoint itself (prevent infinite loop)
  "/v1/auth/logout", // Logout endpoint (intentionally ending session
];

const shouldExcludeRefresh = (url?: string) => {
  return EXCLUDED_PATHS.some((path) => url?.includes(path));
};

/**
 * Converts an Axios request configuration object into a cURL command string.
 * This is useful for debugging and sharing requests with backend tools.
 */
const convertToCurl = (
  config: InternalAxiosRequestConfig | AxiosRequestConfig,
): string => {
  const method = (config.method || "GET").toUpperCase();
  const url = (config.baseURL || "") + (config.url || "");
  const headers = config.headers || {};
  let curl = `curl --location --request ${method} '${url}' \\\n`;
  // Add headers
  Object.keys(headers).forEach((key) => {
    const value = headers[key];
    if (
      value !== undefined &&
      value !== null &&
      key !== "common" &&
      typeof value !== "object"
    ) {
      curl += `--header '${key}: ${value}' \\\n`;
    }
  });

  // Add parameters for GET requests (if not already in URL)
  if (config.params && Object.keys(config.params).length > 0) {
    const queryParams = new URLSearchParams(config.params).toString();
    if (queryParams) {
      curl = curl.replace(
        url,
        `${url}${url.includes("?") ? "&" : "?"}${queryParams}`,
      );
    }
  }

  // Add body for non-GET/HEAD requests
  if (["GET", "HEAD"].indexOf(method) === -1 && config.data) {
    const body =
      typeof config.data === "object"
        ? JSON.stringify(config.data)
        : config.data;
    curl += `--data-raw '${body}' `;
  }

  return curl.trim().replace(/\\\n$/, "");
};

/**
 * Microservice URL builder
 *
 * How it works:
 * - Client-side (browser) → Always use Next.js proxy (/api/customer, /api/product, /api/order)
 * - Server-side (SSR, Server Components, Server Actions) → Call backend directly
 *
 * Why client-side always uses proxy:
 * - Backend sets httpOnly cookies (accessToken, refreshToken) that JS cannot read
 * - Browser only accepts Set-Cookie from same-origin responses
 * - Proxy makes the response same-origin, allowing cookies to be set properly
 * - Without proxy, cross-origin Set-Cookie headers are blocked by browser
 *
 * Server-side calls bypass proxy for better performance since they don't need cookies.
 */
const getServiceUrl = (
  service: "product" | "order" | "customer",
  isServerSide?: boolean,
) => {
  // Auto-detect if not specified
  const isServer = isServerSide ?? typeof window === "undefined";

  // Client-side → Always use Next.js API proxy (required for httpOnly cookies)
  if (!isServer) {
    const proxyUrls = getProxyUrls();
    return proxyUrls[service];
  }

  // Server-side → Use backend gateway URLs directly
  const serviceUrls = getServiceUrls();
  return serviceUrls[service];
};

/**
 * Internal logout helper
 * Calls the backend logout API to clear httpOnly cookies properly
 * Falls back to manual cookie clearing if API fails
 *
 * @param redirectToLogin - Whether to redirect to login page after logout (default: true)
 */
const performLogout = async (redirectToLogin = true) => {
  try {
    await axios.post(
      "/v1/auth/logout",
      {},
      {
        withCredentials: true,
        baseURL: getServiceUrl("customer", false), // Use proxy
        headers: {
          "app-id": process.env.NEXT_PUBLIC_ALLKONS_APP_ID || "",
        },
      },
    );
    Cookies.remove("auth");
    Cookies.remove("token");
    Cookies.remove("organizationToken");
    Cookies.remove("organizationId");
    Cookies.remove("organizeUuid");
  } catch (error) {
    console.error("Logout error:", error);
    // Fallback: clear cookies manually if API fails
    Cookies.remove("auth");
    Cookies.remove("token");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("organizationToken");
    Cookies.remove("organizationId");
    Cookies.remove("organizeUuid");
  }

  // Clear persisted Zustand store to prevent stale user data on next login
  useUserStore.getState().clearStore();

  if (redirectToLogin && typeof window !== "undefined") {
    window.location.href = "/";
  }
};

class AxiosClient {
  private instance: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.instance = this.createInstance(config);
    this.setupInterceptors();
  }

  private createInstance(config?: AxiosRequestConfig): AxiosInstance {
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_HOST_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "app-id": process.env.NEXT_PUBLIC_ALLKONS_APP_ID,
      },
      ...config,
    });
  }

  private setupInterceptors() {
    // Request interceptor to add auth token from session cookie
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Client-side: Get token from cookie

        if (typeof window !== "undefined") {
          const session = getSessionCookie();
          const merchant = useUserStore.getState().merchant;
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }

          const organizationId = Cookies.get("organizationId");
          const organizationUuid = Cookies.get("organizeUuid");
          if (organizationId) {
            config.headers["organizationId"] = organizationId;
          }
          if (organizationUuid) {
            config.headers["organizationUuid"] = organizationUuid;
          }
          const organizationToken = Cookies.get("organizationToken");
          if (organizationToken && config.url?.startsWith("/organization/")) {
            config.headers.Authorization = `Bearer ${organizationToken}`;
          }
          if (merchant) {
            config.headers["CurrentMerchantSlug"] = merchant.merchantSlug;
          }
        }

        // Log request as cURL for debugging
        if (process.env.NODE_ENV !== "production") {
          console.groupCollapsed(
            `🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`,
          );
          console.log(convertToCurl(config));
          console.groupEnd();
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(error),
    ); // Response interceptor to handle 401 errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        console.error("Axios error:", error);

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
          const originalRequest = error.config;

          // Skip if already redirecting or if it's an excluded path
          if (shouldExcludeRefresh(originalRequest?.url)) {
            return Promise.reject(error);
          }

          // Clear store and redirect to login
          if (typeof window !== "undefined") {
            // Prevent multiple redirects
            if (window.location.pathname === "/login") {
              return Promise.reject(error);
            }

            // Clear ALL auth-related cookies
            Cookies.remove("accessToken");
            Cookies.remove("auth-session"); // This is the main session cookie
            Cookies.remove("auth");
            Cookies.remove("token");

            const { useUserStore } = require("@/store/user.store");
            useUserStore.getState().clearStore();

            // Use replace to prevent back button issues
            window.location.replace("/login");
          }
        }

        return Promise.reject(error);
      },
    );
  }

  public updateAuthToken(token?: string) {
    if (token) {
      this.instance.defaults.headers.Authorization = `Bearer ${token}`;
    }
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Create a singleton instance
const axiosClientInstance = new AxiosClient({
  headers: {
    "app-id": process.env.NEXT_PUBLIC_ALLKONS_APP_ID,
  },
});

const api = axiosClientInstance.getInstance();

// Simple microservice helpers
export const productAPI = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, { ...config, baseURL: getServiceUrl("product") }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, { ...config, baseURL: getServiceUrl("product") }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, { ...config, baseURL: getServiceUrl("product") }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, { ...config, baseURL: getServiceUrl("product") }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, { ...config, baseURL: getServiceUrl("product") }),
};

export const orderAPI = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, { ...config, baseURL: getServiceUrl("order") }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, { ...config, baseURL: getServiceUrl("order") }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, { ...config, baseURL: getServiceUrl("order") }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, { ...config, baseURL: getServiceUrl("order") }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, { ...config, baseURL: getServiceUrl("order") }),
};

export const customerAPI = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, { ...config, baseURL: getServiceUrl("customer") }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, { ...config, baseURL: getServiceUrl("customer") }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, { ...config, baseURL: getServiceUrl("customer") }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, { ...config, baseURL: getServiceUrl("customer") }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, { ...config, baseURL: getServiceUrl("customer") }),
};

export default api;
export { axiosClientInstance };
