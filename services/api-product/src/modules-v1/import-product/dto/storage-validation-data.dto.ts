import { PriceType, SaleStatus } from '@/model/import-product-item.entity';

/**
 * Simplified row data structure optimized for storage and matching
 * This is the data that will be stored in S3 validation JSON
 */
export interface ImportItemData {
  barcode: string | null;
  brand: string | null;
  productName: string | null;
  priceType: PriceType | null;
  regularPrice: number | null;
  specialPrice: number | null;
  vatPercent: number | null;
  specialPriceStartDate: Date | null;
  specialPriceEndDate: Date | null;
  requirePriceInquiry: boolean;
  saleStatus: SaleStatus | null;
}

/**
 * Simplified row structure for S3 storage
 */
export interface StorageValidationRow {
  rowNo: number;
  isValid: boolean;
  data: ImportItemData;
}

/**
 * Root structure for validation JSON stored in S3
 */
export interface StorageValidationData {
  rows: StorageValidationRow[];
}
