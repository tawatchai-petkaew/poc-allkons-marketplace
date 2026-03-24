"use client";

import { useState } from "react";
import Typography from "@/components/Typography";
import CustomButton from "@/components/Button";
import SelectField from "@/components/DataEntry/Select";
import TextField from "@/components/DataEntry/TextField";
import {
  SEARCH_TYPE_OPTIONS,
  SEARCH_PLACEHOLDER_MAP,
  PRODUCTS_FILTER_UI,
  TempFilterState,
  SearchType,
} from "../constants/products.constants";
import { CategorySelectionModal } from "./CategorySelectionModal";
import { getSelectedCategoryNamesWithKeys } from "../utils/categoryHelpers";
import type { DataNode } from "antd/es/tree";

export interface CategoryTreeNode extends DataNode {
  title: React.ReactNode;
  key: React.Key;
  children?: CategoryTreeNode[];
}

export interface ProductsFilterSectionProps {
  tempFilter: TempFilterState;
  onTempFilterChange: (updates: Partial<TempFilterState>) => void;
  productTypeOptions: Array<{ value: string; label: string }>;
  categoryTreeData: CategoryTreeNode[];
  tempCategoryFilter: React.Key[];
  onTempCategoryFilterChange: (keys: React.Key[]) => void;
  onSearch: () => void;
  onReset: () => void;
}

export const ProductsFilterSection: React.FC<ProductsFilterSectionProps> = ({
  tempFilter,
  onTempFilterChange,
  productTypeOptions,
  categoryTreeData,
  tempCategoryFilter,
  onTempCategoryFilterChange,
  onSearch,
  onReset,
}) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<React.Key[]>([]);

  const selectedCategoryData = getSelectedCategoryNamesWithKeys(
    tempCategoryFilter,
    categoryTreeData
  );

  const handleOpenCategoryModal = () => {
    if (tempCategoryFilter.length > 0) {
      setSelectedCategories(tempCategoryFilter);
    }
    setIsCategoryModalOpen(true);
  };

  const handleConfirmCategories = () => {
    onTempCategoryFilterChange(selectedCategories);
    setIsCategoryModalOpen(false);
  };

  const searchPlaceholder =
    SEARCH_PLACEHOLDER_MAP[tempFilter.searchType] ?? SEARCH_PLACEHOLDER_MAP._default;

  return (
    <>
      <div className="p-6 bg-white rounded-lg">
        <div className="flex flex-wrap gap-3 justify-between items-end">
          <div className="grid grid-cols-4 gap-4 flex-0 md:flex-1 items-end [&_.ant-form-item-explain-connected]:!hidden [&_.ant-form-item-explain]:!hidden">
            <SelectField
              label={PRODUCTS_FILTER_UI.SEARCH_TYPE_LABEL}
              placeholder={PRODUCTS_FILTER_UI.SEARCH_TYPE_PLACEHOLDER}
              options={[...SEARCH_TYPE_OPTIONS]}
              vertical
              className="!h-[40px] [&_.ant-select-selector]:!h-[40px]"
              value={tempFilter.searchType}
              onChange={(value) =>
                onTempFilterChange({ searchType: value as SearchType })
              }
            />
            <TextField
              label={PRODUCTS_FILTER_UI.SEARCH_LABEL}
              vertical
              placeholder={searchPlaceholder}
              prefix={<i className="ri-search-line"></i>}
              value={tempFilter.search}
              onChange={(e) => onTempFilterChange({ search: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch();
                }
              }}
            />
            <SelectField
              label={PRODUCTS_FILTER_UI.PRODUCT_TYPE_LABEL}
              placeholder={PRODUCTS_FILTER_UI.PRODUCT_TYPE_PLACEHOLDER}
              options={productTypeOptions}
              vertical
              className="!h-[40px] [&_.ant-select-selector]:!h-[40px]"
              value={tempFilter.productType}
              onChange={(value) =>
                onTempFilterChange({ productType: value as string })
              }
            />
            <div className="flex flex-col gap-2">
              <Typography variant="paragraph-small">{PRODUCTS_FILTER_UI.CATEGORY_LABEL}</Typography>
              <div
                className="w-fit h-fit cursor-pointer flex gap-2 items-center justify-center px-4 py-2 border border-border-primary rounded-xl"
                onClick={handleOpenCategoryModal}
              >
                <i className="ri-list-check-2 text-xl" />
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-primary !font-semibold !line-clamp-1"
                >
                  {PRODUCTS_FILTER_UI.CATEGORY_BTN}
                </Typography>
                {tempCategoryFilter.length > 0 && (
                  <div className="bg-primary w-5 h-5 text-xs text-white rounded-full flex justify-center items-center">
                    {selectedCategoryData.length}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <CustomButton color="neutral" variant="outlined" onClick={onReset}>
              {PRODUCTS_FILTER_UI.BTN_RESET}
            </CustomButton>
            <CustomButton onClick={onSearch}>{PRODUCTS_FILTER_UI.BTN_SEARCH}</CustomButton>
          </div>
        </div>
      </div>

      <CategorySelectionModal
        visible={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryTreeData={categoryTreeData}
        selectedCategories={selectedCategories}
        onSelectedCategoriesChange={setSelectedCategories}
        onConfirm={handleConfirmCategories}
      />
    </>
  );
};
