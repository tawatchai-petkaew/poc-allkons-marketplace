import {
  MerchantProductStatus,
  MerchantProductEntityStatus,
} from '@/model/merchant-product.entity';

export interface MerchantProductRaw {
  id: number;
  barcode: string | null;
  internalBarcode: string | null;
  salesUnit: string | null;
  sku: string | null;
  productName: string | null;
  productGroupName: string | null;
  videoUrl: string | null;
  description: string | null;
  customName: string | null;
  customDescription: string | null;
  brand: string | null;
  status: MerchantProductEntityStatus | null;

  useCustomDetails: boolean;
  useCustomCoverImage: boolean;
  useCustomMerchantImage: boolean;

  prepareDays: number;
  requirePriceInquiry: boolean | null;
  productTypeId: number;
  merchantProductStatus: MerchantProductStatus;

  specification: {
    series: string | null;
    model: string | null;
    tIS: string | null;
    material: string | null;
    guarantee: string | null;
  };

  package: {
    shape: string | null;
    width: string | null; // e.g. "30 cm"
    height: string | null; // e.g. "42 cm"
    depth: string | null; // e.g. "10 cm"
  };

  usage: {
    howToUse: string | null;
    suggestion: string | null;
    caution: string | null;
  };

  price: {
    priceVat: number | null;
    priceExcludeVat: number | null;
    priceIncludeVat: number | null;
    priceVatPercent: number | null;
    specialPriceVat: number | null;
    specialPriceExcludeVat: number | null;
    specialPriceIncludeVat: number | null;
    specialPriceVatPercent: number | null;
    startDate: string | null;
    endDate: string | null;
  };

  productCoverImage: { id: number; url: string; name: string } | null;

  userModify: {
    updatedAt: string | null;
    updatedBy: string | null;
  };

  images: {
    system: Array<{ id: number; url: string; name: string }>;
    merchant: Array<{ id: number; url: string; name: string; order: number }>;
  };

  tags: string[];

  categories: Array<{ id: number; name: string }>;

  documents: Array<{ url: string; name: string; type: string }>;

  productDimensions: Array<{
    value: string;
    productDimensionMasterName: string;
  }>;

  attributes: Array<{
    stringValue: string | null;
    numberValue: number | null;
    name: string;
    attributeType: string;
  }>;
}

/** Row shape returned by dataSource.query() */
export interface MerchantProductQueryRow {
  result: MerchantProductRaw;
}
