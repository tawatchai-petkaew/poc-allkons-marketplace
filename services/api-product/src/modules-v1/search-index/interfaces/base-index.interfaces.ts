/**
 * Base Index Configuration Interface
 *
 * All index types should implement this interface for consistency.
 */
export interface IndexConfig {
  /** Index name prefix (e.g., 'merchant-products', 'products') */
  indexPrefix: string;

  /** Alias name for the index */
  aliasName: string;

  /** Bulk operation batch size */
  bulkSize: number;

  /** Number of parallel workers for bulk operations */
  parallelWorkers: number;
}

/**
 * Base Search Document Interface
 *
 * Common fields shared across all index types.
 */
export interface BaseSearchDocument {
  id: number;
  productId: number;
  name: string;
  slug: string;
  sku: string | null;
  barcode: string | null;
  productStatus: string;
  variantStatus: string;
  minPrice: number;
  maxPrice: number;
  categoryId: number;
  categoryName: string;
  categoryPath: string;
  brandId: number | null;
  brandName: string | null;
  boostScore: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Index Type Enum
 */
export enum IndexType {
  /** Products available at specific merchants */
  MERCHANT_PRODUCT = 'merchant-product',

  /** All products in the system (global catalog) */
  PRODUCT = 'product',
}
