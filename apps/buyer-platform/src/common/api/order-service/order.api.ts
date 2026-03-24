import { IOrderRequest } from '@/common/interfaces/order.interface';
import { orderAPI } from '../../../utils/axios';
import Cookies from 'js-cookie';
// import { useMerchantSlug } from "@/hooks/useMerchantSlug";
import { IDefaultQueryPagination } from '@/common/interfaces/common.interface';
import { SubOrderStatus } from '@/common/enum/suborder.enum';

const prefix = '/order';
const auth = Cookies.get('auth');
const authData = auth ? JSON.parse(auth) : null;
export interface IQueryOrder extends IDefaultQueryPagination {
  suborderStatus?: SubOrderStatus;
}

export const createOrder = async (data: IOrderRequest) => {
  const { data: responseData } = await orderAPI.post(`${prefix}`, data, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return responseData;
};

export const getOrderById = async (orderId: number) => {
  const { data: responseData } = await orderAPI.get(`${prefix}/${orderId}`, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return responseData;
};

export const getAllOrders = async (params: IQueryOrder) => {
  const { data } = await orderAPI.get(
    `${prefix}?page=${params.page}&pageLimit=${params.pageLimit}${
      params.suborderStatus ? `&subOrderStatus=${params.suborderStatus}` : ''
    }`,
    {
      headers: {
        Authorization: `Bearer ${authData?.accessToken}`,
      },
    }
  );
  return data;
};

export const getOrderCounts = async () => {
  const { data } = await orderAPI.get(`${prefix}/count`, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return data;
};
