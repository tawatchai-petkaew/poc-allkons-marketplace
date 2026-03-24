import { productAPI } from "@/libs/axios";
import type { ApiResponse } from "@/types/common.type";
import type {
  IRequestQueryBatchList,
  IRequestQueryBatchItemList,
  IImportProductRequestConfirmSimilarPayloadItem,
} from "@/interfaces/product/import-product.request.interface";
import type {
  IBatchListResponse,
  IBatchItemListResponse,
  IDownloadOriginalResponse,
  IDownloadMatchingResponse,
  IImportProductResponseUploadExtract,
  IImportProductResponseBatchAction,
  IImportProductResponseConfirmSimilar,
  IImportProductResponseCheckVariantExistence,
} from "@/interfaces/product/import-product.response.interface";

export const downloadImportProductTemplate = async () => {
  const response = await productAPI.get<ArrayBuffer>(
    "/v1/templates/import-product/download",
    {
      responseType: "arraybuffer",
      headers: {
        "x-response-type": "arraybuffer",
      },
    },
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "product_template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return { success: true };
};

export const uploadProductImportFile = async (data: FormData) => {
  const response = await productAPI.post<
    ApiResponse<IImportProductResponseUploadExtract>
  >("/v1/import-product/extract-excel", data, {
    timeout: 120000, // 2 minutes
  });
  return response.data;
};

export const startMatchingProducts = async (batchUuid: string) => {
  const response = await productAPI.post<
    ApiResponse<IImportProductResponseBatchAction>
  >(`/v1/import-product/batches/${batchUuid}/start-matching`);
  return response.data;
};

export const searchBatchList = async (params: IRequestQueryBatchList) => {
  const response = await productAPI.get<ApiResponse<IBatchListResponse>>(
    `/v1/import-product/batches`,
    { params },
  );
  return response.data;
};

export const searchBatchItemList = async (
  batchUuid: string,
  params: IRequestQueryBatchItemList,
) => {
  const response = await productAPI.get<ApiResponse<IBatchItemListResponse>>(
    `/v1/import-product/batch/${batchUuid}/items`,
    { params },
  );
  return response.data;
};

export const deleteBatch = async (batchUuid: string) => {
  const response = await productAPI.delete<
    ApiResponse<IImportProductResponseBatchAction>
  >(`/v1/import-product/batches/${batchUuid}`);
  return response.data;
};

export const completeBatch = async (batchUuid: string) => {
  const response = await productAPI.post<
    ApiResponse<IImportProductResponseBatchAction>
  >(`/v1/import-product/batches/${batchUuid}/complete`);
  return response.data;
};

export const confirmImport = async (batchUuid: string) => {
  // TODO: Enable when API is ready
  console.warn(
    `[confirmImport] API not implemented yet for batch ${batchUuid}, returning mock data`,
  );
  return new Promise<{ success: boolean; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Mock: Confirm import success" });
    }, 500);
  });
};

export const downloadOriginalFile = async (batchUuid: string) => {
  const response = await productAPI.get<ApiResponse<IDownloadOriginalResponse>>(
    `/v1/import-product/batches/${batchUuid}/original-file`,
  );
  return response.data;
};

export const downloadMatchingResult = async (batchUuid: string) => {
  const response = await productAPI.get<ApiResponse<ArrayBuffer>>(
    `/v1/import-product/batch/${batchUuid}/export`,
    {
      responseType: "arraybuffer",
      headers: {
        "x-response-type": "arraybuffer",
      },
      timeout: 120000,
    },
  );

  const contentDisposition = response.headers["content-disposition"] as
    | string
    | undefined;
  let filename = `matching_result_${batchUuid}.xlsx`;

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

  return { success: true, filename } as IDownloadMatchingResponse;
};

export const cancelBatch = async (batchUuid: string) => {
  const response = await productAPI.post<
    ApiResponse<IImportProductResponseBatchAction>
  >(`/v1/import-product/batches/${batchUuid}/cancel`);
  return response.data;
};

export const confirmMatchingSimilar = async (
  batchUuid: string,
  items: IImportProductRequestConfirmSimilarPayloadItem[],
) => {
  const response = await productAPI.post<
    ApiResponse<IImportProductResponseConfirmSimilar>
  >(`/v1/import-product/batch/${batchUuid}/items/matching-similar`, { items });
  return response.data;
};

export const checkVariantExistence = async (productVariantIds: string[]) => {
  const response = await productAPI.post<
    ApiResponse<IImportProductResponseCheckVariantExistence>
  >("/v1/product/check-variant-existence", {
    productVariantIds,
  });
  return response.data;
};
