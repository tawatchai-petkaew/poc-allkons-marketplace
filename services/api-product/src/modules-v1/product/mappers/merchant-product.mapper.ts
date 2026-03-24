import { Logger } from '@nestjs/common';
import { MerchantProductDetailResponseDto } from '../dto/merchant-product-detail.dto';
import { MerchantProductRaw } from '../interfaces/merchant-product-raw.interface';
import {
  MerchantProductStatus,
  MerchantProductEntityStatus,
} from '@/model/merchant-product.entity';

const logger = new Logger('MerchantProductMapper');

/**
 * Safely parses the merchant product status
 */
export function parseMerchantProductStatus(
  status: unknown,
): MerchantProductStatus {
  const validStatuses = Object.values(MerchantProductStatus) as string[];
  if (typeof status === 'string' && validStatuses.includes(status)) {
    return status as MerchantProductStatus;
  }
  logger.warn(`Unknown merchantProductStatus found in DB: ${status}`);
  return MerchantProductStatus.SELLING;
}

/**
 * Safely parses the merchant product entity status (Active/Inactive)
 */
export function parseMerchantProductEntityStatus(
  status: unknown,
): MerchantProductEntityStatus | undefined {
  const validStatuses = Object.values(MerchantProductEntityStatus) as string[];
  if (typeof status === 'string' && validStatuses.includes(status)) {
    return status as MerchantProductEntityStatus;
  }
  if (status) {
    logger.warn(`Unknown status found in DB: ${status}`);
  }
  return undefined;
}

export function mapMerchantProductRawToDto(
  raw: MerchantProductRaw,
): MerchantProductDetailResponseDto {
  return {
    id: raw.id,
    barcode: raw.barcode ?? null,
    internalBarcode: raw.internalBarcode ?? null,
    salesUnit: raw.salesUnit ?? null,
    sku: raw.sku ?? null,
    productName: raw.productName ?? '',
    productGroupName: raw.productGroupName ?? null,
    videoUrl: raw.videoUrl ?? null,
    description: raw.description ?? null,
    customName: raw.customName ?? null,
    customDescription: raw.customDescription ?? null,
    useCustomDetails: raw.useCustomDetails ?? false,
    useCustomCoverImage: raw.useCustomCoverImage ?? false,
    useCustomMerchantImage: raw.useCustomMerchantImage ?? false,
    status: parseMerchantProductEntityStatus(raw.status),

    prepareDays: raw.prepareDays ?? 1,
    requirePriceInquiry: raw.requirePriceInquiry ?? false,
    productTypeId: raw.productTypeId ?? null,
    merchantProductStatus: parseMerchantProductStatus(
      raw.merchantProductStatus,
    ),

    specification: raw.specification ?? {
      series: null,
      model: null,
      tIS: null,
      material: null,
      guarantee: null,
    },

    package: raw.package ?? {
      shape: null,
      width: null,
      height: null,
      depth: null,
    },

    usage: raw.usage ?? {
      howToUse: null,
      suggestion: null,
      caution: null,
    },

    brand: raw.brand ?? null,

    price: raw.price ?? {
      priceVat: null,
      priceExcludeVat: null,
      priceIncludeVat: null,
      priceVatPercent: null,
      specialPriceVat: null,
      specialPriceExcludeVat: null,
      specialPriceIncludeVat: null,
      specialPriceVatPercent: null,
      startDate: null,
      endDate: null,
    },

    productCoverImage: raw.productCoverImage ?? null,

    userModify: raw.userModify ?? {
      updatedAt: null,
      updatedBy: null,
    },

    images: raw.images ?? {
      system: [],
      merchant: [],
    },

    tags: raw.tags ?? [],
    categories: raw.categories ?? [],
    documents: raw.documents ?? [],
    productDimensions: raw.productDimensions ?? [],
    attributes: raw.attributes ?? [],
  };
}
