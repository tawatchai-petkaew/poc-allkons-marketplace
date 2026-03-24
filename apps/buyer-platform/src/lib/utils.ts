import { NextResponse } from 'next/server';

export function setLocaleCookie(response: NextResponse, locale?: string): void {
  if (!locale) {
    response.cookies.set('NEXT_LOCALE', 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
}

export function setNoCacheHeaders(response: NextResponse): void {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
}

export function createGuestRedirectURL(baseUrl: string, pathname: string): URL {
  const homeUrl = new URL('/', baseUrl);

  homeUrl.searchParams.set('mode', 'guest');
  homeUrl.searchParams.set('from', pathname);
  homeUrl.searchParams.set('t', Date.now().toString()); // Prevent caching

  return homeUrl;
}
