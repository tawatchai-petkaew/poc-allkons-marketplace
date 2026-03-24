"use client";

import { useState, useRef, useMemo } from "react";
import { Tree } from "antd";
import ResponsivePopup from "@/components/Popup";
import Typography from "@/components/Typography";
import TextField from "@/components/DataEntry/TextField";
import CustomButton from "@/components/Button";
import {
  filterTreeData,
  getHighlightedTreeData,
  getAllKeys,
  getSelectedCategoryNamesWithKeys,
} from "../utils/categoryHelpers";
import { CATEGORY_MODAL_UI, CATEGORY_MODAL_SCROLL_DELAY } from "../constants/products.constants";
import type { DataNode } from "antd/es/tree";

export interface CategoryTreeNode extends DataNode {
  title: React.ReactNode;
  key: React.Key;
  children?: CategoryTreeNode[];
}

export interface CategorySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  categoryTreeData: CategoryTreeNode[];
  selectedCategories: React.Key[];
  onSelectedCategoriesChange: (keys: React.Key[]) => void;
  onConfirm: () => void;
}

export const CategorySelectionModal: React.FC<
  CategorySelectionModalProps
> = ({
  visible,
  onClose,
  categoryTreeData,
  selectedCategories,
  onSelectedCategoriesChange,
  onConfirm,
}) => {
  const [searchCategoryInput, setSearchCategoryInput] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const filteredTreeData = useMemo(
    () => filterTreeData(categoryTreeData, searchCategory),
    [categoryTreeData, searchCategory]
  );

  const highlightedTreeData = useMemo(
    () => getHighlightedTreeData(filteredTreeData, searchCategory),
    [filteredTreeData, searchCategory]
  );

  const visibleKeys = useMemo(
    () => getAllKeys(filteredTreeData),
    [filteredTreeData]
  );

  const selectedCategoryData = useMemo(
    () => getSelectedCategoryNamesWithKeys(selectedCategories, categoryTreeData),
    [selectedCategories, categoryTreeData]
  );

  const handleSearchCategory = () => {
    setSearchCategory(searchCategoryInput);

    if (searchCategoryInput) {
      setExpandedKeys(visibleKeys);

      if (treeContainerRef.current) {
        setTimeout(() => {
          treeContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }, CATEGORY_MODAL_SCROLL_DELAY);
      }
    } else {
      setExpandedKeys([]);
    }
  };

  const handleResetCategory = () => {
    onSelectedCategoriesChange([]);
    setExpandedKeys([]);
    setSearchCategoryInput("");
    setSearchCategory("");

    if (treeContainerRef.current) {
      treeContainerRef.current.scrollTop = 0;
    }
  };

  const handleClose = () => {
    handleResetCategory();
    onClose();
  };

  const handleConfirm = () => {
    setExpandedKeys([]);
    setSearchCategoryInput("");
    setSearchCategory("");
    onConfirm();
  };

  const handleClearSearch = () => {
    setExpandedKeys([]);
    setSearchCategoryInput("");
    setSearchCategory("");

    if (treeContainerRef.current) {
      treeContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <ResponsivePopup
      visible={visible}
      onClose={handleClose}
      modalTitle={<Typography variant="h4">{CATEGORY_MODAL_UI.TITLE}</Typography>}
      drawerTitle={<Typography variant="h4">{CATEGORY_MODAL_UI.TITLE}</Typography>}
      modalProps={{ width: 800 }}
    >
      <div className="flex flex-col gap-4 mt-6 max-h-[80vh]">
        <div className="flex gap-2">
          <TextField
            placeholder={CATEGORY_MODAL_UI.SEARCH_PLACEHOLDER}
            prefix={<i className="ri-search-line"></i>}
            value={searchCategoryInput}
            onChange={(e) => setSearchCategoryInput(e.target.value)}
            allowClear
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchCategory();
              }
            }}
            onClear={handleClearSearch}
          />
          <CustomButton onClick={handleSearchCategory}>{CATEGORY_MODAL_UI.BTN_SEARCH}</CustomButton>
        </div>

        {selectedCategoryData.length > 0 && (
          <div className="bg-surface-primary rounded-lg">
            <Typography
              variant="paragraph-medium"
              className="!text-text-tertiary mb-2"
            >
              {CATEGORY_MODAL_UI.SELECTED_COUNT(selectedCategoryData.length)}
            </Typography>
            <div className="flex flex-wrap items-start p-3 gap-2 bg-background-secondary min-h-[84px] rounded-xl">
              {selectedCategoryData.map((item, index) => (
                <div
                  key={index}
                  className="bg-primary-subtle border border-primary pl-3 pr-2 py-[2px] rounded-full flex items-center gap-2"
                >
                  <Typography
                    variant="paragraph-small"
                    className="!text-primary"
                  >
                    {item.name}
                  </Typography>
                  <i
                    className="ri-close-line cursor-pointer text-primary"
                    onClick={() => {
                      const newSelected = selectedCategories.filter(
                        (key) => !item.keys.includes(key)
                      );
                      onSelectedCategoriesChange(newSelected);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Tree */}
        <div ref={treeContainerRef} className="max-h-[500px] overflow-y-auto">
          {highlightedTreeData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[360px]">
              <Typography
                variant="paragraph-medium"
                className="text-text-secondary"
              >
                {CATEGORY_MODAL_UI.EMPTY_TEXT}
              </Typography>
            </div>
          ) : (
            <Tree
              checkable
              selectable={false}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              checkedKeys={selectedCategories}
              onCheck={(checkedKeys) => {
                const hiddenKeys = selectedCategories.filter(
                  (key) => !visibleKeys.includes(key)
                );

                const newChecked = Array.isArray(checkedKeys)
                  ? checkedKeys
                  : checkedKeys.checked;

                onSelectedCategoriesChange([...hiddenKeys, ...newChecked]);
              }}
              treeData={highlightedTreeData}
              className="[&_.anticon]:!text-[#008C36]"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <CustomButton
            variant="outlined"
            color="neutral"
            onClick={handleResetCategory}
          >
            {CATEGORY_MODAL_UI.BTN_RESET}
          </CustomButton>
          <CustomButton onClick={handleConfirm}>{CATEGORY_MODAL_UI.BTN_CONFIRM}</CustomButton>
        </div>
      </div>
    </ResponsivePopup>
  );
};
