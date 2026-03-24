import { customerAPI } from '../../../utils/axios';

export const getMerchantBanners = async (slug: string) => {
  const { data: responseData } = await customerAPI.get(
    '/banner-merchant-public',
    { headers: { currentmerchantslug: slug } }
  );
  return responseData;
};

export const getPromotionBanner = async (slug: string) => {
  const { data: responseData } = await customerAPI.get(
    '/banner-promotion-public',
    { headers: { currentmerchantslug: slug } }
  );
  return responseData;
};

export const getMerchantDetails = async (slug: string) => {
  const { data: responseData } = await customerAPI.get('/merchant-public', {
    headers: { currentmerchantslug: slug },
  });
  return responseData;
};

export const getArticles = async (slug: string) => {
  const { data: responseData } = await customerAPI.get('/article-public', {
    headers: { currentmerchantslug: slug },
  });
  return responseData;
};
