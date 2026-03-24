"use client";

import { useMemo } from "react";
import { Popover } from "antd";
import CustomTable from "@/components/Table";
import Typography from "@/components/Typography";
import BadgeLabel from "@/components/BadgeLabel";
import CustomButton from "@/components/Button";
import ActionTooltip from "@/components/ActionTooltip";
import Image from "@/components/Image";
import type { IProductResponseMerchantProduct } from "@/interfaces/product/product.response.interface";
import type { PriceDisplayMode } from "../constants/products.constants";
import { formatDiscount, formatVatPercent, getPriceHelpers } from "../utils/priceHelpers";
import { PRODUCTS_TABLE_UI, PRODUCTS_TABLE_COLUMN_WIDTHS, PRODUCTS_TABLE_PAGE_SIZE_OPTIONS, PRODUCTS_TABLE_SCROLL_X, PRODUCT_STATUS_CONFIG, LOCKED_PRODUCT_STATUSES } from "../constants/products.constants";
import "./ProductsTable.css";

export interface CategoryPathInfo {
  fullPath: string;
  pathWithoutLast: string;
  lastItem: string;
}

export interface ProductsTableProps {
  products: IProductResponseMerchantProduct[];
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedKeys: React.Key[], selectedRows: IProductResponseMerchantProduct[]) => void;
  priceDisplayMode: PriceDisplayMode;
  showVatDetails: boolean;
  productImageMap: Record<number, string>;
  categoryPathMap: Record<number, CategoryPathInfo>;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, size: number) => void;
  onEdit: (product: IProductResponseMerchantProduct) => void;
  onDelete: (product: IProductResponseMerchantProduct) => void;
  onToggleStatus: (product: IProductResponseMerchantProduct, newStatus: string) => void;
  isUpdatingStatus: boolean;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  loading,
  selectedRowKeys,
  onSelectionChange,
  priceDisplayMode,
  showVatDetails,
  productImageMap,
  categoryPathMap,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdatingStatus,
}) => {
  const columns = useMemo(
    () => [
      {
        title: PRODUCTS_TABLE_UI.COLUMNS.PRODUCT_NAME,
        dataIndex: "image",
        key: "image",
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.PRODUCT_NAME,
        render: (_: unknown, record: IProductResponseMerchantProduct) => {
          const imageUrl =
            record.thumbnail ||
            productImageMap[record.productVariant?.id] ||
            null;

          return (
            <div className="flex gap-2">
              <Image
                src={imageUrl}
                alt={record.productVariant?.alias || "Product"}
                name={record.productVariant?.alias}
                type="product"
                className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden"
              />
              <div className="flex flex-col justify-center w-[calc(100%-64px)]">
                <Popover
                  content={
                    <div className="flex flex-col gap-1">
                      <Typography
                        variant="paragraph-small"
                        className="!text-text-primary !font-medium"
                      >
                        {PRODUCTS_TABLE_UI.POPOVER.PRODUCT_NAME_LABEL}
                      </Typography>
                      <Typography
                        variant="paragraph-small"
                        className="!text-text-secondary"
                      >
                        {record.productVariant?.alias || "-"}
                      </Typography>
                    </div>
                  }
                  trigger="click"
                  placement="top"
                >
                  <div>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-normal cursor-pointer hover:text-primary"
                    >
                      {record.productVariant?.alias || "-"}
                    </Typography>
                  </div>
                </Popover>
                <Typography
                  variant="paragraph-extra-small"
                  className="!text-text-tertiary"
                >
                  {record.productVariant?.product?.brand?.name || "-"}
                </Typography>
              </div>
            </div>
          );
        },
      },
      {
        title: PRODUCTS_TABLE_UI.COLUMNS.BARCODE,
        dataIndex: "barCode",
        key: "barcode",
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.BARCODE,
        render: (_: unknown, record: IProductResponseMerchantProduct) => (
          <Typography variant="paragraph-small" className="!text-text-secondary">
            {record.productVariant?.barcode || "-"}
          </Typography>
        ),
      },
      {
        title: PRODUCTS_TABLE_UI.COLUMNS.CATEGORY,
        dataIndex: "productCategory",
        key: "productCategory",
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.CATEGORY,
        render: (_: unknown, record: IProductResponseMerchantProduct) => {
          const categoryName = record.productVariant?.product?.category?.name;
          const productVariantId = record.productVariant?.id;
          const categoryPathData = categoryPathMap[productVariantId] || {
            fullPath: "-",
            pathWithoutLast: "-",
            lastItem: "",
          };

          return categoryName ? (
            <Popover
              content={
                <div className="flex flex-col gap-1">
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-primary !font-medium"
                  >
                    {PRODUCTS_TABLE_UI.POPOVER.CATEGORY_LABEL}
                  </Typography>
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-secondary break-words"
                  >
                    {categoryPathData.pathWithoutLast && (
                      <span className="text-gray-light">
                        {categoryPathData.pathWithoutLast}
                      </span>
                    )}
                    {categoryPathData.lastItem && (
                      <span className="!font-weight-bold">
                        {categoryPathData.pathWithoutLast
                          ? ` > ${categoryPathData.lastItem}`
                          : categoryPathData.lastItem}
                      </span>
                    )}
                  </Typography>
                </div>
              }
              trigger="click"
              placement="top"
              overlayStyle={{ maxWidth: "400px" }}
            >
              <div>
                <BadgeLabel
                  text={categoryName}
                  color="brand"
                  variant="ghost"
                  rounding="pill"
                />
              </div>
            </Popover>
          ) : (
            <Typography
              variant="paragraph-small"
              className="!text-text-tertiary"
            >
              {PRODUCTS_TABLE_UI.CATEGORY_UNKNOWN}
            </Typography>
          );
        },
      },
      {
        title: PRODUCTS_TABLE_UI.COLUMNS.REGULAR_PRICE,
        dataIndex: "price",
        key: "price",
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.REGULAR_PRICE,
        render: (_: unknown, record: IProductResponseMerchantProduct) => {
          const {
            shouldShowVatExempt,
            shouldShowVatDetails,
            getMainPrice,
            getAlternatePrice,
            getVatAmount,
            vatPercent,
          } = getPriceHelpers(
            record.priceIncludeVat,
            record.priceExcludeVat,
            record.priceVatPercent,
            true,
            priceDisplayMode,
            showVatDetails
          );

          return (
            <div className="flex flex-col">
              <Typography
                variant="paragraph-small"
                className="!text-text-secondary"
              >
                {getMainPrice()}
              </Typography>

              {shouldShowVatDetails && (
                <>
                  {shouldShowVatExempt ? (
                    <Typography
                      variant="paragraph-extra-small"
                      className="!text-text-tertiary"
                    >
                      {PRODUCTS_TABLE_UI.VAT_EXEMPT}
                    </Typography>
                  ) : (
                    <>
                      <Typography
                        variant="paragraph-extra-small"
                        className="!text-text-tertiary"
                      >
                        {getAlternatePrice()}
                      </Typography>
                      <Typography
                        variant="paragraph-extra-small"
                        className="!text-text-tertiary"
                      >
                        Vat {formatVatPercent(vatPercent)}% {getVatAmount()}
                      </Typography>
                    </>
                  )}
                </>
              )}
            </div>
          );
        },
      },
      {
        title: PRODUCTS_TABLE_UI.COLUMNS.SPECIAL_PRICE,
        dataIndex: "specialPrice",
        key: "specialPrice",
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.SPECIAL_PRICE,
        render: (_: unknown, record: IProductResponseMerchantProduct) => {
          const {
            shouldShowVatExempt,
            shouldShowVatDetails,
            getMainPrice,
            getAlternatePrice,
            getVatAmount,
            vatPercent,
          } = getPriceHelpers(
            record.specialPriceIncludeVat,
            record.specialPriceExcludeVat,
            record.specialPriceVatPercent,
            false,
            priceDisplayMode,
            showVatDetails
          );

          return (
            <div className="flex flex-col">
              <Typography
                variant="paragraph-small"
                className="!text-text-secondary"
              >
                {getMainPrice()}
              </Typography>

              {shouldShowVatDetails && (
                <>
                  {shouldShowVatExempt ? (
                    <Typography
                      variant="paragraph-extra-small"
                      className="!text-text-tertiary"
                    >
                      {PRODUCTS_TABLE_UI.VAT_EXEMPT}
                    </Typography>
                  ) : (
                    <>
                      <Typography
                        variant="paragraph-extra-small"
                        className="!text-text-tertiary"
                      >
                        {getAlternatePrice()}
                      </Typography>
                      <Typography
                        variant="paragraph-extra-small"
                        className="!text-text-tertiary"
                      >
                        Vat {formatVatPercent(vatPercent)}% {getVatAmount()}
                      </Typography>
                    </>
                  )}
                </>
              )}
            </div>
          );
        },
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <span>{PRODUCTS_TABLE_UI.COLUMNS.DISCOUNT}</span>
            <Popover
              content={
                <div className="flex flex-col gap-1 max-w-xs">
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-secondary"
                  >
                    {PRODUCTS_TABLE_UI.POPOVER.DISCOUNT_DESC}
                  </Typography>
                </div>
              }
              trigger="click"
              placement="top"
            >
              <i className="ri-information-line cursor-pointer text-text-tertiary"></i>
            </Popover>
          </div>
        ),
        dataIndex: "discount",
        key: "discount",
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.DISCOUNT,
        render: (_: unknown, record: IProductResponseMerchantProduct) => {
          const hasSpecialPrice =
            record.specialPriceIncludeVat || record.specialPriceExcludeVat;

          let discountPercent = 0;
          if (
            hasSpecialPrice &&
            record.priceExcludeVat &&
            record.specialPriceExcludeVat
          ) {
            discountPercent =
              ((record.priceExcludeVat - record.specialPriceExcludeVat) /
                record.priceExcludeVat) *
              100;
          }

          return (
            <div className="flex flex-col">
              <BadgeLabel
                text={`${formatDiscount(discountPercent)}%`}
                variant="outlined"
                color="neutral"
                rounding="pill"
              />
            </div>
          );
        },
      },
      {
        title: PRODUCTS_TABLE_UI.COLUMNS.STATUS,
        dataIndex: "status",
        key: "status",
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.STATUS,
        render: (_: unknown, record: IProductResponseMerchantProduct) => {
          const status = record.merchantProductStatus;
          const { label, color, icon } = PRODUCT_STATUS_CONFIG[status] || {
            label: status,
            color: "neutral" as const,
            icon: "",
          };

          return (
            <BadgeLabel
              text={label}
              color={color}
              variant="solid"
              rounding="pill"
              icon={icon ? <i className={icon}></i> : undefined}
            />
          );
        },
      },
      {
        title: PRODUCTS_TABLE_UI.COLUMNS.PRODUCT_TYPE,
        dataIndex: "productType",
        key: "productType",
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.PRODUCT_TYPE,
        render: (_: unknown, record: IProductResponseMerchantProduct) => (
          <Typography variant="paragraph-small" className="!text-text-secondary">
            {record.productType?.name_th || record.productType?.name || "-"}
          </Typography>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2 justify-center">
            <span>{PRODUCTS_TABLE_UI.COLUMNS.PREPARE_DAYS}</span>
            <Popover
              content={
                <div className="flex flex-col gap-1 max-w-xs">
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-primary !font-medium"
                  >
                    {PRODUCTS_TABLE_UI.POPOVER.PREPARE_DAYS_TITLE}
                  </Typography>
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-secondary"
                  >
                    {PRODUCTS_TABLE_UI.POPOVER.PREPARE_DAYS_DESC}
                  </Typography>
                </div>
              }
              trigger="click"
              placement="top"
            >
              <i className="ri-information-line cursor-pointer text-text-tertiary"></i>
            </Popover>
          </div>
        ),
        dataIndex: "prepareDays",
        key: "prepareDays",
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.PREPARE_DAYS,
        align: "center" as const,
        render: (_: unknown, record: IProductResponseMerchantProduct) => (
          <Typography variant="paragraph-small" className="!text-text-secondary">
            {record.prepareDays ?? 0}
          </Typography>
        ),
      },
      {
        title: PRODUCTS_TABLE_UI.COLUMNS.ACTION,
        key: "action",
        fixed: "right" as const,
        width: PRODUCTS_TABLE_COLUMN_WIDTHS.ACTION,
        render: (_: unknown, record: IProductResponseMerchantProduct) => {
          const status = record.merchantProductStatus;
          const isLocked = (LOCKED_PRODUCT_STATUSES as readonly string[]).includes(status);

          const toggleTooltipContent = isLocked ? (
            <div className="flex flex-col gap-1 items-start text-left">
              <span className="font-bold">{PRODUCTS_TABLE_UI.TOGGLE_STATUS.LOCKED_TITLE}</span>
              <span className="text-xs text-text-secondary">{PRODUCTS_TABLE_UI.TOGGLE_STATUS.LOCKED_DESC}</span>
            </div>
          ) : status === "Hidden" ? (
            <div className="flex flex-col gap-1 items-start text-left">
              <span className="font-bold">{PRODUCTS_TABLE_UI.TOGGLE_STATUS.SHOW_TITLE}</span>
              <span className="text-xs text-text-secondary">{PRODUCTS_TABLE_UI.TOGGLE_STATUS.SHOW_DESC}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 items-start text-left">
              <span className="font-bold">{PRODUCTS_TABLE_UI.TOGGLE_STATUS.HIDE_TITLE}</span>
              <span className="text-xs text-text-secondary">{PRODUCTS_TABLE_UI.TOGGLE_STATUS.HIDE_DESC}</span>
            </div>
          );

          return (
            <div className="flex gap-2">
              <ActionTooltip>
                <CustomButton
                  variant="ghost"
                  color="neutral"
                  onClick={() => onEdit(record)}
                  icon={<i className="ri-edit-line"></i>}
                  className="!px-2"
                  disabled={isUpdatingStatus}
                  fitContent
                />
              </ActionTooltip>
              <ActionTooltip>
                <CustomButton
                  variant="ghost"
                  color="neutral"
                  onClick={() => onToggleStatus(record, status === "Selling" ? "Hidden" : "Selling")}
                  icon={<i className={status === "Selling" ? "ri-eye-off-line" : "ri-eye-line"}></i>}
                  className="!px-2"
                  disabled={isUpdatingStatus || isLocked}
                  fitContent
                />
              </ActionTooltip>
              <ActionTooltip>
                <CustomButton
                  variant="ghost"
                  color="error"
                  onClick={() => onDelete(record)}
                  icon={<i className="ri-delete-bin-line"></i>}
                  className="!px-2"
                  disabled={isUpdatingStatus}
                  fitContent
                />
              </ActionTooltip>
            </div>
          );
        },
      },
    ],
    [
      priceDisplayMode,
      showVatDetails,
      productImageMap,
      categoryPathMap,
      onEdit,
      onDelete,
      onToggleStatus,
      isUpdatingStatus,
    ]
  );

  return (
    <div className="mt-3 productsTable">
      <CustomTable<IProductResponseMerchantProduct>
        columns={columns}
        items={products}
        loading={loading}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: (keys, rows) => onSelectionChange(keys, rows),
          columnWidth: 56,
          fixed: true,
        }}
        emptyText={PRODUCTS_TABLE_UI.EMPTY_TEXT}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: true,
          pageSizeOptions: [...PRODUCTS_TABLE_PAGE_SIZE_OPTIONS],
          onChange: (page, size) => {
            onPageChange(page, size);
          },
          locale: {
            items_per_page: PRODUCTS_TABLE_UI.PAGINATION.ITEMS_PER_PAGE,
            prev_page: PRODUCTS_TABLE_UI.PAGINATION.PREV_PAGE,
            next_page: PRODUCTS_TABLE_UI.PAGINATION.NEXT_PAGE,
          },
        }}
        tableLayout="fixed"
        scroll={{ x: PRODUCTS_TABLE_SCROLL_X }}
      />
    </div>
  );
};
