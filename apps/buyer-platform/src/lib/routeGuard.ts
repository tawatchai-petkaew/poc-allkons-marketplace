import { NextRequest } from 'next/server';

export const PROTECTED_ROUTES = [
  '/cart',
  '/checkout',
  '/my-order',
  '/orders',
  '/profile',
  '/addresses',
  '/payment',
  '/credit-center',
  '/credit',
  '/favorite',
  '/wishlist',
  '/account',
  '/settings',
  '/organization',
];

const PROTECTED_ROUTE_PATTERNS = PROTECTED_ROUTES.map((route) => ({
  route,
  regex: new RegExp(`^${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/.*)?$`),
}));

export function isProtectedRoute(pathname: string): boolean {
  if (PROTECTED_ROUTES.includes(pathname)) {
    return true;
  }

  return PROTECTED_ROUTE_PATTERNS.some(({ regex }) => regex.test(pathname));
}

export function createIntendedPathCookie(request: NextRequest): {
  name: string;
  value: string;
  options: any;
} {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const hash = request.nextUrl.hash;

  const intendedPath = pathname + search + hash;

  return {
    name: 'intended_path',
    value: intendedPath,
    options: {
      path: '/',
      maxAge: 30 * 60, // 30 minutes TTL
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  };
}
