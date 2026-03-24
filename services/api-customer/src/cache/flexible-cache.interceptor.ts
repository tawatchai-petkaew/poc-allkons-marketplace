import { CacheInterceptor, ExecutionContext, Injectable, CACHE_MANAGER, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROUTE_CACHE_KEY_BUILDER } from './cache-key-from.decorator';

@Injectable()
export class FlexibleCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: any,
    protected readonly reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const req = context.switchToHttp().getRequest();
    if (!req) return undefined;

    const disable = req.headers?.['x-disable-cache'];
    if (disable === '1' || disable === 'true') return undefined;

    const handler = context.getHandler();
    const builder = this.reflector.get<(req: any) => string | undefined>(
      ROUTE_CACHE_KEY_BUILDER,
      handler,
    );

    if (typeof builder === 'function') {
      return builder(req);
    }

    return undefined;
  }
}
