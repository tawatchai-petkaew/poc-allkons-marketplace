import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Inject,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Connection } from 'typeorm';
import { User } from '@/model';
import { Platform } from '@/model/organization-contact.entity';
import { AuthUser } from '@/types/request.types';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { createHash } from 'crypto';

interface CachedTokenData {
  userId: number;
  userUuid: string;
  sub: string;
  azp: string;
  exp: number;
}

@Injectable()
export class ActJwtGuard implements CanActivate {
  private jwksClient: JwksClient;

  constructor(
    private readonly connection: Connection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.jwksClient = new JwksClient({
      jwksUri:
        process.env.AUTH_CENTER_JWKS_URI ||
        'https://keycloak-dev.allkons.com/realms/allkons/protocol/openid-connect/certs',
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000, // 10 minutes
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    // Generate cache key from token hash (for security)
    const cacheKey = `guard:jwt:${this.hashToken(token)}`;

    // Try to get cached token data
    const cachedData: CachedTokenData | undefined = await this.cacheManager.get(
      cacheKey,
    );

    let decoded: any;
    let user: { id: number; uuid: string };

    if (cachedData) {
      // Cache hit: Use cached data
      user = {
        id: cachedData.userId,
        uuid: cachedData.userUuid,
      };
      decoded = {
        sub: cachedData.sub,
        azp: cachedData.azp,
        exp: cachedData.exp,
      };
    } else {
      // Cache miss: Verify token and query database
      try {
        decoded = await this.verifyToken(token);
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedException('Token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
          throw new UnauthorizedException('Invalid token');
        }
        console.error('[ActJwtGuard] Token verification error:', error);
        throw new UnauthorizedException('Token verification failed');
      }

      // Find user in database
      try {
        const userUuid = decoded.sub;
        // Use select to avoid loading enum array columns (businessType) which cause TypeORM hydration error
        user = await this.connection.getRepository(User).findOne({
          where: { uuid: userUuid },
          select: ['id', 'uuid'], // Only select needed columns
        });

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        // Cache the verified token + user data
        const tokenData: CachedTokenData = {
          userId: user.id,
          userUuid: user.uuid,
          sub: decoded.sub,
          azp: decoded.azp,
          exp: decoded.exp,
        };

        // Calculate TTL based on token expiry (but max 2 minutes)
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = decoded.exp - now;
        const ttl = Math.min(expiresIn, 120); // Max 2 minutes cache

        if (ttl > 0) {
          await this.cacheManager.set(cacheKey, tokenData, ttl);
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        console.error('[ActJwtGuard] Database error:', error);
        throw new InternalServerErrorException('Failed to verify user');
      }
    }

    // Attach user info to request
    const authUser: AuthUser = {
      id: user.id,
      uuid: user.uuid,
      sub: decoded.sub,
      azp: decoded.azp,
    };
    request.user = authUser;
    request.accessToken = token;

    // Determine platform from app-id header
    const appId = request.headers['app-id'];
    request.platform =
      appId === process.env.APP_ID_SELLER
        ? Platform.SELLER
        : appId === process.env.APP_ID_MARKETPLACE
        ? Platform.MARKETPLACE
        : Platform.BUYER;

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    // Try from cookie
    const accessToken = request.cookies?.accessToken;
    if (accessToken) {
      return accessToken;
    }

    // Try from Authorization header for Mobile / Service-to-Service / Testing (these not have cookie concept)
    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.split(' ')[1];
    }

    return undefined;
  }

  private async verifyToken(token: string): Promise<any> {
    // Decode header to get kid
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || typeof decodedHeader === 'string') {
      throw new jwt.JsonWebTokenError('Invalid token structure');
    }

    const kid = decodedHeader.header.kid;
    if (!kid) {
      throw new jwt.JsonWebTokenError('Token missing kid');
    }

    // Get signing key from JWKS
    const signingKey = await this.jwksClient.getSigningKey(kid);
    const publicKey = signingKey.getPublicKey();

    // Verify token
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    });
  }

  /**
   * Hash token for secure cache key
   * Using SHA256 to avoid storing raw tokens in cache
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
