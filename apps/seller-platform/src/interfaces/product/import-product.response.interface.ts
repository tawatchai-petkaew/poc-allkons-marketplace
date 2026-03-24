export interface IStatusCounts {
  ALL: number;
  VALIDATED: number;
  MATCHING: number;
  PENDING_REVIEW: number;
  COMPLETED: number;
  CANCELLED: number;
}

export interface IProductImportBatch {
  uuid: string;
  filename: string;
  totalRows: number;
  validationPassCount: number;
  validationFailCount: number;
  matchedCount: number;
  similarCount: number;
  notFoundCount: number;
  importedCount: number;
  notImportedCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  id?: string;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IBatchListResponse {
  items: IProductImportBatch[];
  statusCounts: IStatusCounts;
  pagination: IPagination;
}

export interface IBatchItemSuggestedProduct {
  id: number | string;
  name: string;
  imageUrl?: string;
  barcode?: string;
  brand?: string;
}

export interface IBatchItem {
  id: number | string;
  productName: string;
  barcode?: string;
  brand?: string;
  imageUrl?: string;
  regularPrice?: number;
  specialPrice?: number;
  specialPriceIncludeVat?: number;
  specialPriceExcludeVat?: number;
  priceType?: 'EXVAT' | 'INVAT';
  vatPercent?: number;
  specialPriceStartDate?: string;
  specialPriceEndDate?: string;
  requirePriceInquiry?: boolean;
  saleStatus?: 'SELLING' | 'NOT_FOR_SALE';
  importStatus?: 'VALIDATED' | 'MATCHING' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED';
  matchStatus?: 'IMPORTED' | 'FOUND' | 'SIMILAR' | 'NOT_FOUND';
  importType?: 'NEW' | 'UPDATE';
  matchedProductVariantId?: number | string;
  similarProduct?: IBatchItemSuggestedProduct;
  suggestedProducts?: IBatchItemSuggestedProduct[];
  reason?: string;
}

export interface IBatchItemListResponse {
  items: IBatchItem[];
  pagination: IPagination;
  batch?: IProductImportBatch;
}

export interface IDownloadOriginalResponse {
  filename: string;
  url: string;
  expiresIn: number;
}

export interface IDownloadMatchingResponse {
  success: boolean;
  filename: string;
}

export interface IImportProductExtractResult {
  pass: number;
  fail: number;
}

export interface IImportProductResponseUploadExtract {
  batchUuid: string;
  resultFileUrl?: string;
  result: IImportProductExtractResult;
}

export interface IImportProductResponseBatchAction {
  success?: boolean;
  message?: string;
}

export interface IImportProductResponseConfirmSimilar {
  success?: boolean;
}

export interface IImportProductResponseCheckVariantExistence {
  existingIds: string[];
  notExistingIds: string[];
}
