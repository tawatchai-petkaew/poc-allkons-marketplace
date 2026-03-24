import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductVariantSearchData, CategoryHierarchy } from '../../interfaces';
import { CacheService } from '../../core';
import { CACHE_KEY_PRODUCT_VARIANT } from '../../constants';

/**
 * Data Fetcher Service
 *
 * 🔧 FIX OLD PROBLEM:
 * - OLD: N+1 queries (10-15 queries per item)
 * - NEW: Single optimized JOIN query for all data
 *
 * Key Features:
 * - Single query with all necessary JOINs
 * - Query caching enabled
 * - Multi-level cache integration
 * - Supports batch fetching
 */
@Injectable()
export class DataFetcherService {
  private readonly logger = new Logger(DataFetcherService.name);

  // Category hierarchy cache (built once, in-memory)
  private categoryHierarchy: Map<number, CategoryHierarchy> = new Map();
  private categoryHierarchyLoadedAt: Date | null = null;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Fetch product variants with all related data in a single query
   * 🔧 FIX: Replaces 10-15 N+1 queries with one optimized query
   */
  async fetchProductVariants(
    ids: number[],
  ): Promise<ProductVariantSearchData[]> {
    if (ids.length === 0) {
      return [];
    }

    // Try cache first
    const cached: ProductVariantSearchData[] = [];
    const uncachedIds: number[] = [];

    for (const id of ids) {
      const cacheKey = `${CACHE_KEY_PRODUCT_VARIANT}${id}`;
      const cachedData = await this.cacheService.get<ProductVariantSearchData>(
        cacheKey,
        async () => {
          // This will be called if not in cache
          return null as unknown as ProductVariantSearchData;
        },
      );

      if (cachedData) {
        cached.push(cachedData);
      } else {
        uncachedIds.push(id);
      }
    }

    if (uncachedIds.length === 0) {
      return cached;
    }

    // Fetch uncached data with optimized query
    const freshData = await this.fetchFromDatabase(uncachedIds);

    // Cache the fresh data
    for (const data of freshData) {
      const cacheKey = `${CACHE_KEY_PRODUCT_VARIANT}${data.id}`;
      await this.cacheService.set(cacheKey, data);
    }

    return [...cached, ...freshData];
  }

  /**
   * Optimized database query with all necessary JOINs
   * 🔧 FIX: Single query replaces multiple sequential queries
   */
  private async fetchFromDatabase(
    ids: number[],
  ): Promise<ProductVariantSearchData[]> {
    // Build the optimized query
    const query = `
      WITH variant_data AS (
        SELECT 
          pv.id,
          pv.alias,
          pv.sku,
          pv.barcode,
          pv.status as variant_status,
          pv."createdAt" as variant_created_at,
          pv."updatedAt" as variant_updated_at,
          p.id as product_id,
          p.name as product_name,
          p.slug as product_slug,
          p.status as product_status,
          b.id as brand_id,
          b.name as brand_name,
          c.id as product_category_id,
          c.name as product_category_name
        FROM product_variant pv
        LEFT JOIN product p ON pv."productId" = p.id
        LEFT JOIN brand b ON p."brandId" = b.id
        LEFT JOIN category c ON p."categoryId" = c.id
        WHERE pv.id = ANY($1)
      ),
      variant_merchants AS (
        SELECT 
          mp."productVariantId",
          COUNT(DISTINCT mp."merchantId") as selling_merchant_count,
          array_agg(DISTINCT mp."merchantId") as merchant_ids,
          
          -- Calculate Min/Max Price dynamically
          MIN(
            CASE
              WHEN mp."specialPriceIncludeVat" IS NOT NULL AND (
                (mp."startDate" IS NULL AND mp."endDate" IS NULL) OR
                (NOW() BETWEEN mp."startDate" AND mp."endDate")
              ) THEN mp."specialPriceIncludeVat"
              ELSE mp."priceIncludeVat"
            END
          ) as min_price,
          MAX(
            CASE
              WHEN mp."specialPriceIncludeVat" IS NOT NULL AND (
                (mp."startDate" IS NULL AND mp."endDate" IS NULL) OR
                (NOW() BETWEEN mp."startDate" AND mp."endDate")
              ) THEN mp."specialPriceIncludeVat"
              ELSE mp."priceIncludeVat"
            END
          ) as max_price
          
        FROM merchant_product mp
        WHERE mp."productVariantId" = ANY($1)
          AND mp.status = 'Active'
          AND mp."merchantProductStatus" = 'Selling'
        GROUP BY mp."productVariantId"
      )
      SELECT 
        vd.*,
        
        -- Map simple category to single value
        vd.product_category_id as category_id,
        vd.product_category_name as category_name,
        
        -- INNER JOIN guarantees these values exist (not NULL)
        vm.selling_merchant_count,
        vm.merchant_ids,
        vm.min_price,
        vm.max_price
      FROM variant_data vd
      -- INNER JOIN: Only include variants that have at least one merchant selling
      INNER JOIN variant_merchants vm ON vd.id = vm."productVariantId"
    `;

    const results = await this.dataSource.query(query, [ids]);

    return results.map(this.mapToSearchData);
  }

