import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DataSource } from 'typeorm';
import { Merchant } from '@/model';
import { AuthUser, RequestMerchant } from '@/types/request.types';

/**
 * MerchantGuard
 *
 * Purpose: Fetch and validate merchant access for the current user
 *
 * Usage:
 * @UseGuards(ActJwtGuard, MerchantGuard)
 * @Get('products')
 * async getProducts(@CurrentMerchant() merchant: RequestMerchant) {
 *   // merchant is already validated and attached to request
 * }
 *
 * How it works:
 * 1. Extract merchant slug from route params or header
 * 2. Check cache for merchant access
 * 3. If cache miss: Verify user is a member of the merchant via DB
 * 4. Cache the result for 60 seconds
 * 5. Attach merchant to request object for downstream use
 */
@Injectable()
export class MerchantGuard implements CanActivate {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Extract merchant slug from route params or header
    const slug = request.params?.slug || request.headers['currentmerchantslug'];

    if (
      !slug ||
      slug === 'undefined' ||
      slug === 'null' ||
      slug.trim() === ''
    ) {
      throw new ForbiddenException('Merchant slug not provided');
    }

    // Generate cache key
    const cacheKey = `guard:merchant:access:${user.id}:${slug}`;

    // Try to get cached merchant access
    const cachedMerchant: RequestMerchant | undefined =
      await this.cacheManager.get(cacheKey);

    let merchant: RequestMerchant;

    if (cachedMerchant) {
      // Cache hit: Use cached merchant data
      merchant = cachedMerchant;
    } else {
      // Cache miss: Fetch merchant with membership validation
      // Guard only fetches minimal data for access control
      const result = await this.dataSource
        .getRepository(Merchant)
        .createQueryBuilder('merchant')
        .innerJoin(
          'user_merchants_merchant',
          'um',
          'um.merchantId = merchant.id AND um.userId = :userId',
          { userId: user.id },
        )
        .select([
          'merchant.id',
          'merchant.uuid',
          'merchant.slug',
          'merchant.status',
        ])
        .where('merchant.slug = :slug', { slug })
        .getOne();

      if (!result) {
        throw new NotFoundException(
          'Merchant not found or user is not a member of this merchant',
        );
      }

      merchant = {
        id: result.id,
        uuid: result.uuid,
        slug: result.slug,
      };

      // Cache the merchant access for 300 seconds (5min)
      await this.cacheManager.set(cacheKey, merchant, 300);
    }

    // Attach merchant to request for downstream use
    request.merchant = merchant;

    return true;
  }
}
