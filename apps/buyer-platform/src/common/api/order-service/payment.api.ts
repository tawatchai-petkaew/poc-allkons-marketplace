import { PaymentStatus, PaymentMethod } from '@/common/enum/payment.enum';
import { orderAPI } from '../../../utils/axios';
import Cookies from 'js-cookie';

const prefix = '/payment';

interface IPaymentSubOrderRequest {
  orderId: number;
  subOrderIds: number[];
  amount: number;
}

export interface IPaymentMethodSubOrderRequest {
  payTime?: string;
  paymentMethod: PaymentMethod | null;
  paymentStatus?: PaymentStatus;
}

interface IPaymentUpdateSlipRequest {
  orderPaymentId: number;
  fileIds: number[];
}

export const updatePaymentSubOrder = async (data: IPaymentSubOrderRequest) => {
  const auth = Cookies.get('auth');
  const authData = auth ? JSON.parse(auth) : null;

  const response = await orderAPI.post(`${prefix}`, data, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return response.data;
};

export const updatePaymentMethodSubOrder = async (
  data: IPaymentMethodSubOrderRequest,
  orderId: number
) => {
  const auth = Cookies.get('auth');
  const authData = auth ? JSON.parse(auth) : null;

  const response = await orderAPI.put(`${prefix}/${orderId}`, data, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return response.data;
};

export const updateSlipPaymentSubOrder = async (
  data: IPaymentUpdateSlipRequest
) => {
  const auth = Cookies.get('auth');
  const authData = auth ? JSON.parse(auth) : null;

  const response = await orderAPI.post(`${prefix}/slip/`, data, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return response.data;
};

export const getOrderPaymentById = async (orderPaymentId: number) => {
  const auth = Cookies.get('auth');
  const authData = auth ? JSON.parse(auth) : null;

  const response = await orderAPI.get(`${prefix}/${orderPaymentId}`, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return response.data.data;
};
