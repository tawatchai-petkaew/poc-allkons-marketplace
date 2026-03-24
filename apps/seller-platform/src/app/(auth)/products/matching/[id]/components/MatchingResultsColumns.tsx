import React from "react";
import { TableColumnsType } from "antd";
import Checkbox from "@/components/DataEntry/Checkbox";
import type { IBatchItem, IBatchItemSuggestedProduct } from "@/interfaces/product/import-product.interface";
import CustomTypography from "@/components/Typography";
import Image from "@/components/Image";
import TextWithTooltip from "@/components/TextWithTooltip/TextWithTooltip";
import styles from "./MatchingResultsDetails.module.css";

type StatusConfigItem = { label: string; icon?: string; className: string };

type CalculatePriceFn = (
  record: IBatchItem,
  priceType: string,
) => {
  mainPrice: string;
  alternatePrice: string;
  shouldShowVatDetails: boolean;
  vatAmount: string;
  vatPercent: number | null;
};

interface ColumnProps {
  unspecifiedText: string;
  calculatePriceDetails: CalculatePriceFn;
  yesNoStatusConfig: Record<string, StatusConfigItem>;
  availableForSaleConfig: Record<string, StatusConfigItem>;
  importedStatusConfig: Record<string, StatusConfigItem>;
  defaultImportedStatus: string;
  matchingStatusConfig: Record<string, StatusConfigItem>;
  importTypeConfig: Record<string, StatusConfigItem>;

  // Specific to Similar / Found
  selectedMatches?: Map<string, string | number | null | undefined>;
  handleSelectMatch?: (recordId: string | number, productUuid?: string | number | null) => void;
  handleSelectNoneAll?: () => void;
  isAllNoneSelected?: boolean;
  expandedSimilarItems?: Set<string>;
  toggleExpandSimilar?: (recordId: string | number) => void;
}

const renderTextCell = (text: string | undefined | null, className = "!text-text-secondary") => (
  <CustomTypography variant="paragraph-small" className={className}>
    {text || "-"}
  </CustomTypography>
);

const renderProductNameWithImage = (name: string, image: string | undefined, unspecifiedText: string, sizeClass?: string) => {
  const baseClass = "relative shrink-0 rounded overflow-hidden bg-background-secondary flex items-center justify-center";
  const className = sizeClass ? `${sizeClass} ${baseClass}` : baseClass;

  return (
    <div className="flex items-center gap-3 justify-start">
      <div className="shrink-0 pt-1">
        <Image name={name} image={image} className={className} type="product" />
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <TextWithTooltip text={name} maxLines={2}>
          <CustomTypography variant="paragraph-small" className="!text-text-secondary">
            {name || ""}
          </CustomTypography>
        </TextWithTooltip>
      </div>
    </div>
  );
};

const VatDetailText = ({ children }: { children: React.ReactNode }) => (
  <CustomTypography 
    variant="paragraph-extra-small" 
    className={`${styles.vatDetailText} !text-text-tertiary whitespace-nowrap`}
  >
    {children}
  </CustomTypography>
);

const renderPriceCellHelper = (
  record: IBatchItem,
  priceType: string,
  calculatePriceDetails: CalculatePriceFn,
  hasBorder = false,
  isFoundTab = false
) => {
  const {
    mainPrice,
    alternatePrice,
    shouldShowVatDetails,
    vatAmount,
    vatPercent,
  } = calculatePriceDetails(record, priceType);

  const containerClass = hasBorder ? styles.priceColumn : styles.priceColumnInner;
  const priceColor = isFoundTab ? "!text-text-primary" : "!text-text-secondary";

  return (
    <div className={containerClass}>
      <CustomTypography 
        variant="paragraph-small-semibold" 
        className={`${priceColor} whitespace-nowrap`}
      >
        {mainPrice}
      </CustomTypography>
      {shouldShowVatDetails && (
        <>
          {vatPercent !== null && (
            <VatDetailText>{alternatePrice}</VatDetailText>
          )}
          <VatDetailText>
            {vatPercent === null ? "ยกเว้นภาษี" : `Vat ${vatPercent}% ${vatAmount}`}
          </VatDetailText>
        </>
      )}
    </div>
  );
};

