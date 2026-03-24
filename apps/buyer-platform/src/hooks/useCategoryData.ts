'use client';

import { getProductCategories,getProductSubCategories ,getProductChildrenCategories} from '@/common/api/product-service/category.api';
import { useQuery } from '@tanstack/react-query';

export const useCategoryData = () => {
  const { data, error, isLoading, isPending } = useQuery({
    queryKey: ['productCategories'],
    queryFn: () => getProductCategories(),
  });

  return { data, error, isLoading, isPending };
};


export const useSubCategoryData = () => {
  const { data, error, isLoading, isPending } = useQuery({
    queryKey: ['productSubCategories'],
    queryFn: () => getProductSubCategories(),
  });

  return { data, error, isLoading, isPending };
};

export const useChildrenCategoryData = (categoryId: string) => {
  const { data, error, isLoading, isPending } = useQuery({
    queryKey: ['productSubCategories', categoryId],
    queryFn: () => getProductChildrenCategories(categoryId),
    enabled: Boolean(categoryId),
  });

  return { data, error, isLoading, isPending };
};

