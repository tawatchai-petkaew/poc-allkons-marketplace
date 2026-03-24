/**
 * CDC Change Types
 */
export type ChangeOperation = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Entity types tracked by CDC
 */
export type TrackedEntityType =
  | 'product_variant'
  | 'product'
  | 'product_category'
  | 'merchant_product';

/**
 * Raw change from changes_queue table
 */
export interface RawChange {
  id: number;
  entityType: TrackedEntityType;
  entityId: number;
  operation: ChangeOperation;
  changedAt: Date;
}

/**
 * Aggregated change ready for queue
 */
export interface AggregatedChange {
  productVariantId: number;
  operations: ChangeOperation[];
  latestChangedAt: Date;
}

/**
 * Job data for sync queue
 */
export interface SyncJobData {
  productVariantIds: number[];
  priority: number;
  triggeredAt: string;
  source: 'cdc' | 'manual' | 'rebuild';
}

/**
 * Bulk rebuild job data
 */
export interface BulkRebuildJobData {
  batchSize: number;
  useBlueGreen: boolean;
  startedAt: string;
  triggeredBy: string;
}

/**
 * Product variant search data - optimized fetch result
 *
 * 🔧 FIX OLD PROBLEM: Single JOIN query returns this shape instead of N+1 queries
 */
export interface ProductVariantSearchData {
  // Variant
  id: number;
  productVariantAlias: string | null; // product_variant.alias
  sku: string | null;
  barcode: string | null;
  variantStatus: string;
  variantCreatedAt: Date;
  variantUpdatedAt: Date;

  // Product
  productId: number;
  productName: string; // product.name (original)
  productSlug: string;
  productStatus: string;
  minPrice: number;
  maxPrice: number;

  // Brand
  brandId: number | null;
  brandName: string | null;

  // Categories (flattened from join)
  // Categories (flattened from join)
  categoryId: number;
  categoryName: string;

  // Selling merchants
  sellingMerchantCount: number;
  merchantIds: number[];
}

/**
 * Category hierarchy for path building
 */
export interface CategoryHierarchy {
  id: number;
  name: string;
  parentId: number | null;
  level: number;
}

/**
 * Synonym mapping
 */
export interface SynonymMapping {
  term: string;
  synonyms: string[];
}

/**
 * Elasticsearch bulk operation result
 */
export interface BulkOperationResult {
  successful: number;
  failed: number;
  errors: Array<{
    id: number;
    error: string;
  }>;
  took: number;
}

/**
 * Index health status
 */
export interface IndexHealthStatus {
  indexName: string;
  aliasName: string;
  documentCount: number;
  sizeInBytes: number;
  health: 'green' | 'yellow' | 'red';
  isWritable: boolean;
}

/**
 * Search index metrics
 */
export interface SearchIndexMetrics {
  jobsProcessed: number;
  jobsFailed: number;
  averageProcessingTimeMs: number;
  cacheHitRate: number;
  queueDepth: number;
  lastProcessedAt: string | null;
}
