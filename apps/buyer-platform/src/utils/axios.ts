import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import Cookies from 'js-cookie';
import { getProxyUrls, getServiceUrls } from './serviceConfig';

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
  '/v1/auth/login-otp', // Login endpoint (no token yet)
  '/v1/auth/login', // Login endpoint (no token yet)
  '/v1/auth/refresh', // Refresh endpoint itself (prevent infinite loop)
  '/v1/auth/logout', // Logout endpoint (intentionally ending session
];

const shouldExcludeRefresh = (url?: string) => {
  return EXCLUDED_PATHS.some((path) => url?.includes(path));
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
  service: 'product' | 'order' | 'customer',
  isServerSide?: boolean
) => {
  // Auto-detect if not specified
  const isServer = isServerSide ?? typeof window === 'undefined';

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
      '/v1/auth/logout',
      {},
      {
        withCredentials: true,
        baseURL: getServiceUrl('customer', false), // Use proxy
        headers: {
          'app-id': process.env.NEXT_PUBLIC_ALLKONS_APP_ID || '',
        },
      }
    );
    Cookies.remove('auth');
    Cookies.remove('token');
  } catch (error) {
    console.error('Logout error:', error);
    // Fallback: clear cookies manually if API fails
    Cookies.remove('auth');
    Cookies.remove('token');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  }

  if (redirectToLogin && typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

class AxiosClient {
  private instance: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.instance = this.createInstance(config);
    this.setupInterceptors();
  }

  private createInstance(config?: AxiosRequestConfig): AxiosInstance {
    const auth = Cookies.get('auth');
    const authData = auth ? JSON.parse(auth) : null;

    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_HOST_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'app-id': process.env.NEXT_PUBLIC_ALLKONS_APP_ID,
        Authorization: `Bearer ${authData?.accessToken || ''}`,
      },
      ...config, // Merge custom configuration props
    });
  }

  private setupInterceptors() {
    // Request interceptor to always get fresh auth token
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const auth = Cookies.get('auth');
        const authData = auth ? JSON.parse(auth) : null;

        if (authData?.accessToken) {
          config.headers.Authorization = `Bearer ${authData.accessToken}`;
        }

        // Add app-id if not already set
        if (!config.headers['app-id']) {
          config.headers['app-id'] =
            process.env.NEXT_PUBLIC_ALLKONS_APP_ID || '';
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor with 401 handling and token refresh
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Only handle on client-side
        if (typeof window === 'undefined') {
          console.error('Axios error:', error.response?.data || error.message);
          return Promise.reject(error);
        }

        // Check if 401 and not already retried
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !shouldExcludeRefresh(originalRequest.url)
        ) {
          if (isRefreshing) {
            // Queue this request while refreshing
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => this.instance(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Call refresh token endpoint
            await axios.post(
              '/v1/auth/refresh',
              {},
              {
                withCredentials: true,
                baseURL: getServiceUrl('customer', false), // Use proxy
                headers: {
                  'app-id': process.env.NEXT_PUBLIC_ALLKONS_APP_ID || '',
                },
              }
            );

            processQueue(null, null);
            return this.instance(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);

            // Call logout helper to clear cookies and redirect
            await performLogout(true);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        console.error('Axios error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public updateAuthToken(token?: string) {
    if (token) {
      this.instance.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      const auth = Cookies.get('auth');
      const authData = auth ? JSON.parse(auth) : null;
      this.instance.defaults.headers.Authorization = `Bearer ${
        authData?.accessToken || ''
      }`;
    }
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Create a singleton instance
const axiosClientInstance = new AxiosClient({
  headers: {
    'app-id': process.env.NEXT_PUBLIC_ALLKONS_APP_ID,
  },
});

const api = axiosClientInstance.getInstance();

// Simple microservice helpers
export const productAPI = {
  get: (url: string, config?: AxiosRequestConfig) =>
    api.get(url, { ...config, baseURL: getServiceUrl('product') }),
  post: (url: string, data?: any, config?: AxiosRequestConfig) =>
    api.post(url, data, { ...config, baseURL: getServiceUrl('product') }),
  put: (url: string, data?: any, config?: AxiosRequestConfig) =>
    api.put(url, data, { ...config, baseURL: getServiceUrl('product') }),
  delete: (url: string, config?: AxiosRequestConfig) =>
    api.delete(url, { ...config, baseURL: getServiceUrl('product') }),
  patch: (url: string, data?: any, config?: AxiosRequestConfig) =>
    api.patch(url, data, { ...config, baseURL: getServiceUrl('product') }),
};

export const orderAPI = {
  get: (url: string, config?: AxiosRequestConfig) =>
    api.get(url, { ...config, baseURL: getServiceUrl('order') }),
  post: (url: string, data?: any, config?: AxiosRequestConfig) =>
    api.post(url, data, { ...config, baseURL: getServiceUrl('order') }),
  put: (url: string, data?: any, config?: AxiosRequestConfig) =>
    api.put(url, data, { ...config, baseURL: getServiceUrl('order') }),
  delete: (url: string, config?: AxiosRequestConfig) =>
    api.delete(url, { ...config, baseURL: getServiceUrl('order') }),
  patch: (url: string, data?: any, config?: AxiosRequestConfig) =>
    api.patch(url, data, { ...config, baseURL: getServiceUrl('order') }),
};

export const customerAPI = {
  get: (url: string, config?: AxiosRequestConfig) =>
    api.get(url, { ...config, baseURL: getServiceUrl('customer') }),
  post: (url: string, data?: any, config?: AxiosRequestConfig) =>
    api.post(url, data, { ...config, baseURL: getServiceUrl('customer') }),
  put: (url: string, data?: any, config?: AxiosRequestConfig) =>
    api.put(url, data, { ...config, baseURL: getServiceUrl('customer') }),
  delete: (url: string, config?: AxiosRequestConfig) =>
    api.delete(url, { ...config, baseURL: getServiceUrl('customer') }),
  patch: (url: string, data?: any, config?: AxiosRequestConfig) =>
    api.patch(url, data, { ...config, baseURL: getServiceUrl('customer') }),
};

/**
 * Public logout function
 * Calls the backend logout API to clear httpOnly cookies properly
 * Falls back to manual cookie clearing if API fails
 *
 * @param redirectToLogin - Whether to redirect to login page after logout (default: true)
 *
 * @example
 * import { logout } from '@/utils/axios';
 *
 * const handleLogout = async () => {
 *   await logout(); // Clears cookies and redirects to /login
 * };
 */
export const logout = performLogout;

export default api;
export { axiosClientInstance, getServiceUrl };
