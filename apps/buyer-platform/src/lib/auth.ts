import { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const tokenCache = new Map<string, { isValid: boolean; expiry: number }>();

export function isValidToken(token: string): boolean {
  try {
    const cached = tokenCache.get(token);
    const now = Date.now() / 1000;

    if (cached && cached.expiry > now) {
      return cached.isValid;
    }

    const decoded = jwtDecode<{ exp?: number }>(token);

    const isValid = !decoded.exp || decoded.exp > now;

    tokenCache.set(token, {
      isValid,
      expiry: now + 30,
    });

    if (tokenCache.size > 100) {
      const oldEntries = Array.from(tokenCache.entries()).filter(
        ([, value]) => value.expiry <= now
      );
      oldEntries.forEach(([key]) => tokenCache.delete(key));
    }

    return isValid;
  } catch (error) {
    tokenCache.set(token, { isValid: false, expiry: Date.now() / 1000 + 5 });
    return false;
  }
}

export function isAuthenticated(request: NextRequest): {
  authenticated: boolean;
  token?: string;
} {
  const authCookie = request.cookies.get('auth')?.value;

  if (!authCookie) {
    return { authenticated: false };
  }

  try {
    const authData = JSON.parse(authCookie);
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      return { authenticated: false };
    }

    const isValid = isValidToken(accessToken);
    return { authenticated: isValid, token: accessToken };
  } catch (error) {
    return { authenticated: false };
  }
}
