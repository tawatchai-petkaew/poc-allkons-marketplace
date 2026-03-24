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
    const store = cacheManager.store;
    if (typeof store.keys === 'function') {
      const keys = await store.keys(pattern);
      await Promise.all(keys.map((key: string) => cacheManager.del(key)));
    } else {
      // Fallback: try to delete the pattern directly
      await cacheManager.del(pattern);
    }
  } catch (error) {
    console.error(`Failed to clear cache pattern ${pattern}:`, error);
  }
}
