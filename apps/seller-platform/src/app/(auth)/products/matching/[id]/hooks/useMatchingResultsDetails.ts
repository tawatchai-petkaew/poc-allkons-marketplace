'use client';

import { useState, useMemo, useCallback, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchBatchItemList,
  downloadMatchingResult,
  confirmMatchingSimilar,
} from '@/api/import-product.api';
import { useNotification } from '@/hooks/useNotification';
import { formatNumber, formatDateTime } from '@/utils/format';
import {
  PRICE_DISPLAY_OPTIONS,
  PRICE_DISPLAY_MODES,
  DEFAULT_PRICE_DISPLAY_MODE,
  DEFAULT_SHOW_VAT_DETAILS,
  UNSPECIFIED_TEXT,
  STATUS_TABS,
  STATUS_TAB_LABELS,
  IMPORTED_STATUS_CONFIG,
  DEFAULT_IMPORTED_STATUS,
  MATCHING_STATUS_CONFIG,
  AVAILABLE_FOR_SALE_CONFIG,
  YES_NO_STATUS_CONFIG,
  TAB_TO_MATCH_STATUS_MAP,
  IMPORT_TYPE_CONFIG,
  IStatusTab,
  IPriceDisplayMode,
} from '../constants';
import { STATUS_MAP, STATUS_CONFIG } from '../../constants';
import type { IStatusMapKey, IStatusConfigKey } from '../../constants';
import { useMatchingResultsDetailsStore } from '@/store/matching-results-details.store';
import type { IBatchItem } from '@/interfaces/product/import-product.response.interface';
import type { IImportProductRequestConfirmSimilarPayloadItem } from '@/interfaces/product/import-product.request.interface';

// Debounce hook implementation
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const formatCurrency = (amount: number) => formatNumber(amount, 2);

const getPriceValues = (record: IBatchItem, priceType: string) => {
  const isRegular = priceType === 'regular';
  const basePrice = isRegular ? record.regularPrice : record.specialPrice;
  const vatPercent = record.vatPercent;
  const calculationVatPercent = vatPercent ?? 0;
  const priceTypeFromApi = record.priceType; // 'EXVAT' or 'INVAT'
  const isExVat = priceTypeFromApi === 'EXVAT';

  let priceIncludeVat: number | null = null;
  let priceExcludeVat: number | null = null;

  if (basePrice != null && basePrice !== undefined) {
    const vatMultiplier = 1 + calculationVatPercent / 100;

    if (isExVat) {
      priceExcludeVat = basePrice;
      priceIncludeVat = basePrice * vatMultiplier;
    } else {
      priceIncludeVat = basePrice;
      if (vatMultiplier > 0) {
        priceExcludeVat = basePrice / vatMultiplier;
      } else {
        priceExcludeVat = basePrice;
      }
    }
  }

  return {
    priceIncludeVat,
    priceExcludeVat,
    priceVatPercent: vatPercent,
    isRegular,
  };
};

const calculatePriceDetails = (
  record: IBatchItem,
  priceType: string,
  showVatDetails: boolean,
  priceDisplayMode: string
) => {
  const { priceIncludeVat, priceExcludeVat, priceVatPercent, isRegular } = getPriceValues(
    record,
    priceType
  );

  const hasPrice = priceIncludeVat != null || priceExcludeVat != null;
  const vatPercent = priceVatPercent;

  const mainPrice = (() => {
    if (!hasPrice && !isRegular) return UNSPECIFIED_TEXT;
    const price =
      priceDisplayMode === PRICE_DISPLAY_MODES.WITH_VAT
        ? (priceIncludeVat ?? priceExcludeVat)
        : (priceExcludeVat ?? priceIncludeVat);
    return price != null ? formatCurrency(price) : UNSPECIFIED_TEXT;
  })();

  const alternatePrice = (() => {
    if (!hasPrice && !isRegular) {
      return priceDisplayMode === PRICE_DISPLAY_MODES.WITH_VAT ? 'Ex Vat -' : 'In Vat -';
    }
    if (priceDisplayMode === PRICE_DISPLAY_MODES.WITH_VAT) {
      return priceExcludeVat != null ? `Ex Vat ${formatCurrency(priceExcludeVat)}` : 'Ex Vat -';
    }
    return priceIncludeVat != null ? `In Vat ${formatCurrency(priceIncludeVat)}` : 'In Vat -';
  })();

  const vatAmount = (() => {
    if (priceExcludeVat != null && priceIncludeVat != null) {
      return formatCurrency(priceIncludeVat - priceExcludeVat);
    }
    return '-';
  })();

  return {
    mainPrice,
    alternatePrice,
    vatAmount,
    vatPercent: vatPercent ?? null, // Convert undefined to null
    shouldShowVatDetails: showVatDetails && hasPrice,
  };
};