const renderAvailableForSaleHelper = (isAvailable: boolean, config: Record<string, StatusConfigItem>) => {
  const statusConfig = config[String(isAvailable)];
  if (!statusConfig) return null;
  return (
    <div className={`flex items-center gap-2 ${styles[statusConfig.className]}`}>
      {statusConfig.icon && <i className={statusConfig.icon}></i>}
      <CustomTypography variant="paragraph-small" className="!text-inherit">
        {statusConfig.label}
      </CustomTypography>
    </div>
  );
};

const renderYesNoStatusHelper = (value: boolean, config: Record<string, StatusConfigItem>, alignment: "start" | "center" | "left" = "start") => {
  const statusConfig = config[String(value)];
  if (!statusConfig) return null;
  const justifyClass = alignment === "center" ? "justify-center" : "justify-start";
  
  const iconClass = value ? "ri-check-line" : "ri-close-line";
  const wrapperClass = value ? styles.inquiredTrue : styles.inquiredFalse;

  return (
    <div className={`flex items-start ${justifyClass}`}>
      <div className={wrapperClass}>
        <i className={iconClass}></i>
      </div>
    </div>
  );
};

const renderImportedProductStatusHelper = (status: string, config: Record<string, StatusConfigItem>, defaultStatus: string) => {
  const statusConfig = config[status] || config[defaultStatus];
  if (!statusConfig) return null;
  return (
    <div className={styles[statusConfig.className]}>
      {statusConfig.icon && <i className={`${statusConfig.icon} mr-1`}></i>}
      <CustomTypography variant="paragraph-small" className="!text-inherit">
        {statusConfig.label}
      </CustomTypography>
    </div>
  );
};

const renderMatchingStatusHelper = (matchStatus: string, config: Record<string, StatusConfigItem>) => {
  const statusConfig = config[matchStatus];
  if (!statusConfig) {
    return (
      <div className={styles.matchingStatusFound}>
        <CustomTypography variant="paragraph-small" className="!text-inherit">
          {matchStatus || "-"}
        </CustomTypography>
      </div>
    );
  }
  return (
    <div className={styles[statusConfig.className]}>
      <CustomTypography variant="paragraph-small" className="!text-inherit">
        {statusConfig.label}
      </CustomTypography>
    </div>
  );
};

const renderImportTypeStatusHelper = (value: string | undefined | null, config: Record<string, StatusConfigItem>) => {
  const statusConfig = config[value || ""];
  if (!statusConfig) {
    return (
      <div className={styles.importTypeNone}>
        <CustomTypography variant="paragraph-small" className="!text-inherit !font-medium">
          -
        </CustomTypography>
      </div>
    );
  }
  
  return (
    <div className={styles[statusConfig.className]}>
      <CustomTypography variant="paragraph-small" className="!text-inherit !font-medium">
        {statusConfig.label}
      </CustomTypography>
    </div>
  );
};

