import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { PROTECTED_ROUTES } from '@/lib/routeGuard';

export interface AuthData {
  accessToken: string;
  refreshToken?: string;
  [key: string]: any;
}

export interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

const tokenValidationCache = new Map<
  string,
  { isValid: boolean; timestamp: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

export const storeIntendedPath = (path: string): void => {
  try {
    const intendedPathData = {
      path,
      timestamp: Date.now(),
      ttl: 30 * 60 * 1000, // 30 minutes in milliseconds
    };

    // Don't store duplicate paths
    const existing = getIntendedPath();
    if (existing === path) {
      return;
    }

    sessionStorage.setItem('intended_path', JSON.stringify(intendedPathData));
  } catch (error) {
    console.warn('Failed to store intended path:', error);
  }
};

export const getIntendedPath = (): string | null => {
  try {
    const stored = sessionStorage.getItem('intended_path');
    if (!stored) {
      return null;
    }

    const data = JSON.parse(stored);
    const now = Date.now();

    // Check TTL
    if (now - data.timestamp > data.ttl) {
      clearIntendedPath();
      return null;
    }

    return data.path;
  } catch (error) {
    clearIntendedPath();
    return null;
  }
};

export const clearIntendedPath = (): void => {
  try {
    sessionStorage.removeItem('intended_path');
  } catch (error) {
    // Ignore errors in clearing
  }
};

export const isUserAuthenticated = (): boolean => {
  try {
    const auth = Cookies.get('auth');

    if (!auth) {
      return false;
    }

    const authData: AuthData = JSON.parse(auth);
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      return false;
    }

    // Check cache first for performance
    const cached = tokenValidationCache.get(accessToken);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.isValid;
    }

    // Validate token expiry
    const decoded: DecodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;

    const isValid = !decoded.exp || decoded.exp > currentTime;

    // Cache the result
    tokenValidationCache.set(accessToken, {
      isValid,
      timestamp: now,
    });

    // Clean up cache periodically
    if (tokenValidationCache.size > 50) {
      const oldEntries = Array.from(tokenValidationCache.entries()).filter(
        ([, value]) => now - value.timestamp > CACHE_DURATION
      );
      oldEntries.forEach(([key]) => tokenValidationCache.delete(key));
    }

    if (!isValid) {
      // Token is expired, remove it
      clearAuth();
      return false;
    }

    return true;
  } catch (error) {
    // If any error occurs, consider user as not authenticated
    clearAuth();
    return false;
  }
};

export const getAuthToken = (): string | null => {
  try {
    const auth = Cookies.get('auth');

    if (!auth) {
      return null;
    }

    const authData: AuthData = JSON.parse(auth);
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      return null;
    }

    // Check if token is still valid
    const decoded: DecodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;

    if (decoded.exp && decoded.exp < currentTime) {
      clearAuth();
      return null;
    }

    return accessToken;
  } catch (error) {
    clearAuth();
    return null;
  }
};

export const clearAuth = (): void => {
  try {
    Cookies.remove('auth');
    tokenValidationCache.clear();

    // Trigger storage event for cross-tab synchronization
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'auth_cleared',
        newValue: Date.now().toString(),
        storageArea: localStorage,
      })
    );
  } catch (error) {
    // Handle case where localStorage is not available
    Cookies.remove('auth');
    tokenValidationCache.clear();
  }
};

export const setupCrossTabSync = (onAuthChange?: () => void): (() => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'auth_cleared') {
      // Another tab cleared auth, sync this tab
      tokenValidationCache.clear();
      onAuthChange?.();
    }
  };

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Tab became visible, check if auth status changed
      const wasAuthenticated = tokenValidationCache.size > 0;
      const isAuthenticated = isUserAuthenticated();

      if (wasAuthenticated !== isAuthenticated) {
        onAuthChange?.();
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

export const isProtectedRoute = (pathname: string): boolean => {
  // Fast exact match check first
  if (PROTECTED_ROUTES.includes(pathname)) {
    return true;
  }

  // Check if path starts with any protected route
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route + '/'));
};

export const handleIntendedPathFromCookie = (): void => {
  try {
    const intendedPath = Cookies.get('intended_path');
    if (intendedPath) {
      storeIntendedPath(intendedPath);
      Cookies.remove('intended_path');
    }
  } catch (error) {
    console.warn('Failed to handle intended path from cookie:', error);
  }
};

export const redirectToIntendedPath = (): boolean => {
  const intendedPath = getIntendedPath();
  if (intendedPath && isUserAuthenticated()) {
    clearIntendedPath();
    window.location.href = intendedPath;
    return true;
  }
  return false;
};