export type IMatchingResultsDetailsReturn = {
  headerData: {
    filename: string;
    quantity: number;
    status: string;
    statusLabel: string;
    className?: string;
    statusIcon?: string;
    importedBy: string;
    importDate: string;
    statusCounts: Record<string, number>;
  };
  statusTabs: {
    key: string;
    label: string;
    count: number;
  }[];
  currentTab: IStatusTab;
  data: IBatchItem[];
  totalItems: number;
  isLoading: boolean;
  isError: boolean;
  showVatDetails: boolean;
  priceDisplayMode: string;
  priceDisplayOptions: typeof PRICE_DISPLAY_OPTIONS;
  currentPage: number;
  pageSize: number;
  handleTabChange: (tab: string) => void;
  handleVatDetailsToggle: (checked: boolean) => void;
  handlePriceDisplayModeChange: (value: string) => void;
  handlePageChange: (page: number, size: number) => void;
  handleSearch: (value: string) => void;
  searchTerm: string;
  handleDownloadMatchingResults: () => void;
  handleConfirmMatching: (itemKeys: React.Key[], reason: string) => void;
  isConfirming: boolean;
  isDownloadingMatching: boolean;
  selectedRowKeys: string[];
  selectedMatches: Map<string, number | string | null>;
  setSelectedMatches: (matches: Map<string, number | string | null>) => void;
  setSelectedRowKeys: (keys: string[]) => void;
  handleSelectMatch: (recordId: string | number, productUuid?: string | number | null) => void;
  handleSelectNoneAll: () => void;
  isAllNoneSelected: boolean;
  isSelectionOnlyAutoMatched: boolean;
  onSelectChange: (newSelectedRowKeys: React.Key[]) => void;
  calculatePriceDetails: (
    record: IBatchItem,
    priceType: string
  ) => {
    mainPrice: string;
    alternatePrice: string;
    vatAmount: string;
    vatPercent: number | null;
    shouldShowVatDetails: boolean;
  };
  importedStatusConfig: typeof IMPORTED_STATUS_CONFIG;
  matchingStatusConfig: typeof MATCHING_STATUS_CONFIG;
  availableForSaleConfig: typeof AVAILABLE_FOR_SALE_CONFIG;
  yesNoStatusConfig: typeof YES_NO_STATUS_CONFIG;
  defaultImportedStatus: string;
  unspecifiedText: string;
  importTypeConfig: typeof IMPORT_TYPE_CONFIG;
  autoMatchedMap: Map<string, number | string>;
  selectedItemsCache: Map<string, IBatchItem>;
  expandedSimilarItems: Set<string>;
  toggleExpandSimilar: (recordId: string | number) => void;
};

