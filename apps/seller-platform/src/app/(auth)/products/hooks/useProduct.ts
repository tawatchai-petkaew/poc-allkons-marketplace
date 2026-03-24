'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user.store';
import { routes } from '@/constants/routing.constants';
import {
  getMerchantProducts,
  getMerchantsProductCount,
  getMasterDataProduct,
  getProductVariantImages,
} from '@/api/product.api';
import { getCategories, getCategoriesByProductVariant } from '@/api/category.api';
import type {
  IProductVariantImageResponse,
  IProductResponseMerchantProduct,
} from '@/interfaces/product/product.response.interface';
import type { ICategoryTree } from '@/interfaces/category/category.response.interface';
import {
  DEFAULT_PRICE_DISPLAY_MODE,
  DEFAULT_SHOW_VAT_DETAILS,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MERCHANT_REDIRECT_DELAY,
  QUERY_STALE_TIME,
  QUERY_GC_TIME,
  PRODUCT_MESSAGES,
} from '../constants/products.constants';
import { useProductFilters } from './useProductFilters';
import { useProductSelection } from '../context/ProductSelectionContext';
import { transformCategoryToTreeData } from '../utils/categoryHelpers';
import { storeSelectedProducts } from '../utils/productStorage';


const buildCategoryPath = (
  categoryTree: ICategoryTree | null,
): { fullPath: string; pathWithoutLast: string; lastItem: string } => {
  if (!categoryTree) {
    return { fullPath: '-', pathWithoutLast: '-', lastItem: '' };
  }

  const path: string[] = [];
  let current: ICategoryTree | null = categoryTree;

  while (current) {
    path.push(current.name);
    current = current.child;
  }

  const lastItem = path[path.length - 1] ?? '';
  const pathWithoutLast = path.length > 1 ? path.slice(0, -1).join(' > ') : '';

  return { fullPath: path.join(' > '), pathWithoutLast, lastItem };
};

