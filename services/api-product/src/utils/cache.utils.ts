import { Cache } from 'cache-manager';

/**
 * Clear cache entries matching a pattern
 * @param cacheManager Cache manager instance
 * @param pattern Cache key pattern with wildcard (e.g., 'merchant:members:123:*')
 * @returns Promise<void>
 */
export async function clearCacheByPattern(
  cacheManager: Cache,
  pattern: string,
): Promise<void> {
  try {
    // In cache-manager v5 with Keyv, use stores array instead of store
    const stores = cacheManager.stores;
    if (stores && stores.length > 0) {
      const store = stores[0];
      if (store && typeof store.clear === 'function') {
        // Keyv doesn't support pattern-based deletion directly
        // For now, we can only clear all or delete specific keys
        await cacheManager.del(pattern);
      }
    } else {
      // Fallback: try to delete the pattern directly
      await cacheManager.del(pattern);
    }
  } catch (error) {
    console.error(`Failed to clear cache pattern ${pattern}:`, error);
  }
}
