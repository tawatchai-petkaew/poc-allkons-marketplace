export interface IRequestQueryProductMerchant {
  page: number;
  pageLimit: number;
  search?: string;
  searchType?: string;
  productTypeId?: number;
  categoryIds?: string;
  merchantProductStatus?: string;
}

export interface IRequestQueryCreateProduct {
  page: number;
  pageLimit: number;
  search?: string;
  searchType?: string;
}

export interface IRequestAddProductToMerchantItem {
  productVariantSkuUuids: string[];
  merchantUuid: string;
}

export type IRequestAddProductToMerchant = IRequestAddProductToMerchantItem[];

export interface IRequestCheckDuplicateProduct {
  productVariantSkuUuids: string[];
  merchantUuids: string[];
}

export interface IRequestUpdateMerchantProductItem {
  id: number;
  priceIncludeVat?: number;
  priceExcludeVat?: number;
  specialPriceIncludeVat?: number;
  specialPriceExcludeVat?: number;
  prepareDays?: number;
  startDate?: string;
  endDate?: string;
  requirePriceInquiry?: boolean;
}

export interface IRequestUpdateMerchantProducts {
  products: IRequestUpdateMerchantProductItem[];
}

export interface IRequestExportProducts {
  search?: string;
  searchType?: string;
  productTypeId?: number;
  categoryIds?: string;
  merchantProductStatus?: string;
  priceType?: string;
}
