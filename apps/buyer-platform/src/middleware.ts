import { NextRequest, NextResponse } from 'next/server';
import {
  isProtectedRoute,
  createIntendedPathCookie,
  isAuthenticated,
  setLocaleCookie,
  setNoCacheHeaders,
  createGuestRedirectURL,
} from './lib';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = request.cookies.get('NEXT_LOCALE')?.value;

  // Fast path: Skip processing for non-protected routes
  if (!isProtectedRoute(pathname)) {
    const response = NextResponse.next();
    setLocaleCookie(response, locale);
    return response;
  }

  // Check authentication for protected routes
  const authResult = isAuthenticated(request);

  if (!authResult.authenticated) {
    // Create redirect to guest mode
    const guestUrl = createGuestRedirectURL(request.url, pathname);
    const response = NextResponse.redirect(guestUrl, { status: 302 });

    // Store intended path for later use
    const intendedPathCookie = createIntendedPathCookie(request);
    response.cookies.set(
      intendedPathCookie.name,
      intendedPathCookie.value,
      intendedPathCookie.options
    );

    // Set cookies and headers
    setLocaleCookie(response, locale);
    setNoCacheHeaders(response);

    return response;
  }

  // User is authenticated, continue with request
  const response = NextResponse.next();
  setLocaleCookie(response, locale);

  // Clear any intended path since user is authenticated
  response.cookies.delete('intended_path');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
