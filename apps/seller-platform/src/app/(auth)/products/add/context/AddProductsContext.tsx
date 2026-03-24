"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { STEPS, Step } from '../AddProducts.constants';
import type { IMerchantItem } from '@/interfaces/merchant/merchant.response.interface';
import type { IProductImport } from '@/interfaces/product/product.response.interface';

/**
 * AddProductsContext - Centralized state management for AddProducts component
 * Simplified for single-merchant use case in the new project
 */

// Transformed product type for display (used in listCanAdd/listCanNotAdd)
interface ITransformedProduct {
  name: string;
  barcode: string;
  id: string;
  categoryName: string;
  brand: string;
  image: string;
}

interface AddProductsContextType {
  // Step Navigation
  step: Step;
  setStep: (step: Step) => void;

  // Product Search State
  products: IProductImport[];
  setProducts: (products: IProductImport[]) => void;
  total: number;
  setTotal: (total: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  filter: { searchType: string; search: string } | null;
  setFilter: (filter: { searchType: string; search: string } | null) => void;
  tempFilter: { searchType: string; search: string };
  setTempFilter: (filter: { searchType: string; search: string }) => void;
  selectedProducts: IProductImport[];
  setSelectedProducts: (products: IProductImport[]) => void;

  // Add Product Modal State
  selectedAddProductsKey: React.Key[];
  setSelectedAddProductsKey: (keys: React.Key[] | ((prev: React.Key[]) => React.Key[])) => void;
  selectedAddProducts: IProductImport[];
  setSelectedAddProducts: (products: IProductImport[] | ((prev: IProductImport[]) => IProductImport[])) => void;
  listCanAdd: ITransformedProduct[];
  setListCanAdd: (products: ITransformedProduct[] | ((prev: ITransformedProduct[]) => ITransformedProduct[])) => void;
  listCanNotAdd: ITransformedProduct[];
  setListCanNotAdd: (products: ITransformedProduct[]) => void;
  totalAddableMerchant: number;
  setTotalAddableMerchant: (count: number) => void;

  // Merchant Selection State
  merchants: IMerchantItem[];
  setMerchants: (merchants: IMerchantItem[]) => void;
  isOnHeadOffice: boolean;
  setIsOnHeadOffice: (value: boolean) => void;
  headOfficeUuid: string | null;
  setHeadOfficeUuid: (uuid: string | null) => void;
  isLoadingMerchants: boolean;
  setIsLoadingMerchants: (loading: boolean) => void;
  selectedMerchants: string[];
  setSelectedMerchants: (merchants: string[]) => void;
  hasMerchantInitialized: boolean;
  setHasMerchantInitialized: (initialized: boolean) => void;
  merchantCheckAll: boolean;
  merchantIndeterminate: boolean;
  handleMerchantCheckAllChange: (e: CheckboxChangeEvent) => void;
  handleMerchantChange: (list: string[]) => void;

  // Loading States
  isCheckingDuplicates: boolean;
  setIsCheckingDuplicates: (loading: boolean) => void;
}

const AddProductsContext = createContext<AddProductsContextType | undefined>(undefined);

// Provider Component
export const AddProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Step Navigation
  const [step, setStep] = useState<Step>(STEPS.PRODUCT_SELECTION);

  // Product Search State
  const [products, setProducts] = useState<IProductImport[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<{ searchType: string; search: string } | null>(null);
  const [tempFilter, setTempFilter] = useState({ searchType: 'all', search: '' });
  const [selectedProducts, setSelectedProducts] = useState<IProductImport[]>([]);

  // Add Product Modal State
  const [selectedAddProductsKey, setSelectedAddProductsKey] = useState<React.Key[]>([]);
  const [selectedAddProducts, setSelectedAddProducts] = useState<IProductImport[]>([]);
  const [listCanAdd, setListCanAdd] = useState<ITransformedProduct[]>([]);
  const [listCanNotAdd, setListCanNotAdd] = useState<ITransformedProduct[]>([]);
  const [totalAddableMerchant, setTotalAddableMerchant] = useState(0);

  // Merchant Selection State
  const [merchants, setMerchants] = useState<IMerchantItem[]>([]);
  const [isOnHeadOffice, setIsOnHeadOffice] = useState(false);
  const [headOfficeUuid, setHeadOfficeUuid] = useState<string | null>(null);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState(false);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [hasMerchantInitialized, setHasMerchantInitialized] = useState(false);

  // Computed values for merchant selection
  const merchantPlainOptions = merchants.map((item) => item.uuid);
  const merchantCheckAll =
    merchants.length > 0 && merchants.length === selectedMerchants.length;
  const merchantIndeterminate =
    selectedMerchants.length > 0 && selectedMerchants.length < merchants.length;

  // Merchant selection handlers
  const handleMerchantCheckAllChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setSelectedMerchants(merchantPlainOptions);
    } else {
      const newSelection = isOnHeadOffice && headOfficeUuid ? [headOfficeUuid] : [];
      setSelectedMerchants(newSelection);
    }
  };

  const handleMerchantChange = (list: string[]) => {
    if (isOnHeadOffice && headOfficeUuid && !list.includes(headOfficeUuid)) {
      setSelectedMerchants([headOfficeUuid, ...list]);
    } else {
      setSelectedMerchants(list);
    }
  };

  // Loading States
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const value: AddProductsContextType = {
    // Step Navigation
    step,
    setStep,

    // Product Search
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

    // Add Product Modal
    selectedAddProductsKey,
    setSelectedAddProductsKey,
    selectedAddProducts,
    setSelectedAddProducts,
    listCanAdd,
    setListCanAdd,
    listCanNotAdd,
    setListCanNotAdd,
    totalAddableMerchant,
    setTotalAddableMerchant,

    // Merchant Selection
    merchants,
    setMerchants,
    isOnHeadOffice,
    setIsOnHeadOffice,
    headOfficeUuid,
    setHeadOfficeUuid,
    isLoadingMerchants,
    setIsLoadingMerchants,
    selectedMerchants,
    setSelectedMerchants,
    hasMerchantInitialized,
    setHasMerchantInitialized,
    merchantCheckAll,
    merchantIndeterminate,
    handleMerchantCheckAllChange,
    handleMerchantChange,

    // Loading States
    isCheckingDuplicates,
    setIsCheckingDuplicates,
  };

  return (
    <AddProductsContext.Provider value={value}>
      {children}
    </AddProductsContext.Provider>
  );
};

// Custom Hook
export const useAddProductsContext = () => {
  const context = useContext(AddProductsContext);

  if (!context) {
    throw new Error(
      'useAddProductsContext must be used within AddProductsProvider'
    );
  }

  return context;
};

export default AddProductsContext;
