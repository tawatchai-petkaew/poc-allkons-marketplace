import { create } from 'zustand';
import type { IBatchItem } from '@/interfaces/product/import-product.response.interface';

interface MatchingResultsDetailsState {
  // Selection State
  selectedRowKeys: string[];
  selectedMatches: Map<string, number | string | null>;
  autoMatchedMap: Map<string, number | string>;

  // UI State
  expandedSimilarItems: Set<string>;
  selectedItemsCache: Map<string, IBatchItem>;

  // Actions
  setSelectedRowKeys: (keys: string[]) => void;
  setSelectedMatches: (matches: Map<string, number | string | null>) => void;
  setSelectMatch: (recordId: string | number, productUuid?: number | string | null) => void;
  setAutoMatchedMap: (map: Map<string, number | string>) => void;
  updateAutoMatchedMap: (items: IBatchItem[]) => void;

  setExpandedSimilarItems: (items: Set<string>) => void;
  toggleExpandSimilar: (recordId: string | number) => void;

  setSelectedItemsCache: (cache: Map<string, IBatchItem>) => void;
  updateSelectedItemsCache: (items: IBatchItem[]) => void;

  resetStore: () => void;
}

const initialState: Pick<
  MatchingResultsDetailsState,
  | 'selectedRowKeys'
  | 'selectedMatches'
  | 'autoMatchedMap'
  | 'expandedSimilarItems'
  | 'selectedItemsCache'
> = {
  selectedRowKeys: [],
  selectedMatches: new Map(),
  autoMatchedMap: new Map(),
  expandedSimilarItems: new Set(),
  selectedItemsCache: new Map(),
};

export const useMatchingResultsDetailsStore = create<MatchingResultsDetailsState>((set) => ({
  ...initialState,

  setSelectedRowKeys: (selectedRowKeys) => set({ selectedRowKeys }),

  setSelectedMatches: (selectedMatches) => set({ selectedMatches: new Map(selectedMatches) }),

  setSelectMatch: (recordId, productUuid) =>
    set((state) => {
      const nextMatches = new Map(state.selectedMatches);
      const nextKeys = [...state.selectedRowKeys];
      const recordIdStr = String(recordId);

      if (productUuid === undefined) {
        nextMatches.delete(recordIdStr);
        const index = nextKeys.indexOf(recordIdStr);
        if (index > -1) nextKeys.splice(index, 1);
      } else {
        nextMatches.set(recordIdStr, productUuid != null ? String(productUuid) : null);
        if (!nextKeys.includes(recordIdStr)) {
          nextKeys.push(recordIdStr);
        }
      }

      return {
        selectedMatches: nextMatches,
        selectedRowKeys: nextKeys,
      };
    }),

  setAutoMatchedMap: (autoMatchedMap) => set({ autoMatchedMap: new Map(autoMatchedMap) }),

  updateAutoMatchedMap: (items) =>
    set((state) => {
      const next = new Map(state.autoMatchedMap);
      let hasChanges = false;
      items.forEach((item) => {
        const idStr = String(item.id);
        if (item.matchedProductVariantId && !next.has(idStr)) {
          next.set(idStr, String(item.matchedProductVariantId));
          hasChanges = true;
        }
      });
      return hasChanges ? { autoMatchedMap: next } : {};
    }),

  setExpandedSimilarItems: (expandedSimilarItems) =>
    set({ expandedSimilarItems: new Set(expandedSimilarItems) }),

  toggleExpandSimilar: (recordId) =>
    set((state) => {
      const next = new Set(state.expandedSimilarItems);
      const idStr = String(recordId);
      if (next.has(idStr)) {
        next.delete(idStr);
      } else {
        next.add(idStr);
      }
      return { expandedSimilarItems: next };
    }),

  setSelectedItemsCache: (selectedItemsCache) =>
    set({ selectedItemsCache: new Map(selectedItemsCache) }),

  updateSelectedItemsCache: (items) =>
    set((state) => {
      const next = new Map(state.selectedItemsCache);
      items.forEach((item) => {
        const idStr = String(item.id);
        next.set(idStr, item);
      });
      return { selectedItemsCache: next };
    }),

  resetStore: () => set(initialState),
}));
