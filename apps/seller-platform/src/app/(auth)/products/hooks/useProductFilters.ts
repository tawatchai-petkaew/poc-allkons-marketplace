import { INITIAL_FILTER, INITIAL_TEMP_FILTER, SearchType } from "../constants/products.constants";
import { FilterState, TempFilterState } from "../constants/products.constants";
import { useState, useCallback } from "react";

export const useProductFilters = () => {
  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER);
  const [tempFilter, setTempFilter] =
    useState<TempFilterState>(INITIAL_TEMP_FILTER);
  const [tempCategoryFilter, setTempCategoryFilter] = useState<React.Key[]>([]);

  const applyFilters = useCallback(
    (resetPage?: () => void) => {
      setFilter({
        ...tempFilter,
        status: filter.status,
        categories:
          tempCategoryFilter.length > 0
            ? tempCategoryFilter.map((key) => Number(key))
            : undefined,
      });

      if (resetPage) {
        resetPage();
      }
    },
    [tempFilter, tempCategoryFilter, filter.status]
  );

  const resetFilters = useCallback(
    (resetPage?: () => void) => {
      setTempFilter(INITIAL_TEMP_FILTER);
      setTempCategoryFilter([]);
      setFilter({ ...INITIAL_TEMP_FILTER, status: filter.status });

      if (resetPage) {
        resetPage();
      }
    },
    [filter.status]
  );

  const updateTempFilter = useCallback(
    (updates: Partial<TempFilterState>) => {
      setTempFilter((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const updateStatus = useCallback(
    (status: string, resetPage?: () => void) => {
      setFilter((prev) => ({ ...prev, status }));

      if (resetPage) {
        resetPage();
      }
    },
    []
  );

  return {
    filter,
    tempFilter,
    tempCategoryFilter,
    setTempCategoryFilter,
    updateTempFilter,
    applyFilters,
    resetFilters,
    updateStatus,
  };
};
