import { Merchant } from '@/model';
import { CacheInterceptor, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpPersonalCacheInterceptor extends CacheInterceptor {
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
      const token = request.headers['authorization'];

      if (disablecache || !token) {
        return undefined;
      }

      return `${cacheKey}_${currentMerchantSlug}_${token}`;
    }

    return undefined;
  }
}
