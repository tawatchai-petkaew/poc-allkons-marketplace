/**
 * Product Storage Utilities
 * Manages product data persistence for pricing page navigation
 */

import { IProductResponseMerchantProduct } from "@/interfaces/product/product.response.interface";
import { STORAGE_KEYS } from "../constants/products.constants";

interface ExtractedProductData {
  id: number;
  productVariantId: number;
  productVariantAlias: string;
  barcode: string;
  brandName: string;
  categoryName: string;
  priceIncludeVat: number | null;
  priceExcludeVat: number | null;
  specialPriceIncludeVat: number | null;
  specialPriceExcludeVat: number | null;
  priceVatPercent: number | null;
  specialPriceVatPercent: number | null;
  prepareDays: number | null;
  productType: string;
  thumbnail: string | null;
}

/**
 * Extract minimal product data for storage
 * Reduces payload size in sessionStorage
 */
export const extractProductData = (
  products: IProductResponseMerchantProduct[]
): ExtractedProductData[] => {
  return products.map((product) => ({
    id: product.id,
    productVariantId: product.productVariant?.id || 0,
    productVariantAlias: product.productVariant?.alias || "",
    barcode: product.productVariant?.barcode || "",
    brandName: product.productVariant?.product?.brand?.name || "",
    categoryName: product.productVariant?.product?.category?.name || "",
    priceIncludeVat: product.priceIncludeVat,
    priceExcludeVat: product.priceExcludeVat,
    specialPriceIncludeVat: product.specialPriceIncludeVat,
    specialPriceExcludeVat: product.specialPriceExcludeVat,
    priceVatPercent: product.priceVatPercent,
    specialPriceVatPercent: product.specialPriceVatPercent,
    prepareDays: product.prepareDays,
    productType: product.productType?.name_th || product.productType?.name || "",
    thumbnail: product.thumbnail,
  }));
};

/**
 * Store selected products to sessionStorage for pricing page
 */
export const storeSelectedProducts = (
  products: IProductResponseMerchantProduct[]
): void => {
  try {
    const extractedData = extractProductData(products);
    sessionStorage.setItem(
      STORAGE_KEYS.SELECTED_PRODUCT_DATA,
      JSON.stringify(extractedData)
    );
  } catch (error) {
    console.error("Failed to store selected products:", error);
  }
};

/**
 * Retrieve selected product data from sessionStorage
 */
export const getSelectedProductData = (): ExtractedProductData[] | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.SELECTED_PRODUCT_DATA);
    if (!stored) return null;

    return JSON.parse(stored) as ExtractedProductData[];
  } catch (error) {
    console.error("Failed to retrieve selected products:", error);
    return null;
  }
};

/**
 * Clear all product selection storage
 */
export const clearSelectedProducts = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PRODUCT_ROW_KEYS);
    sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PRODUCT_CACHE);
    sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PRODUCT_VARIANT_IDS);
    sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PRODUCT_DATA);
  } catch (error) {
    console.error("Failed to clear selected products:", error);
  }
};
