"use client";

import { useMemo, useRef, useCallback } from "react";
import { Grid } from "antd";
import Typography from "@/components/Typography";
import CustomButton from "@/components/Button";
import SelectField from "@/components/DataEntry/Select";
import ToggleSwitch from "@/components/DataEntry/ToggleSwitch";
import {
  PRICE_DISPLAY_OPTIONS,
  PRODUCTS_TABLE_ACTIONS_UI,
  type PriceDisplayMode,
} from "../constants/products.constants";
import { useProductBulkActions } from "../hooks/useProductBulkActions";
import "./ProductsTableActions.css";
export interface ProductsTableActionsProps {
  totalItems: number;
  selectedRowKeys: React.Key[];
  selectedCount: number;
  priceDisplayMode: PriceDisplayMode;
  onPriceDisplayModeChange: (mode: PriceDisplayMode) => void;
  showVatDetails: boolean;
  onShowVatDetailsChange: (show: boolean) => void;
  onShowProducts: () => void;
  isUpdatingStatus: boolean;
  hasInvalidStatusSelected: boolean;
  cachedProducts: Array<{ id: React.Key; merchantProductStatus: string }>;
  getAllCachedProducts: () => Array<{ id: React.Key; merchantProductStatus: string }>;
  clearAll: () => void;
  onEditPricing: () => void;
  onBulkUpdateStatus: (keys: React.Key[], status: string, cacheMap: Record<string | number, string>) => void;
  onBulkDelete: (keys: React.Key[], cacheMap: Record<string | number, string>) => void;
}

export const ProductsTableActions: React.FC<ProductsTableActionsProps> = ({
  totalItems,
  selectedRowKeys,
  selectedCount,
  priceDisplayMode,
  onPriceDisplayModeChange,
  showVatDetails,
  onShowVatDetailsChange,
  isUpdatingStatus,
  hasInvalidStatusSelected,
  getAllCachedProducts,
  clearAll,
  onEditPricing,
  onBulkUpdateStatus,
  onBulkDelete,
}) => {
  const screens = Grid.useBreakpoint();
  const showButtonLabels = screens.xl ?? true; // xl = 1280px
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const { handleBulkShow, handleBulkHide, handleBulkDeleteClick } = useProductBulkActions({
    selectedRowKeys,
    getAllCachedProducts,
    onBulkUpdateStatus,
    onBulkDelete,
  });

  return (
    <div className="pt-6 pb-3 px-4 flex flex-wrap gap-y-3 gap-x-6 justify-between items-center">
      <div className="shrink-0">
        <Typography
          variant="paragraph-medium"
          className="!text-text-secondary !font-semibold"
        >
          {PRODUCTS_TABLE_ACTIONS_UI.TOTAL_ITEMS(totalItems)}
        </Typography>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <SelectField
          placeholder="ราคารวมภาษี"
          options={[...PRICE_DISPLAY_OPTIONS]}
          value={priceDisplayMode}
          onChange={(value) => onPriceDisplayModeChange(value as PriceDisplayMode)}
          className="w-48"
        />
        <ToggleSwitch
          title="แสดงรายละเอียดภาษี"
          showLabel={false}
          type="text"
          isChecked={showVatDetails}
          onChange={onShowVatDetailsChange}
        />
      </div>

      <div className="flex flex-wrap pt-2 gap-2 items-center justify-end ml-auto w-full" ref={buttonContainerRef}>
        {selectedRowKeys.length > 0 && (
          <CustomButton
            size="small"
            variant="outlined"
            color="neutral"
            iconPosition="end"
            icon={<i className="ri-close-line"></i>}
            onClick={() => {
              clearAll();
            }}
            className="selectionIndicator"
          >
            <span className="selectionIndicatorText">
              {PRODUCTS_TABLE_ACTIONS_UI.SELECTED_COUNT(selectedCount)}
            </span>
          </CustomButton>
        )}

        <CustomButton
          size="small"
          variant="outlined"
          color="primary"
          icon={<i className="ri-edit-line actionButtonIcon"></i>}
          disabled={selectedRowKeys.length === 0 || isUpdatingStatus}
          onClick={onEditPricing}
          className={`actionButton ${!showButtonLabels ? "actionButtonIconOnly" : ""}`}
        >
          {showButtonLabels && (
            <span className="actionButtonText">{PRODUCTS_TABLE_ACTIONS_UI.BTN_EDIT_PRICING}</span>
          )}
        </CustomButton>

        <CustomButton
          size="small"
          variant="outlined"
          color="primary"
          icon={<i className="ri-eye-line actionButtonIcon"></i>}
          disabled={selectedRowKeys.length === 0 || isUpdatingStatus || hasInvalidStatusSelected}
          onClick={handleBulkShow}
          className={`actionButton ${!showButtonLabels ? "actionButtonIconOnly" : ""}`}
        >
          {showButtonLabels && (
            <span className="actionButtonText">{PRODUCTS_TABLE_ACTIONS_UI.BTN_SHOW}</span>
          )}
        </CustomButton>

        <CustomButton
          size="small"
          variant="outlined"
          color="primary"
          icon={<i className="ri-eye-off-line actionButtonIcon"></i>}
          disabled={selectedRowKeys.length === 0 || isUpdatingStatus || hasInvalidStatusSelected}
          onClick={handleBulkHide}
          className={`actionButton ${!showButtonLabels ? "actionButtonIconOnly" : ""}`}
        >
          {showButtonLabels && (
            <span className="actionButtonText">{PRODUCTS_TABLE_ACTIONS_UI.BTN_HIDE}</span>
          )}
        </CustomButton>

        <CustomButton
          size="small"
          variant="outlined"
          color="error"
          icon={<i className="ri-delete-bin-6-line actionButtonIcon"></i>}
          disabled={selectedRowKeys.length === 0 || isUpdatingStatus}
          onClick={handleBulkDeleteClick}
          className={`actionButton ${!showButtonLabels ? "actionButtonIconOnly" : ""}`}
        >
          {showButtonLabels && (
            <span className="actionButtonText">{PRODUCTS_TABLE_ACTIONS_UI.BTN_DELETE}</span>
          )}
        </CustomButton>
      </div>
    </div>
  );
};
