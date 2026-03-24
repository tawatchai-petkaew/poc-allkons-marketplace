/**
 * Add Product Feature - TypeScript Interfaces
 * Interfaces for checking duplicates and adding products to merchants
 */

// ============================================
// Common Nested Structures
// ============================================

export interface IImageUpload {
  id: number;
  url: string;
}

export interface IProductVariantImage {
  id: number;
  imageUpload: IImageUpload;
}

export interface IBrand {
  id: number;
  name: string;
  name_th?: string;
}

export interface ICategory {
  id: number;
  name: string;
  parentCategoryId?: string;
}

export interface IProduct {
  id: number;
  name?: string;
  brandId?: number;
  categoryId?: number;
  brand?: IBrand;
  category?: ICategory;
}

export interface IMerchantTranslation {
  id: number;
  name: string;
  locale: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IMerchant {
  id: number;
  uuid: string;
  slug: string;
  subdomainStatus: string;
  tel: string;
  email: string | null;
  keyword: string | null;
  status: string;
  domain: string | null;
  cisNumber: string;
  organizeId: number;
  customerStatus: string;
  merchantName: string;
  merchantBranchType: 'HEAD_OFFICE' | 'BRANCH';
  merchantBranchCode: string;
  relationshipTypeStore: string | null;
  storeId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  merchantLogo: string | null;
  merchantIcon: string | null;
  merchantTranslations: IMerchantTranslation[];
}

// ============================================
// Product Variant (Full Details)
// ============================================

export interface IProductVariant {
  id: number;
  alias: string;
  sku: string;
  d365Sku: string;
  d365ItemCode: string;
  barcode: string;
  internalBarcode: string;
  d365Barcode: string;
  internalBarcodD356: string;
  salesUnit: string;
  description: string;
  howToUseText: string;
  suggestionText: string;
  cautionText: string;
  urlVideo: string;
  series: string;
  model: string;
  material: string;
  tIS: string;
  guarantee: string;
  detailGuarantee: string;
  countryId: number | null;
  packageWidth: number | null;
  packageWidthUnit: string;
  packageHeight: number | null;
  packageHeightUnit: string;
  packageDepth: number | null;
  packageDepthUnit: string;
  packageShape: string;
  productWidth: number | null;
  productWidthUnit: string;
  productHeight: number | null;
  productHeightUnit: string;
  productDepth: number | null;
  productDepthUnit: string;
  grossWeight: number | null;
  grossWeightUnit: string;
  netWeight: number | null;
  netWeightUnit: string;
  productStatus: string;
  status: string;
  productId: number;
  createdBy: string;
  updatedBy: string;
  skuUuid: string;
  createdAt: string;
  updatedAt: string;
  productVariantImages: IProductVariantImage[];
  product: IProduct;
}

// ============================================
// Check Duplicate Products
// ============================================

// Simple product structure returned by check duplicate API
export interface ICheckDuplicateProductItem {
  id: string;
  alias: string;
  barcode: string;
  skuUuid: string;
  productVariantCategories?: Array<{
    category?: { name: string };
    brand?: { name_th: string };
  }>;
  productVariantImages?: Array<{
    imageUpload?: { url: string };
  }>;
}

// Simplified merchant structure from check duplicate API
export interface ICheckResultMerchant {
  uuid: string;
  merchantTranslations?: Array<{ name: string }>;
  merchantBranchType?: string;
}

export interface ICheckResultItem {
  merchant: ICheckResultMerchant;
  addableProducts: ICheckDuplicateProductItem[];
  duplicatedProducts: ICheckDuplicateProductItem[];
}

export interface ICheckDuplicateProductsResponse {
  statusCode: number;
  message: string;
  data: ICheckResultItem[];
}

// ============================================
// Add Products to Merchant
// ============================================

export interface IAddProductToMerchantPayload {
  merchantUuid: string;
  productVariantSkuUuids: string[];
}

export interface IMerchantProduct {
  id: number;
  merchantCustomName: string | null;
  description: string | null;
  imageUploadId: number | null;
  thumbnail: string | null;
  merchantId: number;
  productVariantId: number;
  quantity: number | null;
  startDate: string | null;
  endDate: string | null;
  isAcceptCash: boolean;
  isAcceptCredit: boolean;
  isAcceptPledge: boolean;
  isAcceptCod: boolean;
  isAcceptCreditCard: boolean;
  merchantProductStatus: string;
  productTypeId: number;
  status: string;
  priceVat: number | null;
  priceExcludeVat: number | null;
  priceVatPercent: number | null;
  priceIncludeVat: number | null;
  specialPriceVat: number | null;
  specialPriceIncludeVat: number | null;
  specialPriceExcludeVat: number | null;
  specialPriceVatPercent: number | null;
  prepareDays: number;
  requirePriceInquiry: boolean;
  useCustomDetails: boolean;
  useCustomCoverImage: boolean;
  useCustomMerchantImage: boolean;
  productCoverImage: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IAddProductToMerchantResponse {
  statusCode: number;
  message: string;
  data: IMerchantProduct[];
}
