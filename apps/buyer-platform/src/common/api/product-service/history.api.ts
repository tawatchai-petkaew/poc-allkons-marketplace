import { productAPI } from '@/utils/axios';
import {
  addHistorySearchProductInterface,
  deleteHistorySearchProductInterface,
} from '@/common/interfaces/HistorySearchProduct.interface';

export const getHistorySearchProduct = async () => {
  const { data: responseData } = await productAPI.get(
    `v1/history/search/products/by-user`
  );
  return responseData;
};

export const addHistorySearchProduct = async (
  body: addHistorySearchProductInterface
) => {
  const { data: responseData } = await productAPI.post(
    `v1/history/search/products/by-user`,
    body
  );
  return responseData;
};

export const deleteHistorySearchProduct = async (
  body: deleteHistorySearchProductInterface
) => {
  const { data: responseData } = await productAPI.delete(
    `v1/history/search/products/by-user`,
    { data: body }
  );
  return responseData;
};

export const deleteHistorySearchProductAll = async () => {
  const { data: responseData } = await productAPI.delete(
    `v1/history/search/products/by-user/search-all`
  );
  return responseData;
};
