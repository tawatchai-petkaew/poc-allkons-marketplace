export interface IRequestQueryBatchList {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export interface IRequestQueryBatchItemList {
  page: number;
  limit: number;
  search?: string;
  matchStatus?: string;
}

export interface IImportProductRequestConfirmSimilarItem {
  itemId: number;
  productVariantId: number;
}

export interface IImportProductRequestRejectSimilarItem {
  itemId: number;
  reason: string;
}

export type IImportProductRequestConfirmSimilarPayloadItem =
  | IImportProductRequestConfirmSimilarItem
  | IImportProductRequestRejectSimilarItem;

export interface IImportProductRequestCheckVariantExistencePayload {
  productVariantIds: string[];
}
