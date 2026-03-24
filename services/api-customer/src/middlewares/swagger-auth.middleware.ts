import { Request, Response, NextFunction } from 'express';

/**
 * Basic Auth Middleware for Swagger Documentation
 * Protects Swagger endpoints with username and password authentication
 */
export function swaggerBasicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
    return res.status(401).send('Authentication required');
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':');
  const username = auth[0];
  const password = auth[1];

  const validUsername = process.env.SWAGGER_USER;
  const validPassword = process.env.SWAGGER_PASSWORD;

  if (username === validUsername && password === validPassword) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
  return res.status(401).send('Invalid credentials');
}