export const useProduct = () => {
  const merchant = useUserStore((state) => state.merchant);
  const merchantSlug = merchant?.merchantSlug ?? '';
  const router = useRouter();

  useEffect(() => {
    if (merchant !== null) return;
    const timeout = setTimeout(() => {
      if (useUserStore.getState().merchant === null) {
        router.push(routes.merchantList());
      }
    }, MERCHANT_REDIRECT_DELAY);
    return () => clearTimeout(timeout);
  }, [merchant, router]);


  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [priceDisplayMode, setPriceDisplayMode] = useState(DEFAULT_PRICE_DISPLAY_MODE);
  const [showVatDetails, setShowVatDetails] = useState(DEFAULT_SHOW_VAT_DETAILS);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [hasInvalidStatusSelected] = useState(false);


  const {
    filter,
    tempFilter,
    tempCategoryFilter,
    setTempCategoryFilter,
    updateTempFilter,
    applyFilters,
    resetFilters,
    updateStatus,
  } = useProductFilters();

  const {
    selectedRowKeys,
    getSelectedKeysArray,
    addSelectedKey,
    removeSelectedKey,
    getAllCachedProducts,
    clearAll,
    selectedCount,
  } = useProductSelection();


  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      'merchantProducts',
      merchantSlug,
      currentPage,
      pageSize,
      filter.search,
      filter.searchType,
      filter.productType,
      filter.categories,
      filter.status,
      searchTrigger,
    ],
    queryFn: () =>
      getMerchantProducts(merchantSlug, {
        page: currentPage,
        pageLimit: pageSize,
        search: filter.search || undefined,
        searchType: filter.searchType !== 'all' ? filter.searchType : undefined,
        productTypeId: filter.productType !== 'all' ? Number(filter.productType) : undefined,
        categoryIds: filter.categories?.length ? filter.categories.join(',') : undefined,
        ...(filter.status && filter.status !== 'ALL' ? { merchantProductStatus: filter.status } : {}),
      }),
    enabled: !!merchantSlug,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    staleTime: QUERY_STALE_TIME.REFERENCE_DATA,
    gcTime: QUERY_GC_TIME.REFERENCE_DATA,
  });

  const { data: statusCountData } = useQuery({
    queryKey: ['merchantProductStatusCount', merchantSlug],
    queryFn: () => getMerchantsProductCount(merchantSlug),
    enabled: !!merchantSlug,
  });

  const { data: productTypeData } = useQuery({
    queryKey: ['masterDataProductType'],
    queryFn: () => getMasterDataProduct('ProductType'),
    staleTime: QUERY_STALE_TIME.REFERENCE_DATA,
    gcTime: QUERY_GC_TIME.REFERENCE_DATA,
  });

  const products = productsData?.data?.items ?? [];
  const totalItems = productsData?.data?.meta?.totalItems ?? 0;
  const productVariantIds = useMemo(() => {
    const ids = products.reduce<number[]>((acc, p) => {
      if (p.productVariant?.id !== undefined) acc.push(p.productVariant.id);
      return acc;
    }, []);
    return ids.join(',');
  }, [products]);

  const { data: productVariantImagesData } = useQuery({
    queryKey: ['productVariantImages', merchantSlug, productVariantIds],
    queryFn: () => getProductVariantImages(merchantSlug, productVariantIds),
    enabled: !!merchantSlug && productVariantIds.length > 0,
    staleTime: QUERY_STALE_TIME.PRODUCT_IMAGES,
  });

  const { data: categoryHierarchyData } = useQuery({
    queryKey: ['categoryHierarchy', productVariantIds],
    queryFn: () => getCategoriesByProductVariant(productVariantIds),
    enabled: productVariantIds.length > 0,
    staleTime: QUERY_STALE_TIME.CATEGORY_HIERARCHY,
  });

  const categoryTreeData = useMemo(
    () => transformCategoryToTreeData(categoriesData?.data ?? []),
    [categoriesData],
  );

  const statusCounts = useMemo(
    () =>
      statusCountData?.data ?? {
        ALL: 0,
        Selling: 0,
        Hidden: 0,
        OutOfStock: 0,
        NotApproved: 0,
      },
    [statusCountData],
  );

  const productTypeOptions = useMemo(
    () => [
      { value: 'all', label: 'ทั้งหมด' },
      ...(productTypeData?.data ?? []).map((item) => ({
        value: String(item.id),
        label: item.name_th,
      })),
    ],
    [productTypeData],
  );

  const productImageMap = useMemo(() => {
    const map: Record<number, string> = {};
    const images = productVariantImagesData?.data;
    if (!Array.isArray(images)) return map;
    for (const item of images as IProductVariantImageResponse[]) {
      if (!(item.productVariantId in map) && item.imageUpload?.url) {
        map[item.productVariantId] = item.imageUpload.url;
      }
    }
    return map;
  }, [productVariantImagesData]);

  const categoryPathMap = useMemo(() => {
    const map: Record<number, { fullPath: string; pathWithoutLast: string; lastItem: string }> = {};
    const items = categoryHierarchyData?.data?.items;
    if (!Array.isArray(items)) return map;
    for (const item of items) {
      map[item.productVariantId] = buildCategoryPath(item.categoryTree);
    }
    return map;
  }, [categoryHierarchyData]);


  const currentFilters = useMemo(
    () => ({
      search: filter.search,
      searchType: filter.searchType !== 'all' ? filter.searchType : undefined,
      productTypeId: filter.productType !== 'all' ? Number(filter.productType) : undefined,
      categoryIds: filter.categories?.length ? filter.categories.join(',') : undefined,
      merchantProductStatus: filter.status && filter.status !== 'ALL' ? filter.status : undefined,
    }),
    [filter],
  );


  const handleSearch = useCallback(() => {
    setSearchTrigger((prev) => prev + 1);
    applyFilters(() => setCurrentPage(DEFAULT_PAGE));
  }, [applyFilters]);

  const handleReset = useCallback(() => {
    resetFilters(() => setCurrentPage(DEFAULT_PAGE));
  }, [resetFilters]);

  const handleStatusChange = useCallback((status: string) => {
    updateStatus(status, () => setCurrentPage(DEFAULT_PAGE));
  }, [updateStatus]);

  const handlePageChange = useCallback((page: number, size: number) => {
    if (size !== pageSize) {
      setPageSize(size);
      setCurrentPage(DEFAULT_PAGE);
    } else {
      setCurrentPage(page);
    }
  }, [pageSize]);

  const handleSelectionChange = useCallback((
    selectedKeys: React.Key[],
    _selectedRows: IProductResponseMerchantProduct[],
  ) => {
    const productById = new Map<React.Key, IProductResponseMerchantProduct>(
      products.map((p) => [p.id as React.Key, p]),
    );
    const newKeySet = new Set(selectedKeys);

    productById.forEach((product, key) => {
      if (newKeySet.has(key)) {
        addSelectedKey(key, product);
      } else {
        removeSelectedKey(key);
      }
    });
  }, [products, addSelectedKey, removeSelectedKey]);

  const handleEditPricing = useCallback(() => {
    storeSelectedProducts(getAllCachedProducts());
    message.info(PRODUCT_MESSAGES.EDIT_PRICING_INFO);
  }, [getAllCachedProducts]);

  const handleBulkUpdateStatus = useCallback((
    keys: React.Key[],
    _status: string,
    _cacheMap: Record<string | number, string>,
  ) => {
    setIsUpdatingStatus(true);
    try {
      message.success(PRODUCT_MESSAGES.BULK_UPDATE_STATUS_SUCCESS(keys.length));
      clearAll();
    } catch {
      message.error(PRODUCT_MESSAGES.BULK_UPDATE_STATUS_ERROR);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [clearAll]);

  const handleBulkDelete = useCallback((
    keys: React.Key[],
    _cacheMap: Record<string | number, string>,
  ) => {
    setIsUpdatingStatus(true);
    try {
      message.success(PRODUCT_MESSAGES.BULK_DELETE_SUCCESS(keys.length));
      clearAll();
    } catch {
      message.error(PRODUCT_MESSAGES.BULK_DELETE_ERROR);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [clearAll]);

  const handleShowProducts = useCallback(() => {
    message.info(PRODUCT_MESSAGES.SHOW_PRODUCTS_INFO);
  }, []);

  const handleEdit = useCallback((product: IProductResponseMerchantProduct) => {
    message.info(PRODUCT_MESSAGES.EDIT_PRODUCT_INFO(product.productVariant?.alias ?? ''));
  }, []);

  const handleDelete = useCallback((product: IProductResponseMerchantProduct) => {
    message.info(PRODUCT_MESSAGES.DELETE_PRODUCT_INFO(product.productVariant?.alias ?? ''));
  }, []);

  const handleToggleStatus = useCallback((product: IProductResponseMerchantProduct, newStatus: string) => {
    message.info(PRODUCT_MESSAGES.TOGGLE_STATUS_INFO(product.productVariant?.alias ?? '', newStatus));
  }, []);


  return {
    // Merchant context
    merchantSlug,

    // Table data
    products,
    isLoading,
    totalItems,
    productImageMap,
    categoryPathMap,

    // Filter options (for dropdowns)
    categoryTreeData,
    productTypeOptions,
    statusCounts,

    // Pagination
    currentPage,
    pageSize,

    // Display settings
    priceDisplayMode,
    setPriceDisplayMode,
    showVatDetails,
    setShowVatDetails,

    // Bulk operation state
    isUpdatingStatus,
    hasInvalidStatusSelected,

    // Computed
    currentFilters,

    filter: {
      active: filter,
      temp: tempFilter,
      tempCategory: tempCategoryFilter,
      setTempCategory: setTempCategoryFilter,
      updateTemp: updateTempFilter,
    },

    selection: {
      selectedRowKeys,
      getSelectedKeysArray,
      getAllCachedProducts,
      clearAll,
      selectedCount,
    },

    handlers: {
      onSearch: handleSearch,
      onReset: handleReset,
      onStatusChange: handleStatusChange,
      onPageChange: handlePageChange,
      onSelectionChange: handleSelectionChange,
      onEditPricing: handleEditPricing,
      onBulkUpdateStatus: handleBulkUpdateStatus,
      onBulkDelete: handleBulkDelete,
      onShowProducts: handleShowProducts,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onToggleStatus: handleToggleStatus,
    },
  };
};
