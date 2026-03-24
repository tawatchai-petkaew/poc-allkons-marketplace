import { Request, Response, NextFunction } from 'express';

// Basic Auth middleware for BullBoard dashboard
export function bullBoardAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="BullBoard"');
    return res.status(401).send('Authentication required');
  }

  const decoded = Buffer.from(header.replace('Basic ', ''), 'base64').toString();
  const separatorIndex = decoded.indexOf(':');
  const user = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : '';
  const pass = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : '';

  const expectedUser = process.env.BULLBOARD_USER || '';
  const expectedPass = process.env.BULLBOARD_PASS || '';

  if (!expectedUser || !expectedPass) {
    // If env vars are not set, deny access explicitly to avoid accidental exposure
    return res.status(500).send('BullBoard credentials not configured');
  }

  if (user === expectedUser && pass === expectedPass) {
    return next();
  }

  return res.status(403).send('Forbidden');
}