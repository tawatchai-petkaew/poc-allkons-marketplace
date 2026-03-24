import { orderAPI } from '@/utils/axios';

const prefix = '/cart-public';
const prefixMarketplace = '/marketplace-cart';

export interface UpdateCartItemPayload {
  cartItemId: number;
  productItemId: number;
  quantity: number;
  unit: string;
}

export const createCartItem = async (
  slug: string,
  accessToken: string,
  payload: { productItemId: number; quantity: number; unit: string }
) => {
  const { data } = await orderAPI.post(`${prefix}/cartItem`, payload, {
    headers: {
      currentMerchantSlug: slug,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};

export const getCartItems = async (
  slug: string,
  accessToken: string,
  pageParam: number = 1
) => {
  const { data } = await orderAPI.get(`${prefix}`, {
    headers: {
      currentMerchantSlug: slug,
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      page: pageParam,
      limit: 10,
    },
  });
  return data;
};

export const getCarts = async (accessToken: string, pageParam: number = 1) => {
  const { data } = await orderAPI.get(`${prefixMarketplace}/carts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      page: pageParam,
      limit: 10,
    },
  });
  return data;
};

export const getCount = async (accessToken: string) => {
  const { data } = await orderAPI.get(`${prefixMarketplace}/count`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};

export const updateCartItem = async (
  accessToken: string,
  payload: UpdateCartItemPayload
) => {
  const { data } = await orderAPI.put(
    `${prefixMarketplace}/cart-item/${payload.cartItemId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return data;
};

export const deleteCartItems = async (
  accessToken: string,
  cartItemIds: number[]
) => {
  const { data } = await orderAPI.post(
    `${prefixMarketplace}/cart-item/batch-delete`,
    { ids: cartItemIds },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return data;
};