export const getMatchingColumns = (
  tab: "imported" | "found" | "similar" | "notFound",
  props: ColumnProps,
): TableColumnsType<IBatchItem> => {
  const {
    unspecifiedText,
    calculatePriceDetails,
    yesNoStatusConfig,
    availableForSaleConfig,
    importedStatusConfig,
    defaultImportedStatus,
    importTypeConfig,
    matchingStatusConfig,
    selectedMatches,
    handleSelectMatch,
    handleSelectNoneAll,
    isAllNoneSelected,
    expandedSimilarItems,
    toggleExpandSimilar,
  } = props;

  const hasSpecialPrice = (record: IBatchItem) => {
    return record.specialPrice != null || 
           record.specialPriceIncludeVat != null || 
           record.specialPriceExcludeVat != null;
  };

  // Common imported product info columns
  const importedProductColumns = [
    {
      title: "ชื่อสินค้า",
      dataIndex: "productName",
      key: "imported_productName",
      width: 300,
      align: 'left' as const,
      render: (text: string) => (
        <TextWithTooltip text={text} maxLines={2}>
          <CustomTypography variant="paragraph-small" className="!text-text-secondary">
            {text || ""}
          </CustomTypography>
        </TextWithTooltip>
      ),
    },
    {
      title: "Barcode สินค้า",
      dataIndex: "barcode",
      key: "imported_barcode",
      width: 160,
      align: 'left' as const,
      render: (text: string) => (
        <CustomTypography variant="paragraph-small" className="!text-text-secondary">
          {text || ""}
        </CustomTypography>
      ),
    },
    {
      title: "แบรนด์สินค้า",
      dataIndex: "brand",
      key: "imported_brand",
      width: 200,
      align: 'left' as const,
      render: (text: string) => (
        <CustomTypography variant="paragraph-small" className="!text-text-secondary">
          {text || ""}
        </CustomTypography>
      ),
    }
  ];

  if (tab === "found") {
    return [
      {
        title: "สินค้าที่นำเข้า",
        onHeaderCell: () => ({ className: styles.importedGroupHeader }),
        children: importedProductColumns,
      },
      {
        title: "สินค้าที่พบในระบบ",
        onHeaderCell: () => ({ className: styles.systemGroupHeader }),
        children: [
          {
            title: "ชื่อสินค้า",
            key: "system_productName",
            width: 300,
            align: 'left' as const,
            onCell: () => ({ className: styles.systemGroupDivider }),
            onHeaderCell: () => ({ className: styles.systemGroupDivider }),
            render: (_, record) => {
              const systemProduct = record.suggestedProducts?.[0];
              return renderProductNameWithImage(
                systemProduct?.name || "", 
                systemProduct?.imageUrl, 
                unspecifiedText
              );
            },
          },
          {
            title: "Barcode สินค้า",
            key: "system_barcode",
            width: 160,
            align: 'left' as const,
            onCell: () => ({ className: styles.suggestedProductBg }),
            onHeaderCell: () => ({ className: styles.suggestedProductBg }),
            render: (_, record) => (
              <CustomTypography variant="paragraph-small" className="!text-text-secondary">
                {record.suggestedProducts?.[0]?.barcode || ""}
              </CustomTypography>
            ),
          },
          {
            title: "แบรนด์สินค้า",
            key: "system_brand",
            width: 200,
            align: 'left' as const,
            onCell: () => ({ className: styles.suggestedProductBg }),
            onHeaderCell: () => ({ className: styles.suggestedProductBg }),
            render: (_, record) => {
              const brand = record.suggestedProducts?.[0]?.brand;
              return (
                <CustomTypography variant="paragraph-small" className="!text-text-secondary">
                  {brand || ""}
                </CustomTypography>
              );
            },
          },
        ],
      },
      {
        title: "ราคาขายสินค้า",
        onHeaderCell: () => ({ className: styles.priceGroupHeader }),
        children: [
          {
            title: "ราคาปกติ (฿)",
            dataIndex: "regularPrice",
            key: "regularPrice",
            width: 160,
            align: 'left',
            onCell: () => ({ className: styles.priceGroupDivider }),
            onHeaderCell: () => ({ className: styles.priceGroupDivider }),
            render: (_: string | number | undefined, record: IBatchItem) => renderPriceCellHelper(record, "regular", calculatePriceDetails, true, true),
          },
          {
            title: "ราคาพิเศษ (฿)",
            dataIndex: "specialPrice",
            key: "specialPrice",
            width: 160,
            align: 'left' as const,
            onHeaderCell: () => ({ className: styles.priceHeader }),
            render: (_: string | number | undefined, record: IBatchItem) => 
              hasSpecialPrice(record) 
                ? renderPriceCellHelper(record, "special", calculatePriceDetails, false, true) 
                : renderTextCell("ไม่ระบุ", "!text-text-tertiary"),
          },
          {
            title: "วันเริ่มต้นราคาพิเศษ",
            dataIndex: "specialPriceStartDate",
            key: "specialPriceStartDate",
            width: 160,
            align: 'left',
            onCell: () => ({ className: styles.priceColumnBorder }),
            onHeaderCell: () => ({ className: styles.priceColumnBorder }),
            render: (date, record) => {
              if (date) return renderTextCell(date);
              if (hasSpecialPrice(record)) return renderTextCell("วันที่นำเข้า");
              return renderTextCell("ไม่ระบุ");
            },
          },
          {
            title: "วันสิ้นสุดราคาพิเศษ",
            dataIndex: "specialPriceEndDate",
            key: "specialPriceEndDate",
            width: 160,
            align: 'left',
            render: (date, record) => {
              if (date) return renderTextCell(date);
              if (hasSpecialPrice(record)) return renderTextCell("ไม่มีวันที่สิ้นสุด");
              return renderTextCell("ไม่ระบุ");
            },
          },
          {
            title: "ลูกค้าสอบถามราคาก่อนสั่งซื้อ",
            dataIndex: "requirePriceInquiry",
            key: "requirePriceInquiry",
            width: 210,
            align: 'left' as const,
            render: (val: boolean) => renderYesNoStatusHelper(val, yesNoStatusConfig, "left"),
          },
        ],
      },
      {
        title: "",
        onHeaderCell: () => ({ className: styles.statusGroupHeader }),
        children: [
          {
            title: "สถานะเปิดขาย",
            dataIndex: "saleStatus",
            key: "saleStatus",
            width: 140,
            align: 'left' as const,
            onCell: () => ({ className: styles.statusGroupDivider }),
            onHeaderCell: () => ({ className: styles.statusGroupDivider }),
            render: (val: string) => renderAvailableForSaleHelper(val === "SELLING", availableForSaleConfig),
          },
          {
            title: "สถานะสินค้านำเข้า",
            dataIndex: "importStatus",
            key: "importStatus",
            width: 200,
            align: 'left' as const,
            render: (val: string | undefined) => renderImportedProductStatusHelper(val || "", importedStatusConfig, defaultImportedStatus),
          },
          {
            title: "ประเภทการนำเข้า",
            dataIndex: "importType",
            key: "importType",
            width: 180,
            align: 'left' as const,
            render: (val: string) => renderImportTypeStatusHelper(val, importTypeConfig),
          },
        ],
      },
    ];
  }

  if (tab === "similar") {
    return [
      {
        title: "สินค้าที่นำเข้า",
        onHeaderCell: () => ({ className: styles.importedGroupHeader }),
        children: importedProductColumns,
      },
      {
        title: "สินค้าที่ใกล้เคียงในระบบ",
        onHeaderCell: () => ({ className: styles.suggestedGroupHeader }),
        children: [
          {
            title: "ชื่อสินค้า",
            key: "system_productName",
            width: 350,
            align: "left",
            onCell: () => ({ className: styles.suggestedGroupDivider }),
            onHeaderCell: () => ({ className: styles.suggestedGroupDivider }),
            render: (_, record: IBatchItem) => {
              const list = record.suggestedProducts || [];
              const similarProduct = record.similarProduct;

              // Priority: similarProduct > suggestedProducts
              const finalProductList = similarProduct ? [similarProduct] : list;

              const idStr = String(record.id);
              const isExpanded = expandedSimilarItems?.has(idStr);
              const displayList = isExpanded
                ? finalProductList
                : finalProductList.slice(0, 2);
              const hasMore = finalProductList.length > 2;
              const selectedUuid = selectedMatches?.get(idStr);

              return (
                <div className="flex flex-col">
                  <div className="bg-[#fafafa] p-3 border-b border-[#e5e5e5] h-[48px] flex justify-between items-center -mx-4 -mt-4 mb-3 px-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={!!(String(selectedUuid) === "null")}
                        disabled={!!record.matchedProductVariantId}
                        onChange={(e) =>
                          handleSelectMatch?.(
                            record.id,
                            e.target.checked ? null : undefined,
                          )
                        }
                        className={styles.checkbox20px}
                      />
                      <CustomTypography
                        variant="paragraph-small"
                        className="!font-medium"
                      >
                        ไม่เลือกทั้งหมด
                      </CustomTypography>
                    </div>
                    {hasMore && (
                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => toggleExpandSimilar?.(record.id)}
                      >
                        <CustomTypography
                          variant="paragraph-small"
                          className="!font-medium !text-text-secondary"
                        >
                          {isExpanded ? "ซ่อน" : "ทั้งหมด"}
                        </CustomTypography>
                        <i
                          className={`ri-arrow-${isExpanded ? "up" : "down"}-s-line !text-text-quaternary`}
                        />
                      </div>
                    )}
                  </div>
                  {displayList.map((product: IBatchItemSuggestedProduct) => {
                    const idStr = String(product.id);
                    const isSelected =
                      selectedUuid !== undefined && String(selectedUuid) === idStr;
                    
                    const isOriginallyMatched = record.matchedProductVariantId && String(record.matchedProductVariantId) === idStr;

                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 mb-3 last:mb-0"
                      >
                        <Checkbox
                          checked={!!(isSelected || isOriginallyMatched)}
                          disabled={
                            !!record.matchedProductVariantId ||
                            selectedUuid === null ||
                            (selectedUuid !== undefined &&
                              selectedUuid !== null &&
                              !isSelected)
                          }
                          onChange={(e) =>
                            handleSelectMatch?.(
                              record.id,
                              e.target.checked ? product.id : undefined,
                            )
                          }
                          className={styles.checkbox20px}
                        />
                        {renderProductNameWithImage(
                          product.name || "",
                          product.imageUrl,
                          unspecifiedText,
                          "w-12 h-12",
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            },
          },
          {
            title: "Barcode สินค้า",
            key: "system_barcode",
            width: 160,
            align: "left",
            onCell: () => ({ className: styles.suggestedProductBg }),
            onHeaderCell: () => ({ className: styles.suggestedProductBg }),
            render: (_, record) => {
              const list = record.suggestedProducts || [];
              const similarProduct = record.similarProduct;
              const finalProductList = similarProduct ? [similarProduct] : list;

              const idStr = String(record.id);
              const isExpanded = expandedSimilarItems?.has(idStr);
              const displayList = isExpanded
                ? finalProductList
                : finalProductList.slice(0, 2);
              return (
                <div className="flex flex-col">
                  <div className="h-[48px] mb-3" />
                  {displayList.map((p, i) => (
                    <div
                      key={i}
                      className="h-[48px] flex items-center mb-3 last:mb-0"
                    >
                      <CustomTypography variant="paragraph-small" className="!text-text-secondary">
                        {p.barcode || ""}
                      </CustomTypography>
                    </div>
                  ))}
                </div>
              );
            },
          },
          {
            title: "แบรนด์สินค้า",
            key: "system_brand",
            width: 200,
            align: "left",
            onCell: () => ({ className: styles.suggestedProductBg }),
            onHeaderCell: () => ({ className: styles.suggestedProductBg }),
            render: (_, record) => {
              const list = record.suggestedProducts || [];
              const similarProduct = record.similarProduct;
              const finalProductList = similarProduct ? [similarProduct] : list;

              const idStr = String(record.id);
              const isExpanded = expandedSimilarItems?.has(idStr);
              const displayList = isExpanded
                ? finalProductList
                : finalProductList.slice(0, 2);
              return (
                <div className="flex flex-col">
                  <div className="h-[48px] mb-3" />
                  {displayList.map((p, i) => (
                    <div
                      key={i}
                      className="h-[48px] flex items-center mb-3 last:mb-0"
                    >
                      <CustomTypography variant="paragraph-small" className="!text-text-secondary">
                        {p.brand || ""}
                      </CustomTypography>
                    </div>
                  ))}
                </div>
              );
            },
          },
        ],
      },
      {
        title: "ราคาขายสินค้า",
        onHeaderCell: () => ({ className: styles.priceGroupHeader }),
        children: [
          {
            title: "ราคาปกติ (฿)",
            dataIndex: "regularPrice",
            key: "regularPrice",
            width: 160,
            align: "left",
            onCell: () => ({ className: styles.priceGroupDivider }),
            onHeaderCell: () => ({ className: styles.priceGroupDivider }),
            render: (_: string | number | undefined, record: IBatchItem) =>
              renderPriceCellHelper(record, "regular", calculatePriceDetails, true),
          },
          {
            title: "ราคาพิเศษ (฿)",
            dataIndex: "specialPrice",
            key: "specialPrice",
            width: 160,
            align: "left",
            render: (_: string | number | undefined, record: IBatchItem) =>
              hasSpecialPrice(record)
                ? renderPriceCellHelper(record, "special", calculatePriceDetails)
                : renderTextCell("ไม่ระบุ", "!text-text-tertiary"),
          },
          {
            title: "วันเริ่มต้นราคาพิเศษ",
            dataIndex: "specialPriceStartDate",
            key: "specialPriceStartDate",
            width: 160,
            align: 'left',
            onCell: () => ({ className: styles.priceColumnBorder }),
            onHeaderCell: () => ({ className: styles.priceColumnBorder }),
            render: (date, record) => {
              if (date) return renderTextCell(date);
              if (hasSpecialPrice(record)) return renderTextCell("วันที่นำเข้า");
              return renderTextCell("ไม่ระบุ");
            },
          },
          {
            title: "วันสิ้นสุดราคาพิเศษ",
            dataIndex: "specialPriceEndDate",
            key: "specialPriceEndDate",
            width: 160,
            align: 'left',
            render: (date, record) => {
              if (date) return renderTextCell(date);
              if (hasSpecialPrice(record)) return renderTextCell("ไม่มีวันที่สิ้นสุด");
              return renderTextCell("ไม่ระบุ");
            },
          },
          {
            title: "ลูกค้าสอบถามราคาก่อนสั่งซื้อ",
            dataIndex: "requirePriceInquiry",
            key: "requirePriceInquiry",
            width: 210,
            align: "left",
            render: (val: boolean) =>
              renderYesNoStatusHelper(val, yesNoStatusConfig),
          },
        ],
      },
      {
        title: "",
        onHeaderCell: () => ({ className: styles.statusGroupHeader }),
        children: [
          {
            title: "สถานะเปิดขาย",
            dataIndex: "saleStatus",
            key: "saleStatus",
            width: 140,
            align: "left",
            onCell: () => ({ className: styles.statusGroupDivider }),
            onHeaderCell: () => ({ className: styles.statusGroupDivider }),
            render: (val: string) =>
              renderAvailableForSaleHelper(val === "SELLING", availableForSaleConfig),
          },
          {
            title: "สถานะสินค้านำเข้า",
            dataIndex: "importStatus",
            key: "importStatus",
            width: 200,
            align: "left",
            render: (val: string) =>
              renderImportedProductStatusHelper(
                val,
                importedStatusConfig,
                defaultImportedStatus,
              ),
          },
          {
            title: "ประเภทการนำเข้า",
            dataIndex: "importType",
            key: "importType",
            width: 180,
            align: "left" as const,
            render: (val: string) => renderImportTypeStatusHelper(val, importTypeConfig),
          },
        ],
      },
    ];
  }

  // imported tab, notFound tab or default
  if (tab === "notFound") {
    return [
      ...importedProductColumns,
      {
        title: "สถานะสินค้า",
        key: "notFound_status",
        width: 180,
        align: "left" as const,
        render: () => (
          <div className={`flex items-center gap-2 ${styles.importedStatusReview}`}>
            <i className="ri-information-line"></i>
            <CustomTypography variant="paragraph-small" className="!text-inherit">
              รอแอดมินตรวจสอบ
            </CustomTypography>
          </div>
        ),
      },
      {
        title: "เหตุผล",
        dataIndex: "reason",
        key: "notFound_reason",
        width: 300,
        align: "left" as const,
        render: (text: string) => renderTextCell(text || "-"),
      },
    ];
  }

  return [
    ...importedProductColumns,
    {
      title: "ราคาปกติ (฿)",
      dataIndex: "regularPrice",
      key: "regularPrice",
      width: 160,
      align: "left" as const,
      onCell: () => ({ className: styles.importedPriceGroupDivider }),
      onHeaderCell: () => ({ className: styles.importedPriceGroupDivider }),
      render: (_: string | number | undefined, record: IBatchItem) =>
        renderPriceCellHelper(record, "regular", calculatePriceDetails, true),
    },
    {
      title: "ราคาพิเศษ (฿)",
      dataIndex: "specialPrice",
      key: "specialPrice",
      width: 160,
      align: "left" as const,
      onCell: () => ({ className: styles.priceColumnPadding }),
      onHeaderCell: () => ({ className: styles.priceColumnPadding }),
      render: (_: string | number | undefined, record: IBatchItem) =>
        hasSpecialPrice(record) ? (
          renderPriceCellHelper(record, "special", calculatePriceDetails)
        ) : (
          <div className={styles.priceColumnInner}>
            {renderTextCell(unspecifiedText)}
          </div>
        ),
    },
    {
      title: "วันเริ่มต้นราคาพิเศษ",
      dataIndex: "specialPriceStartDate",
      key: "specialPriceStartDate",
      width: 160,
      align: "left" as const,
      onCell: () => ({ className: styles.priceColumnBorder }),
      onHeaderCell: () => ({ className: styles.priceColumnBorder }),
      render: (date, record) => (
        <div className={styles.priceColumnInner}>
          {renderTextCell(
            hasSpecialPrice(record) && !date ? "วันที่นำเข้า" : date || unspecifiedText,
          )}
        </div>
      ),
    },
    {
      title: "วันสิ้นสุดราคาพิเศษ",
      dataIndex: "specialPriceEndDate",
      key: "specialPriceEndDate",
      width: 160,
      align: "left" as const,
      render: (date, record) =>
        renderTextCell(
          hasSpecialPrice(record) && !date ? "ไม่มีวันที่สิ้นสุด" : date || unspecifiedText,
        ),
    },
    {
      title: "ลูกค้าสอบถามราคาก่อนสั่งซื้อ",
      dataIndex: "requirePriceInquiry",
      key: "requirePriceInquiry",
      width: 210,
      align: "left" as const,
      render: (val: boolean) => renderYesNoStatusHelper(val, yesNoStatusConfig),
    },
    {
      title: "สถานะเปิดขาย",
      dataIndex: "saleStatus",
      key: "saleStatus",
      width: 140,
      align: "left" as const,
      render: (val: string) =>
        renderAvailableForSaleHelper(val === "SELLING", availableForSaleConfig),
    },
    {
      title: "สถานะสินค้านำเข้า",
      dataIndex: "importStatus",
      key: "importStatus",
      width: 200,
      align: "left" as const,
      render: (val: string) =>
        renderImportedProductStatusHelper(
          val,
          importedStatusConfig,
          defaultImportedStatus,
        ),
    },
        {
      title: "สถานะจับคู่สินค้า",
      dataIndex: "matchStatus",
      key: "imported_matchStatus",
      width: 180,
      align: 'left' as const,
      render: (val: string) => renderMatchingStatusHelper(val, matchingStatusConfig),
    },
    {
      title: "ประเภทการนำเข้า",
      dataIndex: "importType",
      key: "importType",
      width: 180,
      align: "left" as const,
      render: (val: string) => renderImportTypeStatusHelper(val, importTypeConfig),
    },
  ];
};