  /**
   * Map raw database result to ProductVariantSearchData
   */
  private mapToSearchData(
    row: Record<string, unknown>,
  ): ProductVariantSearchData {
    return {
      id: row.id as number,
      productVariantAlias: row.alias as string | null,
      sku: row.sku as string | null,
      barcode: row.barcode as string | null,
      variantStatus: row.variant_status as string,
      variantCreatedAt: row.variant_created_at
        ? new Date(row.variant_created_at as string | Date)
        : new Date(),
      variantUpdatedAt: row.variant_updated_at
        ? new Date(row.variant_updated_at as string | Date)
        : new Date(),
      productId: row.product_id as number,
      productName: row.product_name as string,
      productSlug: row.product_slug as string,
      productStatus: row.product_status as string,
      minPrice: parseFloat(row.min_price as string) || 0,
      maxPrice: parseFloat(row.max_price as string) || 0,
      brandId: row.brand_id as number | null,
      brandName: row.brand_name as string | null,
      categoryId: row.category_id as number,
      categoryName: row.category_name as string,
      sellingMerchantCount:
        parseInt(row.selling_merchant_count as string, 10) || 0,
      merchantIds: row.merchant_ids as number[],
    };
  }

  /**
   * Load category hierarchy for path building
   */
  async loadCategoryHierarchy(): Promise<void> {
    const categories = await this.dataSource.query(`
      SELECT id, name, "parentCategoryId" as parent_id, 0 as level
      FROM category
      WHERE status = 'Active'
      ORDER BY id
    `);

    this.categoryHierarchy.clear();
    for (const cat of categories) {
      this.categoryHierarchy.set(cat.id, {
        id: cat.id,
        name: cat.name || '',
        parentId: cat.parent_id ? parseInt(cat.parent_id, 10) : null,
        level: cat.level,
      });
    }

    this.categoryHierarchyLoadedAt = new Date();
    this.logger.log(`Loaded ${this.categoryHierarchy.size} categories`);
  }

  /**
   * Build category path string (e.g., "Electronics > Phones > Smartphones")
   */
  buildCategoryPath(categoryId: number): string {
    const path: string[] = [];
    let currentId: number | null = categoryId;

    while (currentId) {
      const category = this.categoryHierarchy.get(currentId);
      if (!category) break;
      path.unshift(category.name);
      currentId = category.parentId;
    }

    return path.join(' > ');
  }

  /**
   * Get all category paths for an array of category IDs
   */
  getCategoryPaths(categoryIds: number[]): string[] {
    return categoryIds.map((id) => this.buildCategoryPath(id));
  }

  /**
   * Ensure category hierarchy is loaded
   */
  async ensureCategoryHierarchy(): Promise<void> {
    if (!this.categoryHierarchyLoadedAt) {
      await this.loadCategoryHierarchy();
    }
  }

  /**
   * Get all active product variant IDs for full rebuild
   * Only includes variants that have at least one merchant actively selling
   */
  async getAllActiveProductVariantIds(): Promise<number[]> {
    const results = await this.dataSource.query(`
      SELECT DISTINCT pv.id
      FROM product_variant pv
      JOIN product p ON pv."productId" = p.id
      -- Only include variants that have active selling merchants
      JOIN merchant_product mp ON mp."productVariantId" = pv.id
        AND mp.status = 'Active'
        AND mp."merchantProductStatus" = 'Selling'
      WHERE pv.status = 'Active'
        AND p.status = 'Active'
      ORDER BY pv.id
    `);

    return results.map((r: { id: number }) => r.id);
  }
}
