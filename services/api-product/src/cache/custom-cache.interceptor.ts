import { Merchant } from '@/model';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const cacheKey = super.trackBy(context);
    if (cacheKey) {
      const request = context.switchToHttp().getRequest();
      const merchant: Merchant = request.merchant;

      if (merchant === null || merchant === undefined) {
        return undefined;
      }

      const currentMerchantSlug = merchant.slug;
      const disablecache = request.headers['disablecache'];

      if (disablecache) {
        return undefined;
      }

      return `${cacheKey}_${currentMerchantSlug}`;
    }

    return undefined;
  }
}
