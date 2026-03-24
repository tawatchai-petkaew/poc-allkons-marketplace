import {
  IRequestQueryCreateProduct,
  IRequestQueryProductMerchant,
  IRequestAddProductToMerchant,
  IRequestCheckDuplicateProduct,
  IRequestUpdateMerchantProducts,
  IRequestExportProducts,
} from "@/interfaces/product/product.request.interface";
import {
  IMerchantProductCountResponse,
  IProductResponseListResponse,
  IProductMasterDataResponse,
  IProductVariantImageResponse,
  IProductImportResponse,
  IMerchantCheckResult,
  IAddProductToMerchantResponse,
  IProductExportResponse,
} from "@/interfaces/product/product.response.interface";
import { productAPI } from "@/libs/axios";
import { ApiResponse } from "@/types/common.type";

export const getMerchantProducts = async (
  merchantSlug: string,
  params: IRequestQueryProductMerchant,
) => {
  const response = await productAPI.get<
    ApiResponse<IProductResponseListResponse>
  >(`/v1/product`, {
    headers: {
      CurrentMerchantSlug: merchantSlug,
    },
    params: {
      page: params.page,
      pageLimit: params.pageLimit,
      search: params.search,
      searchType: params.searchType,
      productTypeId: params.productTypeId,
      categoryIds: params.categoryIds,
      merchantProductStatus: params.merchantProductStatus,
    },
  });

  return response.data;
};

export const getMerchantsProductCount = async (merchantSlug: string) => {
  const response = await productAPI.get<
    ApiResponse<IMerchantProductCountResponse>
  >(`/v1/product/status-count`, {
    headers: {
      CurrentMerchantSlug: merchantSlug,
    },
  });
  return response.data;
};

export const getMasterDataProduct = async (type: string) => {
  const response = await productAPI.get<
    ApiResponse<IProductMasterDataResponse[]>
  >(`/v1/master-data`, {
    params: {
      type: type,
    },
  });

  return response.data;
};

export const getProductVariantImages = async (
  merchantSlug: string,
  productVariantIds: string,
) => {
  const response = await productAPI.get<
    ApiResponse<IProductVariantImageResponse[]>
  >(`/v1/product/variant-images`, {
    headers: {
      CurrentMerchantSlug: merchantSlug,
    },
    params: {
      productVariantIds: productVariantIds,
    },
  });

  return response.data;
};

export const getProductImport = async (
  merchantSlug: string,
  params: IRequestQueryCreateProduct,
) => {
  const response = await productAPI.get<ApiResponse<IProductImportResponse>>(
    `/v1/product/product-import`,
    {
      headers: {
        CurrentMerchantSlug: merchantSlug,
      },
      params: {
        page: params.page,
        pageLimit: params.pageLimit,
        search: params.search,
        searchType: params.searchType,
      },
    },
  );

  return response.data;
};

/**
 * Export products to Excel file
 * Downloads products data as Excel file based on current filters
 */
export const exportProducts = async (
  merchantSlug: string,
  filters?: IRequestExportProducts,
): Promise<IProductExportResponse> => {
  const response = await productAPI.get<ApiResponse<IProductExportResponse>>(
    `/v1/product/export`,
    {
      headers: {
        CurrentMerchantSlug: merchantSlug,
        'x-response-type': 'arraybuffer',
      },
      params: filters,
      responseType: "arraybuffer",
      timeout: 120000,
    },
  );

  const contentDisposition = response.headers["content-disposition"] as string;
  let filename = "products_export.xlsx";

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
    if (filenameMatch) {
      filename = decodeURIComponent(filenameMatch[1]);
    } else {
      const regularMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (regularMatch) {
        filename = regularMatch[1];
      }
    }
  }

  const blob = new Blob([response.data as unknown as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return { success: true, filename };
};

/**
 * Check if products already exist in merchant's product list
 * Used before adding products to prevent duplicates
 */
export const checkDuplicateProducts = async (
  merchantSlug: string,
  payload: IRequestCheckDuplicateProduct,
) => {
  const response = await productAPI.post<
    ApiResponse<IMerchantCheckResult[]>
  >(`/v1/product/check-duplicate-merchant-product`, payload, {
    headers: {
      CurrentMerchantSlug: merchantSlug,
    },
  });

  return response.data;
};

/**
 * Add selected products from system to merchant's product list
 * Returns count of products added
 */
export const addProductsToMerchant = async (
  merchantSlug: string,
  payload: IRequestAddProductToMerchant,
) => {
  const response = await productAPI.post<
    ApiResponse<IAddProductToMerchantResponse>
  >(`/v1/product/merchant-product`, payload, {
    headers: {
      CurrentMerchantSlug: merchantSlug,
    },
  });

  return response.data;
};


