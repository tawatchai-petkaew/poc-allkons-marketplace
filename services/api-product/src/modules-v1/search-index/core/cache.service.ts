import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  L1_CACHE_TTL,
  L2_CACHE_TTL,
  CACHE_KEY_PRODUCT_VARIANT,
} from '../constants';

/**
 * Multi-Level Cache Service
 *
 * 🔧 FIX OLD PROBLEM:
 * - OLD: No caching, 10-15 DB queries per item
 * - NEW: 3-level cache hierarchy (L1 Memory → L2 Redis → L3 DB)
 *
 * Target: 80%+ cache hit rate, 85%+ reduction in DB queries
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  // L1: In-memory cache with LRU eviction
  private readonly l1Cache: Map<string, { value: unknown; expireAt: number }> =
    new Map();
  private readonly l1MaxSize = 10000;

  // Metrics
  private l1Hits = 0;
  private l2Hits = 0;
  private l3Hits = 0;
  private totalRequests = 0;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: unknown, // Will be typed when ioredis is installed
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get value from cache hierarchy
   * L1 → L2 → L3 (fetcher function)
   */
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // L1 Check (Memory)
    const l1Value = this.getFromL1<T>(key);
    if (l1Value !== undefined) {
      this.l1Hits++;
      return l1Value;
    }

    // L2 Check (Redis)
    const l2Value = await this.getFromL2<T>(key);
    if (l2Value !== undefined) {
      this.l2Hits++;
      // Populate L1
      this.setL1(key, l2Value, L1_CACHE_TTL);
      return l2Value;
    }

    // L3 Fallback (Database via fetcher)
    this.l3Hits++;
    const value = await fetcher();
    await this.set(key, value);
    return value;
  }

  /**
   * Set value in all cache levels
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const l1Ttl = ttlSeconds || L1_CACHE_TTL;
    const l2Ttl = ttlSeconds || L2_CACHE_TTL;

    // Set L1
    this.setL1(key, value, l1Ttl);

    // Set L2
    await this.setL2(key, value, l2Ttl);
  }

  /**
   * Invalidate key from all cache levels
   */
  async invalidate(key: string): Promise<void> {
    this.l1Cache.delete(key);
    // @ts-expect-error - Redis will be properly typed when installed
    await this.redis?.del?.(key);
  }

  /**
   * Invalidate all product variant caches for given IDs
   */
  async invalidateProductVariants(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.invalidate(`${CACHE_KEY_PRODUCT_VARIANT}${id}`);
    }
  }

  /**
   * Get cache hit rate statistics
   */
  getStats(): {
    l1HitRate: number;
    l2HitRate: number;
    l3HitRate: number;
    totalRequests: number;
  } {
    if (this.totalRequests === 0) {
      return { l1HitRate: 0, l2HitRate: 0, l3HitRate: 0, totalRequests: 0 };
    }

    return {
      l1HitRate: (this.l1Hits / this.totalRequests) * 100,
      l2HitRate: (this.l2Hits / this.totalRequests) * 100,
      l3HitRate: (this.l3Hits / this.totalRequests) * 100,
      totalRequests: this.totalRequests,
    };
  }

  /**
   * Clear all caches (for testing or maintenance)
   */
  async clearAll(): Promise<void> {
    this.l1Cache.clear();
    // @ts-expect-error - Redis will be properly typed when installed
    await this.redis?.flushdb?.();
    this.logger.warn('All caches cleared');
  }

  // ============ Private Methods ============

  private getFromL1<T>(key: string): T | undefined {
    const entry = this.l1Cache.get(key);
    if (!entry) return undefined;

    // Check expiration
    if (Date.now() > entry.expireAt) {
      this.l1Cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  private setL1<T>(key: string, value: T, ttlSeconds: number): void {
    // LRU eviction if at max size
    if (this.l1Cache.size >= this.l1MaxSize) {
      const firstKey = this.l1Cache.keys().next().value;
      if (firstKey) {
        this.l1Cache.delete(firstKey);
      }
    }

    this.l1Cache.set(key, {
      value,
      expireAt: Date.now() + ttlSeconds * 1000,
    });
  }

  private async getFromL2<T>(key: string): Promise<T | undefined> {
    try {
      // @ts-expect-error - Redis will be properly typed when installed
      const value = await this.redis?.get?.(key);
      if (!value) return undefined;
      return JSON.parse(value as string) as T;
    } catch (error) {
      this.logger.warn(`L2 cache get error for key ${key}: ${error}`);
      return undefined;
    }
  }

  private async setL2<T>(
    key: string,
    value: T,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      // @ts-expect-error - Redis will be properly typed when installed
      await this.redis?.setex?.(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.warn(`L2 cache set error for key ${key}: ${error}`);
    }
  }
}
