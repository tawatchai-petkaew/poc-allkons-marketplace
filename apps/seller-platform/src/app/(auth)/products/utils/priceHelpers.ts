/**
 * Price Calculation and Formatting Helpers
 */

import type { PriceDisplayMode } from "../constants/products.constants";
import { formatNumber } from "@/utils/format";

interface IPriceHelpers {
  shouldShowVatExempt: boolean;
  shouldShowVatDetails: boolean;
  getMainPrice: () => string;
  getAlternatePrice: () => string;
  getVatAmount: () => string;
  vatPercent: number | null;
}

/**
 * Format discount percentage — whole numbers show no decimals, fractional values show exactly 2.
 * e.g. 50.098 → "50.10", 50 → "50", 0 → "0"
 */
export const formatDiscount = (num: number): string => {
  const rounded = Math.round(num * 100) / 100;
  if (rounded === Math.floor(rounded)) {
    return rounded.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return rounded.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format VAT percentage — removes trailing zeros.
 * e.g. 7.0 → "7", 7.5 → "7.5", 0 → "0"
 */
export const formatVatPercent = (vatPercent: number | null | undefined): string => {
  if (vatPercent == null) return "0";
  return parseFloat(Number(vatPercent).toFixed(2)).toString();
};

/**
 * Get price helpers for display in the products table.
 * Matches logic from allkons-marketplace-seller Products.jsx getPriceHelpers.
 *
 * @param priceIncludeVat - Price including VAT (null = ไม่ระบุ, 0 = 0.00)
 * @param priceExcludeVat - Price excluding VAT
 * @param priceVatPercent - VAT percentage (null = ยกเว้นภาษี)
 * @param isRegular - true for regular price, false for special price
 * @param priceDisplayMode - Display mode (with-vat or without-vat)
 * @param showVatDetails - Whether to show VAT detail rows
 */
export const getPriceHelpers = (
  priceIncludeVat: number | null,
  priceExcludeVat: number | null,
  priceVatPercent: number | null,
  isRegular: boolean,
  priceDisplayMode: PriceDisplayMode,
  showVatDetails: boolean
): IPriceHelpers => {
  const hasPrice = priceIncludeVat != null || priceExcludeVat != null;

  // VAT exempt when vatPercent is null/undefined only (not 0)
  const isVatExempt = priceVatPercent == null;
  const shouldShowVatExempt = hasPrice && isVatExempt;
  const shouldShowVatDetails = hasPrice && showVatDetails;

  const DEFAULT_PRICE = "ไม่ระบุ";

  const getMainPrice = (): string => {
    if (priceDisplayMode === "with-vat") {
      if (priceIncludeVat == null) return DEFAULT_PRICE;
      return formatNumber(priceIncludeVat, 2);
    }
    if (priceExcludeVat == null) return DEFAULT_PRICE;
    return formatNumber(priceExcludeVat, 2);
  };

  const getAlternatePrice = (): string => {
    if (priceDisplayMode === "with-vat") {
      if (priceExcludeVat == null) return isRegular ? "Ex Vat -" : "";
      return `Ex Vat ${formatNumber(priceExcludeVat, 2)}`;
    }
    if (priceIncludeVat == null) return isRegular ? "In Vat -" : "";
    return `In Vat ${formatNumber(priceIncludeVat, 2)}`;
  };

  const getVatAmount = (): string => {
    if (priceExcludeVat != null && priceIncludeVat != null) {
      return formatNumber(priceIncludeVat - priceExcludeVat, 2);
    }
    return "-";
  };

  return {
    shouldShowVatExempt,
    shouldShowVatDetails,
    getMainPrice,
    getAlternatePrice,
    getVatAmount,
    vatPercent: priceVatPercent,
  };
};

/**
 * Validate if price is valid
 */
export const isValidPrice = (price: number | null): boolean => {
  return price !== null && price !== undefined && price > 0;
};
