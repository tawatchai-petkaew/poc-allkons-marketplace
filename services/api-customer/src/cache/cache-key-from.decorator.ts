import { SetMetadata } from '@nestjs/common';

export const ROUTE_CACHE_KEY_BUILDER = 'route_cache_key_builder';

export type CacheKeyBuilder = (req: any) => string | undefined;

export function CacheKeyFrom(builder: CacheKeyBuilder) {
  return SetMetadata(ROUTE_CACHE_KEY_BUILDER, builder);
}
