import { create } from 'zustand';

interface FilterState {
  search: string;
  status: string;
}

interface ProductMatchingState {
  isImportModalOpen: boolean;
  filter: FilterState;
  searchInput: string;
  currentPage: number;
  pageSize: number;

  setIsImportModalOpen: (isOpen: boolean) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  setSearchInput: (searchInput: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
}

const initialState = {
  isImportModalOpen: false,
  filter: { search: '', status: 'all' },
  searchInput: '',
  currentPage: 1,
  pageSize: 10,
};

export const useProductMatchingStore = create<ProductMatchingState>((set) => ({
  ...initialState,

  setIsImportModalOpen: (isOpen) => set({ isImportModalOpen: isOpen }),

  setFilter: (newFilter) => set((state) => ({ filter: { ...state.filter, ...newFilter } })),

  setSearchInput: (searchInput) => set({ searchInput }),

  setCurrentPage: (currentPage) => set({ currentPage }),

  setPageSize: (pageSize) => set({ pageSize }),

  resetFilters: () =>
    set({
      filter: initialState.filter,
      searchInput: initialState.searchInput,
      currentPage: 1,
    }),
}));
