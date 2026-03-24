'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getProductImport,
  checkDuplicateProducts,
  addProductsToMerchant,
} from '@/api/product.api';
import { getCategoriesByProductVariant } from '@/api/category.api';
import { getMerchantByOrganization } from '@/api/merchant.api';
import { useUserStore } from '@/store/user.store';
import { useAddProductsContext } from '../context/AddProductsContext';
import { STEPS } from '../AddProducts.constants';
import type { IProductImport } from '@/interfaces/product/product.response.interface';
import type { IMerchantItem } from '@/interfaces/merchant/merchant.response.interface';
import type { ICheckResultItem, IAddProductToMerchantPayload } from '@/interfaces/product/add-product.interface';
import type { ICategoryTree } from '@/interfaces/category/category.response.interface';
import type { NotificationInstance } from 'antd/es/notification/interface';

interface UseAddProductsOptions {
  notification?: NotificationInstance;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * useAddProducts - Consolidated hook for AddProducts component
 *
 * Combines functionality from:
 * - Product search and category hierarchy
 * - Merchant selection with HEAD_OFFICE logic
 * - Duplicate checking
 * - Add product flow control
 */
export const useAddProducts = ({ notification }: UseAddProductsOptions = {}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get user store values
  const { organization, merchant } = useUserStore();

  // ==========================================================================
  // Context State
  // ==========================================================================

  const {
    // Step Navigation (used internally)
    setStep,
    // Product Search State (for hook internal use)
    products,
    setProducts,
    total,
    setTotal,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filter,
    setFilter,
    tempFilter,
    setTempFilter,
    selectedProducts,
    setSelectedProducts,
    // Add Product Modal State (used internally)
    selectedAddProducts,
    // Merchant Selection State (for hook internal use)
    merchants: contextMerchants,
    setMerchants,
    isOnHeadOffice,
    setIsOnHeadOffice,
    headOfficeUuid,
    setHeadOfficeUuid,
    setIsLoadingMerchants,
    selectedMerchants,
    setSelectedMerchants,
    hasMerchantInitialized,
    setHasMerchantInitialized,
    // Loading States
    isCheckingDuplicates: contextIsCheckingDuplicates,
    setIsCheckingDuplicates,
    // Check Results State (for hook internal use)
    setTotalAddableMerchant,
  } = useAddProductsContext();

  // ==========================================================================
  // SECTION 1: Product Search
  // ==========================================================================

  // Product fetching mutation
  const {
    mutateAsync: fetchProductImport,
    isPending: isLoadingProducts,
  } = useMutation({
    mutationFn: (params: { page: number; pageLimit: number; search: string; searchType: string }) => {
      if (!merchant?.merchantSlug) {
        throw new Error('No merchant selected');
      }
      return getProductImport(merchant.merchantSlug, {
        page: params.page,
        pageLimit: params.pageLimit,
        search: params.search,
        searchType: params.searchType,
      });
    },
    onSuccess: (data) => {
      setProducts(data?.data?.items || []);
      setTotal(data?.data?.meta?.totalItems || 0);
    },
  });

  // Auto-fetch when filter, currentPage, or pageSize changes
  useEffect(() => {
    if (filter && merchant?.merchantSlug) {
      fetchProductImport({
        page: currentPage,
        pageLimit: pageSize,
        search: filter.search || '',
        searchType: filter.searchType || 'all',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, currentPage, pageSize, merchant?.merchantSlug]);

  // Collect unique productVariantIds from products
  const productVariantIds = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    return products.reduce<number[]>((acc, product: IProductImport) => {
      const variantId = product.productVariant?.id;
      const categoryId = product.productVariant?.product?.category?.id;

      // Only include variants that have both variantId and categoryId
      if (variantId && categoryId && !acc.includes(variantId)) {
        acc.push(variantId);
      }

      return acc;
    }, []);
  }, [products]);

  // Generate cache key for category query (based on productVariantIds since API uses productVariantIds)
  const productVariantIdsKey = useMemo(() => {
    return productVariantIds.length > 0
      ? [...productVariantIds].sort((a, b) => a - b).join(',')
      : '';
  }, [productVariantIds]);

  // Fetch category hierarchy
  const { data: categoryHierarchyData } = useQuery({
    queryKey: ['category-hierarchy', productVariantIdsKey],
    queryFn: () => getCategoriesByProductVariant(productVariantIdsKey),
    enabled: productVariantIds.length > 0 && !!productVariantIdsKey,
  });

  // Build category path from nested child structure
  const buildCategoryPath = (categoryTree: ICategoryTree | null) => {
    if (!categoryTree) {
      return { fullPath: '', pathWithoutLast: '', lastItem: '' };
    }

    const path: string[] = [];
    let current: ICategoryTree | null = categoryTree;

    while (current) {
      path.push(current.name);
      current = current.child;
    }

    const fullPath = path.join(' > ');
    const lastItem = path.length > 0 ? path[path.length - 1] : '';
    const pathWithoutLast =
      path.length > 1 ? path.slice(0, -1).join(' > ') : '';

    return { fullPath, pathWithoutLast, lastItem };
  };

  // Create a map of productVariantId to category path
  const categoryPathMap = useMemo(() => {
    if (!categoryHierarchyData?.data?.items) return {};

    const map: Record<number, { fullPath: string; pathWithoutLast: string; lastItem: string }> = {};
    categoryHierarchyData.data.items.forEach((item) => {
      if (item.productVariantId && item.categoryTree) {
        map[item.productVariantId] = buildCategoryPath(item.categoryTree);
      }
    });
    return map;
  }, [categoryHierarchyData]);

  // Product search handlers
  const handleSearch = () => {
    setCurrentPage(1); // Reset to page 1 when searching
    setFilter(tempFilter);
  };
  const handleClearSearch = () => {
    const defaultFilter = { searchType: 'all', search: '' };
    setCurrentPage(1); // Reset to page 1 when clearing
    setTempFilter(defaultFilter);
    setFilter(defaultFilter);
  };
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // ==========================================================================
  // SECTION 2: Multi-Page Selection
  // ==========================================================================

  const handleProductSelectionChange = useCallback(
    (newSelectedKeys: React.Key[]) => {
      const currentPageIds = products.map((item: IProductImport) => item.id);

      // Keep selected items from other pages
      const itemsFromOtherPages = selectedProducts.filter(
        (item: IProductImport) => !currentPageIds.includes(item.id),
      );

      // Get selected items from current page
      const selectedInCurrentPage = products.filter((item: IProductImport) =>
        newSelectedKeys.includes(item.id),
      );

      // Combine and remove duplicates
      const combined = [...itemsFromOtherPages, ...selectedInCurrentPage];
      const unique = combined.filter(
        (item: IProductImport, index, self) =>
          index === self.findIndex((t: IProductImport) => t.id === item.id),
      );

      setSelectedProducts(unique);
    },
    [products, selectedProducts, setSelectedProducts],
  );

  const productRowSelection = {
    selectedRowKeys: selectedProducts.map((item: IProductImport) => item.id),
    onChange: handleProductSelectionChange,
    columnWidth: 56,
    fixed: true,
  };

  // ==========================================================================
  // SECTION 3: Merchant Selection (Fetch & Sync to Context)
  // ==========================================================================

  const organizationUuid = organization?.organizeUuid;
  const currentMerchantSlug = merchant?.merchantSlug;

  // Fetch all merchants
  const { data: allMerchantsData, isLoading: apiIsLoadingMerchants } = useQuery(
    {
      queryKey: ['merchant-by-organization-all', organizationUuid],
      queryFn: () => getMerchantByOrganization(organizationUuid!),
      enabled: !!organizationUuid,
    },
  );

  // Memoize to prevent infinite loop - only recreate when data actually changes
  const allMerchants = useMemo(
    () => allMerchantsData?.data || [],
    [allMerchantsData?.data],
  );

  // Find current merchant - memoized to prevent unnecessary recalculations
  const currentMerchant = useMemo(
    () => allMerchants.find((m: IMerchantItem) => m.slug === currentMerchantSlug),
    [allMerchants, currentMerchantSlug],
  );

  // Sync merchant data to context when API data changes
  useEffect(() => {
    const computedIsOnHeadOffice =
      currentMerchant?.merchantBranchType === 'HEAD_OFFICE';
    const computedMerchants = computedIsOnHeadOffice
      ? allMerchants
      : allMerchants.filter((m: IMerchantItem) => m.merchantBranchType !== 'HEAD_OFFICE');
    const headOffice = allMerchants.find(
      (m: IMerchantItem) => m.merchantBranchType === 'HEAD_OFFICE',
    );
    const computedHeadOfficeUuid = headOffice?.uuid || null;

    setMerchants(computedMerchants);
    setIsOnHeadOffice(computedIsOnHeadOffice);
    setHeadOfficeUuid(computedHeadOfficeUuid);
    setIsLoadingMerchants(apiIsLoadingMerchants);
  }, [allMerchants, currentMerchant, apiIsLoadingMerchants, setMerchants, setIsOnHeadOffice, setHeadOfficeUuid, setIsLoadingMerchants]);

  // Auto-select current merchant on initial load
  useEffect(() => {
    if (hasMerchantInitialized) return;

    if (contextMerchants && contextMerchants.length > 0) {
      if (isOnHeadOffice && headOfficeUuid) {
        setSelectedMerchants([headOfficeUuid]);
      } else if (currentMerchant) {
        const isCurrentMerchantAvailable = contextMerchants.some(
          (m: IMerchantItem) => m.uuid === currentMerchant.uuid,
        );
        if (isCurrentMerchantAvailable) {
          setSelectedMerchants([currentMerchant.uuid]);
        }
      }
      setHasMerchantInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextMerchants, hasMerchantInitialized]);

  // ==========================================================================
  // SECTION 4: Duplicate Check & Add Products
  // ==========================================================================

  // Local state for check results
  const [checkResultsData, setCheckResultsData] = useState<ICheckResultItem[]>([]);

  const {
    mutateAsync: callApiCheckProducts,
    isPending: apiIsCheckingDuplicates,
  } = useMutation({
    mutationFn: (payload: { merchantUuids: string[]; productVariantSkuUuids: string[] }) => {
      if (!merchant?.merchantSlug) {
        throw new Error('No merchant selected');
      }
      return checkDuplicateProducts(merchant.merchantSlug, payload);
    },
  });

  // Sync checking duplicates state to context
  useEffect(() => {
    setIsCheckingDuplicates(apiIsCheckingDuplicates);
  }, [apiIsCheckingDuplicates, setIsCheckingDuplicates]);

  const { mutateAsync: callApiAddProducts, isPending: isAddingProducts } =
    useMutation({
      mutationFn: (payload: IAddProductToMerchantPayload[]) => {
        if (!merchant?.merchantSlug) {
          throw new Error('No merchant selected');
        }
        return addProductsToMerchant(merchant.merchantSlug, payload);
      },
      onSuccess: () => {
        // Invalidate products list and status count to refresh data on manage products page
        queryClient.invalidateQueries({ queryKey: ['products-list'] });
        queryClient.invalidateQueries({ queryKey: ['product-status-count'] });
      },
    });

  /**
   * Check products for duplicates and handle the flow
   * - If no duplicates: add products directly
   * - If has duplicates: go to check results step
   */
  const handleCheckAndAddProducts = async ({
    onNoDuplicates,
    onHasDuplicates,
    onError: handleError,
  }: {
    onNoDuplicates?: (payload: IAddProductToMerchantPayload[], resultsData: ICheckResultItem[]) => void;
    onHasDuplicates?: () => void;
    onError?: (error?: string) => void;
  }) => {
    const payload = {
      merchantUuids: selectedMerchants,
      productVariantSkuUuids: (selectedAddProducts || []).map((p: IProductImport) => p.id),
    };

    try {
      const data = await callApiCheckProducts(payload);
      const results = data.data || [];

      const hasDuplicates = results.some(
        (x) => x.duplicatedProducts.length > 0,
      );
      const totalAddable = results.reduce(
        (sum, item) => sum + (item.addableProducts.length > 0 ? 1 : 0),
        0,
      );

      setTotalAddableMerchant(totalAddable);
      setCheckResultsData(results);

      if (!hasDuplicates) {
        // No duplicates - prepare payload for direct add
        const addPayload: IAddProductToMerchantPayload[] = results.map((item) => ({
          productVariantSkuUuids: item.addableProducts.map(
            (p) => p.skuUuid,
          ),
          merchantUuid: item.merchant.uuid,
        }));

        // Check if any merchant has empty products
        const hasEmptyMerchant = addPayload.some(
          (item) => item.productVariantSkuUuids.length === 0,
        );

        if (hasEmptyMerchant) {
          handleError?.('No products to add');
        } else {
          onNoDuplicates?.(addPayload, results);
        }
      } else {
        // Has duplicates - go to check results
        onHasDuplicates?.();
        setStep(STEPS.CHECK_RESULTS);
      }
    } catch (error) {
      console.error('[useAddProducts] Check error:', error);
      notification?.error({
        message: 'เกิดข้อผิดพลาด',
        duration: 3,
      });
    }
  };

  /**
   * Add products after checking duplicates (from check results step)
   */
  const handleAddProductsAfterCheck = async () => {
    const payload = checkResultsData.map((item) => ({
      productVariantSkuUuids: item.addableProducts.map((p) => p.skuUuid),
      merchantUuid: item.merchant.uuid,
    }));

    return callApiAddProducts(payload);
  };

  /**
   * Direct add products (when no duplicates)
   */
  const addProductsToMerchants = async (
    payload: IAddProductToMerchantPayload[],
  ) => {
    if (!payload || payload.length === 0) {
      notification?.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่มีสินค้าที่ต้องการเพิ่ม',
        duration: 3,
      });
      return;
    }
    return callApiAddProducts(payload);
  };

  // ==========================================================================
  // SECTION 5: Flow Control & Modals
  // ==========================================================================

  const [modals, setModals] = useState({
    isShowAddProduct: false,
    isShowConfirmAddProduct: false,
    isShowConfirmAddProductAfterCheckDuplicate: false,
  });

  const openModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  const closeAllModals = () => {
    setModals({
      isShowAddProduct: false,
      isShowConfirmAddProduct: false,
      isShowConfirmAddProductAfterCheckDuplicate: false,
    });
  };

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // Modals
    modals,
    openModal,
    closeModal,
    closeAllModals,

    // Product Search
    products,
    total,
    isLoadingProducts,
    currentPage,
    pageSize,
    tempFilter,
    setTempFilter,
    categoryPathMap,
    handleSearch,
    handleClearSearch,
    handlePageChange,
    handlePageSizeChange,

    // Product Selection
    selectedProducts,
    productRowSelection,

    // Duplicate Check & Add Products
    isCheckingDuplicates: contextIsCheckingDuplicates,
    isAddingProducts,
    checkResultsData,
    handleCheckAndAddProducts,
    handleAddProductsAfterCheck,
    addProductsToMerchants,
  };
};

export default useAddProducts;
