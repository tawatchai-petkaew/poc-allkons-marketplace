import { productAPI } from '@/utils/axios';

export const getProductCategories = async () => {
  const { data: responseData } = await productAPI.get(
    '/v1/marketplace-product-category'
  );
  return responseData;
};

export const getProductCategoryByIds = async (ids: string[]) => {
  const { data: responseData } = await productAPI.get(
    `/v1/marketplace-product-category/${ids.join(',')}`
  );
  return responseData;
};

export enum ProductOrderBy {
  BEST_SELLER = 'bestSeller',
  LOW_PRICE_TO_HIGH_PRICE = 'lowPriceToHighPrice',
  HIGH_PRICE_TO_LOW_PRICE = 'highPriceToLowPrice',
}

export const getProductsByCategoryId = async (
  categoryId: string,
  page: number,
  limit: number,
  orderBy: ProductOrderBy | string
) => {
  if (!Object.values(ProductOrderBy).includes(orderBy as ProductOrderBy)) {
    orderBy = ProductOrderBy.BEST_SELLER;
  }

  const { data: responseData } = await productAPI.get(
    `/v1/marketplace-product`,
    {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        productCategoryIds: [categoryId],
        orderBy,
      },
    }
  );
  return responseData;
};

export const getProductSubCategories = async () => {
  const { data: responseData } = await productAPI.get(
    '/v1/category/sub-categories'
  );
  return responseData;
};


export const getProductChildrenCategories = async (categoryId: string) => {
  const { data: responseData } = await productAPI.get(
    `/v1/category/children?categoryId=${categoryId}`
  );
  return responseData;
};

export const getCurrentCategoryTree = async (
  categoryId: string
) => {
  const { data: responseData } = await productAPI.get(
    `/v1/category/category-tree?categoryId=${categoryId}`,
  );
  return responseData;
};