export const useMatchingResultsDetails = (id: string): IMatchingResultsDetailsReturn => {
  const router = useRouter();
  const { notification } = useNotification();
  const {
    selectedRowKeys,
    setSelectedRowKeys,
    selectedMatches,
    setSelectedMatches,
    setSelectMatch,
    autoMatchedMap,
    updateAutoMatchedMap,
    selectedItemsCache,
    updateSelectedItemsCache,
    resetStore,
    expandedSimilarItems,
    toggleExpandSimilar,
  } = useMatchingResultsDetailsStore();

  const [isPending, startTransition] = useTransition();

  const [currentTab, setCurrentTab] = useState<IStatusTab>(STATUS_TABS.imported as IStatusTab);
  const [showVatDetails, setShowVatDetails] = useState(DEFAULT_SHOW_VAT_DETAILS);
  const [priceDisplayMode, setPriceDisplayMode] = useState<IPriceDisplayMode>(
    DEFAULT_PRICE_DISPLAY_MODE
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    setCurrentPage(1);
    // Explicitly reset selection state on tab change or search
    // But we might want to keep expansion state or be more specific
    setSelectedRowKeys([]);
    setSelectedMatches(new Map());
  }, [debouncedSearchTerm, currentTab, setSelectedRowKeys, setSelectedMatches]);

  const matchStatus = TAB_TO_MATCH_STATUS_MAP[currentTab] || '';
  const {
    data: batchResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['batchItems', id, currentPage, pageSize, matchStatus, debouncedSearchTerm],
    queryFn: async () => {
      const response = await searchBatchItemList(id, {
        page: currentPage,
        limit: pageSize,
        matchStatus: matchStatus || undefined,
        search: debouncedSearchTerm || undefined,
      });
      return response.data;
    },
    enabled: !!id,
  });

  const data = batchResponse?.items || [];

  useEffect(() => {
    if (data && data.length > 0) {
      updateAutoMatchedMap(data);
      updateSelectedItemsCache(data);
    }
  }, [data, updateAutoMatchedMap, updateSelectedItemsCache]);

  const downloadMutation = useMutation({
    mutationFn: downloadMatchingResult,
    onSuccess: () => {
      notification.success({
        message: 'ดาวน์โหลดสำเร็จ',
        description: 'ดาวน์โหลดไฟล์เรียบร้อย',
        duration: 3,
      });
    },
    onError: () => {
      notification.error({
        message: 'ดาวน์โหลดไม่สำเร็จ',
        description: 'ไม่สามารถดาวน์โหลดไฟล์ได้ โปรดลองใหม่อีกครั้ง',
        duration: 3,
      });
    },
  });

  const queryClient = useQueryClient();

  const confirmMatchingSimilarMutation = useMutation({
    mutationFn: ({
      batchId,
      items,
    }: {
      batchId: string;
      items: IImportProductRequestConfirmSimilarPayloadItem[];
    }) => confirmMatchingSimilar(batchId, items),
    onSuccess: () => {
      notification.success({
        message: 'จับคู่สำเร็จ',
        description: 'สินค้าถูกจับคู่แล้ว ระบบจะนำสินค้าเข้าสู่ร้านค้า',
        duration: 3,
      });
      queryClient.invalidateQueries({ queryKey: ['batchItems', id] });
      resetStore();
      router.push('/products/matching');
    },
    onError: () => {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'โปรดลองใหม่อีกครั้ง',
        duration: 3,
      });
    },
  });

  const handleConfirmMatching = useCallback(
    (itemKeys: React.Key[], reason: string) => {
      if (!id || !itemKeys || itemKeys.length === 0) return;

      if ((currentTab as string) === 'similar') {
        const items = itemKeys
          .filter((key) => {
            const keyStr = String(key);
            if (autoMatchedMap.has(keyStr)) {
              return false;
            }
            return true;
          })
          .map((key): IImportProductRequestConfirmSimilarPayloadItem => {
            const keyStr = String(key);
            const productVariantId = selectedMatches.get(keyStr);
            if (productVariantId != null) {
              return {
                itemId: Number(keyStr),
                productVariantId: Number(productVariantId),
              };
            } else {
              return {
                itemId: Number(keyStr),
                reason: reason || 'User selected to send to admin',
              };
            }
          });

        if (items.length === 0) return;

        confirmMatchingSimilarMutation.mutate({ batchId: id as string, items });
      }
    },
    [id, currentTab, selectedMatches, confirmMatchingSimilarMutation, autoMatchedMap]
  );

  const handleSelectMatch = useCallback(
    (recordId: string | number, productUuid?: string | number | null) => {
      setSelectMatch(recordId, productUuid);
    },
    [setSelectMatch]
  );

  const onSelectChange = useCallback(
    (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys.map(String));
    },
    [setSelectedRowKeys]
  );

  const headerData = useMemo(() => {
    const batch = batchResponse?.batch;
    if (!batch) {
      return {
        filename: '-',
        quantity: 0,
        status: '-',
        statusLabel: '-',
        importedBy: '-',
        importDate: '-',
        statusCounts: {
          imported: 0,
          found: 0,
          similar: 0,
          notFound: 0,
        },
      };
    }

    const batchStatus = batch.status || '';
    const uiStatus = (STATUS_MAP[batchStatus as IStatusMapKey] ||
      batchStatus.toLowerCase()) as IStatusConfigKey;
    const config = STATUS_CONFIG[uiStatus];

    return {
      filename: batch.filename || '-',
      quantity: batch.validationPassCount || 0,
      status: batchStatus,
      statusLabel: config?.text || batchStatus,
      className: config?.className,
      statusIcon: config?.icon,
      importedBy: batch.createdBy || '-',
      importDate: batch.createdAt ? formatDateTime(batch.createdAt) : '-',
      statusCounts: {
        imported: batch.validationPassCount || 0,
        found: batch.matchedCount || 0,
        similar: batch.similarCount || 0,
        notFound: batch.notFoundCount || 0,
      },
    };
  }, [batchResponse]);

  const statusTabs = useMemo(
    () =>
      Object.values(STATUS_TABS).map((key) => ({
        key,
        label: STATUS_TAB_LABELS[key],
        count: headerData.statusCounts?.[key as keyof typeof headerData.statusCounts] || 0,
      })),
    [headerData.statusCounts]
  );

  useEffect(() => {
    if ((currentTab as string) === 'similar' && data && data.length > 0) {
      const itemsToAutoSelect = data.filter((item: IBatchItem) => !!item.matchedProductVariantId);
      if (itemsToAutoSelect.length > 0) {
        // Only run if we actually have items that aren't in selection yet
        const hasNewAutoMatches = itemsToAutoSelect.some(
          (item) =>
            !selectedRowKeys.includes(String(item.id)) || !selectedMatches.has(String(item.id))
        );

        if (hasNewAutoMatches) {
          const nextKeys = [...selectedRowKeys];
          const nextMatches = new Map(selectedMatches);

          itemsToAutoSelect.forEach((item: IBatchItem) => {
            const idStr = String(item.id);
            if (!nextKeys.includes(idStr)) {
              nextKeys.push(idStr);
            }
            if (!nextMatches.has(idStr) && item.matchedProductVariantId != null) {
              nextMatches.set(idStr, String(item.matchedProductVariantId));
            }
          });

          setSelectedRowKeys(nextKeys);
          setSelectedMatches(nextMatches);
        }
      }
    }
    // We only want to re-run auto-selection when data changes or tab changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, currentTab]);

  const isSelectionOnlyAutoMatched = useMemo(() => {
    if ((currentTab as string) !== 'similar' || selectedRowKeys.length === 0) return false;

    return selectedRowKeys.every((key) => {
      const keyStr = String(key);
      const autoVariantId = autoMatchedMap.get(keyStr);

      if (!autoVariantId) return false;

      const currentSelection = selectedMatches.get(keyStr);

      return String(currentSelection) === String(autoVariantId);
    });
  }, [currentTab, selectedRowKeys, autoMatchedMap, selectedMatches]);

  const totalItems = batchResponse?.pagination?.total || 0;

  const handleTabChange = useCallback((tab: string) => {
    startTransition(() => {
      setCurrentTab(tab as IStatusTab);
      setCurrentPage(1);
      setSearchTerm('');
    });
  }, []);

  const handleVatDetailsToggle = useCallback((checked: boolean) => {
    setShowVatDetails(checked);
  }, []);

  const handlePriceDisplayModeChange = useCallback((value: string) => {
    startTransition(() => {
      setPriceDisplayMode(value as IPriceDisplayMode);
    });
  }, []);

  const handlePageChange = useCallback(
    (page: number, size: number) => {
      if (size !== pageSize) {
        setCurrentPage(1);
        setPageSize(size);
      } else {
        setCurrentPage(page);
      }
    },
    [pageSize]
  );

  const handleSelectNoneAll = useCallback(() => {
    const currentData = data || [];
    const rowsWithSuggestions = currentData.filter(
      (item: IBatchItem) => item.suggestedProducts && item.suggestedProducts.length > 0
    );

    if (rowsWithSuggestions.length === 0) return;

    const isAllNone = rowsWithSuggestions.every((item: IBatchItem) => {
      const idStr = String(item.id);
      return selectedMatches.has(idStr) && selectedMatches.get(idStr) === null;
    });

    if (isAllNone) {
      const nextMatches = new Map(selectedMatches);
      const nextKeys = [...selectedRowKeys];

      rowsWithSuggestions.forEach((item: IBatchItem) => {
        const idStr = String(item.id);
        nextMatches.delete(idStr);
        const index = nextKeys.indexOf(idStr);
        if (index > -1) nextKeys.splice(index, 1);
      });

      setSelectedMatches(nextMatches);
      setSelectedRowKeys(nextKeys);
    } else {
      const nextMatches = new Map(selectedMatches);
      const nextKeys = [...selectedRowKeys];

      rowsWithSuggestions.forEach((item: IBatchItem) => {
        const idStr = String(item.id);
        nextMatches.set(idStr, null);
        if (!nextKeys.includes(idStr)) nextKeys.push(idStr);
      });

      setSelectedMatches(nextMatches);
      setSelectedRowKeys(nextKeys);
    }
  }, [data, selectedMatches, selectedRowKeys, setSelectedMatches, setSelectedRowKeys]);

  const isAllNoneSelected = useMemo(() => {
    const currentData = data || [];
    const rowsWithSuggestions = currentData.filter(
      (item: IBatchItem) => item.suggestedProducts && item.suggestedProducts.length > 0
    );
    if (rowsWithSuggestions.length === 0) return false;

    return rowsWithSuggestions.every((item: IBatchItem) => {
      const idStr = String(item.id);
      return selectedMatches.has(idStr) && selectedMatches.get(idStr) === null;
    });
  }, [data, selectedMatches]);

  const handleSearch = useCallback((value: string) => {
    startTransition(() => {
      setSearchTerm(value);
    });
  }, []);

  const handleDownloadMatchingResults = useCallback(() => {
    if (id) {
      downloadMutation.mutate(id);
    }
  }, [id, downloadMutation]);

  return {
    headerData,
    statusTabs,
    currentTab,
    data,
    totalItems,
    isLoading: isLoading || isPending,
    isError,
    showVatDetails,
    priceDisplayMode,
    priceDisplayOptions: PRICE_DISPLAY_OPTIONS,
    currentPage,
    pageSize,
    handleTabChange,
    handleVatDetailsToggle,
    handlePriceDisplayModeChange,
    handlePageChange,
    handleSearch,
    searchTerm,
    handleDownloadMatchingResults,
    handleConfirmMatching,
    isConfirming: confirmMatchingSimilarMutation.isPending,
    isDownloadingMatching: downloadMutation.isPending,
    selectedRowKeys,
    selectedMatches,
    setSelectedMatches,
    setSelectedRowKeys,
    handleSelectMatch,
    handleSelectNoneAll,
    isAllNoneSelected,
    isSelectionOnlyAutoMatched,
    onSelectChange,
    calculatePriceDetails: useCallback(
      (record: IBatchItem, priceType: string) =>
        calculatePriceDetails(record, priceType, showVatDetails, priceDisplayMode),
      [showVatDetails, priceDisplayMode]
    ),
    importedStatusConfig: IMPORTED_STATUS_CONFIG,
    matchingStatusConfig: MATCHING_STATUS_CONFIG,
    availableForSaleConfig: AVAILABLE_FOR_SALE_CONFIG,
    yesNoStatusConfig: YES_NO_STATUS_CONFIG,
    defaultImportedStatus: DEFAULT_IMPORTED_STATUS,
    unspecifiedText: UNSPECIFIED_TEXT,
    importTypeConfig: IMPORT_TYPE_CONFIG,
    autoMatchedMap,
    selectedItemsCache,
    expandedSimilarItems,
    toggleExpandSimilar,
  };
};
