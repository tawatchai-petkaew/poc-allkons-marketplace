import { productAPI } from '@/utils/axios';

export const getProductBySlug = async (productSlug: string) => {
  const { data } = await productAPI.get(
    `/v1/marketplace-product/${productSlug}`
  );
  return data;
};

export const getProductMerchantsBySlug = async (
  productSlug: string,
  page?: number,
  limit?: number
) => {
  const { data } = await productAPI.get(
    `/v1/marketplace-product/${productSlug}/productMerchants`,
    {
      params: {
        page,
        limit,
      },
    }
  );
  return data;
};

export const getMerchantBestSellers = async (slug: string) => {
  const { data: responseData } = await productAPI.get(
    '/product-public/bestSeller',
    { headers: { currentmerchantslug: slug } }
  );
  return responseData;
};

export const getMerchantFeaturedProducts = async (slug: string) => {
  const [
    { data: recommendedResponseData },
    { data: newResponseData },
    { data: discountResponseData },
  ] = await Promise.all([
    productAPI.get(`/product-public/recommend`, {
      headers: { currentmerchantslug: slug },
    }),
    productAPI.get(`/product-public/new`, {
      headers: { currentmerchantslug: slug },
    }),
    productAPI.get(`/product-public/discount`, {
      headers: { currentmerchantslug: slug },
    }),
  ]);
  return {
    recommended: recommendedResponseData?.data,
    new: newResponseData?.data,
    discount: discountResponseData?.data,
  };
};

export const getProductCatalogs = async (slug: string) => {
  const { data: responseData } = await productAPI.get(
    '/product-catalog-public',
    { headers: { currentmerchantslug: slug } }
  );
  return responseData;
};

export const getFlashSales = async (slug: string) => {
  const { data: responseData } = await productAPI.get('/flash-sale-public', {
    headers: { currentmerchantslug: slug },
  });
  return responseData;
};

export const getRelatedProducts = async (productSlug: string) => {
  const { data: responseData } = await productAPI.get(
    `/v1/marketplace-product/${productSlug}/relationProducts`
  );
  return responseData;
};
