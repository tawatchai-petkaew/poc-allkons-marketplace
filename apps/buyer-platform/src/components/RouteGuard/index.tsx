'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isUserAuthenticated, storeIntendedPath } from '@/utils/auth';
import { isProtectedRoute } from '@/lib/routeGuard';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard = ({ children }: RouteGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isCheckingRef = useRef(false);
  const lastCheckedPathRef = useRef<string>('');

  useEffect(() => {
    // Avoid duplicate checks for the same path
    if (isCheckingRef.current || lastCheckedPathRef.current === pathname) {
      return;
    }

    const checkRoute = async () => {
      isCheckingRef.current = true;
      lastCheckedPathRef.current = pathname;

      try {
        // Fast path: only check if route is protected
        if (!isProtectedRoute(pathname)) {
          return;
        }

        // Check authentication
        const isAuthenticated = isUserAuthenticated();

        if (!isAuthenticated) {
          // Store intended path with full URL (including query and hash)
          const fullPath =
            window.location.pathname +
            window.location.search +
            window.location.hash;
          storeIntendedPath(fullPath);

          // Redirect to guest homepage with performance optimization
          const url = new URL('/', window.location.origin);
          url.searchParams.set('mode', 'guest');
          url.searchParams.set('from', pathname);
          url.searchParams.set('t', Date.now().toString());

          // Use replace to prevent back button issues
          window.location.replace(url.toString());
        }
      } catch (error) {
        console.error('Route guard error:', error);
        // On error, assume unauthenticated and redirect
        const url = new URL('/', window.location.origin);
        url.searchParams.set('mode', 'guest');
        url.searchParams.set('error', 'auth-check-failed');
        window.location.replace(url.toString());
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Small delay to allow server-side middleware to work first
    const timeoutId = setTimeout(checkRoute, 10);

    return () => {
      clearTimeout(timeoutId);
      isCheckingRef.current = false;
    };
  }, [pathname, router]);

  // Handle popstate events (back/forward navigation)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const currentPath = window.location.pathname;

      if (isProtectedRoute(currentPath) && !isUserAuthenticated()) {
        event.preventDefault();

        // Store intended path
        const fullPath =
          window.location.pathname +
          window.location.search +
          window.location.hash;
        storeIntendedPath(fullPath);

        // Redirect to guest mode
        const url = new URL('/', window.location.origin);
        url.searchParams.set('mode', 'guest');
        url.searchParams.set('from', currentPath);
        url.searchParams.set('source', 'navigation');

        window.location.replace(url.toString());
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return <>{children}</>;
};

export default RouteGuard;
