export function getUrlOrigin(req: any): string | null {
  try {
    let origin = req.headers.origin || req.headers.referer;

    
    if (typeof origin === 'string' && origin.includes(',')) {
      // Handle comma-separated origins string
      const origins = origin.split(',').map(o => o.trim());
      
      // Filter out localhost origins and take the first non-localhost one
      origin = origins.find(o => {
        try {
          const url = new URL(o);
          return !(
            url.hostname === 'localhost' ||
            url.hostname === '127.0.0.1' ||
            url.hostname === '::1' ||
            url.hostname.startsWith('192.168.') ||
            url.hostname.startsWith('10.') ||
            url.hostname.startsWith('172.')
          );
        } catch {
          return false; // Invalid URL
        }
      });
    } else if (Array.isArray(origin)) {
      origin = origin.filter((item) => item != 'localhost:3000')[0];
    }
    if (!origin) {
      return null;
    }
    // Parse the URL to get the origin
    const url = new URL(origin);
    const fullOrigin = `${url.protocol}//${url.host}`;

    // Check if it's localhost (various forms)
    const isLocalhost =
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '::1' ||
      url.hostname.startsWith('192.168.') ||
      url.hostname.startsWith('10.') ||
      url.hostname.startsWith('172.');
    
    // Return null if it's localhost, otherwise return the origin
    return isLocalhost ? null : fullOrigin;
  } catch {
    // Invalid URL format
    return null;
  }
}
