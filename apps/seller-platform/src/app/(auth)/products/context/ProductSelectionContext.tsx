"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { IProductResponseMerchantProduct } from "@/interfaces/product/product.response.interface";
import { STORAGE_KEYS, DEBOUNCE_TIMINGS } from "../constants/products.constants";

interface ProductSelectionContextValue {
  selectedRowKeys: Set<React.Key>;
  selectedCount: number;
  getSelectedKeysArray: () => React.Key[];
  hasSelectedKey: (key: React.Key) => boolean;
  addSelectedKey: (key: React.Key, product?: IProductResponseMerchantProduct) => void;
  removeSelectedKey: (key: React.Key) => void;
  setSelectedKeys: (keys: React.Key[]) => void;
  cacheProduct: (product: IProductResponseMerchantProduct) => void;
  removeCachedProduct: (key: React.Key) => void;
  getAllCachedProducts: () => IProductResponseMerchantProduct[];
  clearAll: () => void;
}

const ProductSelectionContext = createContext<
  ProductSelectionContextValue | undefined
>(undefined);

interface ProductSelectionProviderProps {
  children: ReactNode;
}

export const ProductSelectionProvider: React.FC<
  ProductSelectionProviderProps
> = ({ children }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<React.Key>>(
    new Set()
  );
  const [productCache, setProductCache] = useState<
    Map<React.Key, IProductResponseMerchantProduct>
  >(new Map());

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  // Restore from sessionStorage on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    try {
      const storedKeys = sessionStorage.getItem(
        STORAGE_KEYS.SELECTED_PRODUCT_ROW_KEYS
      );
      const storedCache = sessionStorage.getItem(
        STORAGE_KEYS.SELECTED_PRODUCT_CACHE
      );

      if (storedKeys) {
        const keys = JSON.parse(storedKeys) as React.Key[];
        setSelectedRowKeys(new Set(keys));
      }

      if (storedCache) {
        const cache = JSON.parse(storedCache) as Array<
          [React.Key, IProductResponseMerchantProduct]
        >;
        setProductCache(new Map(cache));
      }
    } catch (error) {
      console.error("Failed to restore product selection from storage:", error);
    }
  }, []);

  // Debounced sync to sessionStorage
  const syncToStorage = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        // Save selected keys
        const keysArray = Array.from(selectedRowKeys);
        sessionStorage.setItem(
          STORAGE_KEYS.SELECTED_PRODUCT_ROW_KEYS,
          JSON.stringify(keysArray)
        );

        // Save product cache
        const cacheArray = Array.from(productCache.entries());
        sessionStorage.setItem(
          STORAGE_KEYS.SELECTED_PRODUCT_CACHE,
          JSON.stringify(cacheArray)
        );

        // Save variant IDs for convenience
        const variantIds = Array.from(productCache.values())
          .map((p) => p.productVariant?.id)
          .filter((id): id is number => id !== undefined);
        sessionStorage.setItem(
          STORAGE_KEYS.SELECTED_PRODUCT_VARIANT_IDS,
          JSON.stringify(variantIds)
        );
      } catch (error) {
        console.error("Failed to sync product selection to storage:", error);
      }
    }, DEBOUNCE_TIMINGS.STORAGE_SYNC);
  }, [selectedRowKeys, productCache]);

  // Sync whenever selection changes
  useEffect(() => {
    if (hasInitializedRef.current) {
      syncToStorage();
    }
  }, [syncToStorage]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const getSelectedKeysArray = useCallback(() => {
    return Array.from(selectedRowKeys);
  }, [selectedRowKeys]);

  const hasSelectedKey = useCallback(
    (key: React.Key) => {
      return selectedRowKeys.has(key);
    },
    [selectedRowKeys]
  );

  const addSelectedKey = useCallback(
    (key: React.Key, product?: IProductResponseMerchantProduct) => {
      setSelectedRowKeys((prev) => {
        const newSet = new Set(prev);
        newSet.add(key);
        return newSet;
      });

      if (product) {
        setProductCache((prev) => {
          const newMap = new Map(prev);
          newMap.set(key, product);
          return newMap;
        });
      }
    },
    []
  );

  const removeSelectedKey = useCallback((key: React.Key) => {
    setSelectedRowKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });

    setProductCache((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const setSelectedKeys = useCallback((keys: React.Key[]) => {
    setSelectedRowKeys(new Set(keys));
  }, []);

  const cacheProduct = useCallback((product: IProductResponseMerchantProduct) => {
    setProductCache((prev) => {
      const newMap = new Map(prev);
      newMap.set(product.id, product);
      return newMap;
    });
  }, []);

  const removeCachedProduct = useCallback((key: React.Key) => {
    setProductCache((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const getAllCachedProducts = useCallback(() => {
    return Array.from(productCache.values());
  }, [productCache]);

  const clearAll = useCallback(() => {
    setSelectedRowKeys(new Set());
    setProductCache(new Map());

    // Clear sessionStorage
    try {
      sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PRODUCT_ROW_KEYS);
      sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PRODUCT_CACHE);
      sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PRODUCT_VARIANT_IDS);
      sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PRODUCT_DATA);
    } catch (error) {
      console.error("Failed to clear product selection storage:", error);
    }
  }, []);

  const value: ProductSelectionContextValue = {
    selectedRowKeys,
    selectedCount: selectedRowKeys.size,
    getSelectedKeysArray,
    hasSelectedKey,
    addSelectedKey,
    removeSelectedKey,
    setSelectedKeys,
    cacheProduct,
    removeCachedProduct,
    getAllCachedProducts,
    clearAll,
  };

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
};

export const useProductSelection = () => {
  const context = useContext(ProductSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useProductSelection must be used within a ProductSelectionProvider"
    );
  }
  return context;
};
