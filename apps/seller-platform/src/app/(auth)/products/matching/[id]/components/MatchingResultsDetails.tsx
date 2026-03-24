"use client";

import React, { memo, useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "antd";
import { useMatchingResultsDetails } from "../hooks/useMatchingResultsDetails";
import MatchingHeader from "./MatchingHeader";
import ConfirmationModal from "./ConfirmationModal";
import { getMatchingColumns } from "./MatchingResultsColumns";
import CustomTypography from "@/components/Typography";
import CustomButton from "@/components/Button";
import CustomTable from "@/components/Table";
import TextField from "@/components/DataEntry/TextField";
import ToggleSwitch from "@/components/DataEntry/ToggleSwitch";
import SelectField from "@/components/DataEntry/Select";
import BackButton from "@/components/BackButton";
import LoadingOverlay from "@/components/Loading/LoadingOverlay";
import { checkVariantExistence } from "@/api/import-product.api";
import type { IBatchItemSuggestedProduct } from "@/interfaces/product/import-product.response.interface";
import { useConfirmPopup } from "@/hooks/useConfirmPopup";

import styles from "./MatchingResultsDetails.module.css";

interface MatchingResultsDetailsProps {
  id: string;
}

const MatchingResultsDetails = memo(({ id }: MatchingResultsDetailsProps) => {
  const router = useRouter();

  const {
    headerData,
    statusTabs,
    currentTab,
    data,
    totalItems,
    isLoading,
    isError,
    showVatDetails,
    priceDisplayMode,
    priceDisplayOptions,
    currentPage,
    pageSize,
    handleTabChange,
    handleVatDetailsToggle,
    handlePriceDisplayModeChange,
    handlePageChange,
    handleDownloadMatchingResults,
    calculatePriceDetails,
    importedStatusConfig,
    matchingStatusConfig,
    availableForSaleConfig,
    yesNoStatusConfig,
    defaultImportedStatus,
    unspecifiedText,
    searchTerm,
    handleSearch,
    handleConfirmMatching,
    isConfirming,
    isDownloadingMatching,
    selectedRowKeys,
    selectedMatches,
    handleSelectMatch,
    handleSelectNoneAll,
    isAllNoneSelected,
    onSelectChange,
    importTypeConfig,
    autoMatchedMap,
    selectedItemsCache,
    expandedSimilarItems,
    toggleExpandSimilar,
  } = useMatchingResultsDetails(id);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState("");
  const [showError, setShowError] = useState(false);
  const [existenceResult, setExistenceResult] = useState<{
    existingIds: string[];
    notExistingIds: string[];
  }>({
    existingIds: [],
    notExistingIds: [],
  });

  // Stats for confirmation
  const { confirmPopup, showConfirm } = useConfirmPopup();

  // Stats for confirmation
  const existingProductsList = useMemo(() => {
    if (!existenceResult?.existingIds?.length) return [];
    
    const existingIdSet = new Set(existenceResult.existingIds.map(String));
    const list: string[] = [];

    selectedRowKeys.forEach((key) => {
      const keyStr = String(key);
      if (autoMatchedMap.has(keyStr)) return;
      
      const matchId = selectedMatches.get(keyStr);
      if (matchId && existingIdSet.has(String(matchId))) {
        const item = selectedItemsCache.get(keyStr);
        let productName = null;

        if (item) {
          if (item.suggestedProducts && item.suggestedProducts.length > 0) {
            const found = item.suggestedProducts.find((p: IBatchItemSuggestedProduct) => String(p.id) === String(matchId));
            if (found) productName = found.name;
          }
          if (!productName && item.similarProduct && String(item.similarProduct.id) === String(matchId)) {
            productName = item.similarProduct.name;
          }
          if (!productName) productName = item.productName; // Fallback to original item name
        }

        list.push(productName || `สินค้า ID: ${matchId}`); // Final fallback
      }
    });

    return list;
  }, [selectedRowKeys, selectedMatches, existenceResult, selectedItemsCache, autoMatchedMap]);

  // Stats for confirmation
  const confirmStats = useMemo(() => {
    let importCount = 0;
    let notFoundCount = 0;
    const existingCount = existingProductsList.length;

    // importCount is the number of items that don't exist in the store yet
    if (existenceResult?.notExistingIds) {
      importCount = existenceResult.notExistingIds.length;
    }

    // notFoundCount is items where the user explicitly chose "Not matching" (matchId is null)
    selectedRowKeys.forEach((key) => {
      const keyStr = String(key);
      if (autoMatchedMap.has(keyStr)) return;
      if (!selectedMatches.get(keyStr)) notFoundCount++;
    });

    return { importCount, notFoundCount, existingCount };
  }, [selectedRowKeys, selectedMatches, existenceResult, autoMatchedMap, existingProductsList]);

  const isReasonValid = useMemo(() => {
    if (confirmStats.notFoundCount === 0) return true;
    if (!rejectReason) return false;
    if (rejectReason === "อื่นๆ โปรดระบุเหตุผล" && !otherReason.trim()) return false;
    return true;
  }, [confirmStats.notFoundCount, rejectReason, otherReason]);

  const handleOpenConfirmModal = async () => {
    setShowError(false);
    
    // Check for duplicates
    const variantCounts = new Map();
    let hasDuplicate = false;
    selectedRowKeys.forEach(key => {
      const keyStr = String(key);
      const matchUuid = selectedMatches.get(keyStr);
      if (matchUuid) {
        variantCounts.set(matchUuid, (variantCounts.get(matchUuid) || 0) + 1);
        if (variantCounts.get(matchUuid) > 1) hasDuplicate = true;
      }
    });

    if (hasDuplicate) {
      showConfirm({
        title: "ไม่สามารถนำสินค้าเข้าร้านได้",
        detail: "ไม่สามารถเลือกสินค้าเดียวกันมากกว่า 1 รายการต่อรอบการนำเข้าได้",
        type: "warn",
        footerButtons: "confirm",
        buttonWidth: "fit",
        confirmText: "ตกลง",
      });
      return;
    }

    // Check existence
    const productVariantIds: string[] = [];
    selectedRowKeys.forEach(key => {
      const keyStr = String(key);
      if (autoMatchedMap.has(keyStr)) return; // Exclude auto-matched
      
      const matchUuid = selectedMatches.get(keyStr);
      if (matchUuid) productVariantIds.push(String(matchUuid));
    });

    let result: { existingIds: string[]; notExistingIds: string[] } = { existingIds: [], notExistingIds: [] };
    if (productVariantIds.length > 0) {
        try {
            const apiResult = await checkVariantExistence(productVariantIds);
            result = {
                existingIds: apiResult.data?.existingIds || [],
                notExistingIds: apiResult.data?.notExistingIds || []
            };
            setExistenceResult(result);
        } catch (error) {
            result = { existingIds: [], notExistingIds: productVariantIds };
            setExistenceResult(result);
        }
    } else {
      setExistenceResult({ existingIds: [], notExistingIds: [] });
    }

    // Determine if we should show simple confirm or summary modal
    const notFoundCount = confirmStats.notFoundCount;
    const isSimpleView = result.existingIds.length === 0 && notFoundCount === 0;

    if (isSimpleView) {
      showConfirm({
        title: "ยืนยันนำเข้า",
        detail: "คุณกำลังนำเข้าสินค้าจากระบบไปยังร้านค้า/สาขา",
        type: "info",
        onConfirm: onConfirm,
      });
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const onConfirm = () => {
    if (!isReasonValid) {
      setShowError(true);
      return;
    }
    const finalReason = rejectReason === "อื่นๆ โปรดระบุเหตุผล" ? otherReason : rejectReason;
    handleConfirmMatching(selectedRowKeys, finalReason || "");
    setIsConfirmModalOpen(false);
  };

  const isSelectionOnlyAutoMatched = useMemo(() => {
    if ((currentTab as string) !== "similar" || selectedRowKeys.length === 0) return false;
    return selectedRowKeys.every(key => {
      const keyStr = String(key);
      const autoVariantId = autoMatchedMap.get(keyStr);
      if (!autoVariantId) return false;
      return String(selectedMatches.get(keyStr)) === String(autoVariantId);
    });
  }, [currentTab, selectedRowKeys, autoMatchedMap, selectedMatches]);

  const columns = useMemo(() => 
    getMatchingColumns(currentTab as "imported" | "found" | "similar" | "notFound", {
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
    }), 
  [currentTab, calculatePriceDetails, expandedSimilarItems, selectedMatches, handleSelectMatch, toggleExpandSimilar, availableForSaleConfig, defaultImportedStatus, importTypeConfig, importedStatusConfig, matchingStatusConfig, isAllNoneSelected, handleSelectNoneAll, unspecifiedText, yesNoStatusConfig]);

  const breadcrumbItems = useMemo(
    () => [
      {
        title: (
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => router.push("/products/matching")}>
            <i className={`ri-home-4-line ${styles.breadcrumbHome}`} />
            <span className="text-[#1a202c]">การจับคู่สินค้า</span>
          </div>
        ),
      },
      { 
        title: <span className={styles.breadcrumbActive}>จัดการผลการจับคู่</span> 
      },
    ],
    [router]
  );

  if (isError) {
    return (
      <div className="p-8 text-center bg-white rounded-xl">
        <CustomTypography variant="error">เกิดข้อผิดพลาดในการโหลดข้อมูล</CustomTypography>
        <CustomButton variant="outlined" onClick={() => window.location.reload()} className="mt-4">ลองใหม่อีกครั้ง</CustomButton>
      </div>
    );
  }

  return (
    <div className={`${styles.matchingResultsDetails} max-w-[1740px] mx-auto pb-12 p-6`}>
      <div className="mb-4">
        <Breadcrumb separator=">" items={breadcrumbItems} />
      </div>

      <div className="mb-4">
        <div
          className="flex items-center gap-2 cursor-pointer w-fit"
          onClick={() => router.push("/products/matching")}
        >
          <i className="ri-arrow-left-line"></i>
          <CustomTypography
            variant="paragraph-small"
            className="!text-text-secondary !font-normal"
          >
            กลับ
          </CustomTypography>
        </div>
      </div>

      <div className="border-b border-border-primary pb-4 mb-6 flex justify-between items-center">
        <CustomTypography
          variant="h4"
          className="!text-text-primary !font-bold"
        >
          จัดการผลการจับคู่
        </CustomTypography>
        <div className="flex gap-4">
          <CustomButton
            variant="outlined"
            onClick={handleDownloadMatchingResults}
            loading={isDownloadingMatching}
            className={styles.downloadMatchingResultsBtn}
            icon={<i className="ri-download-2-line"></i>}
          >
            ดาวน์โหลดผลการจับคู่
          </CustomButton>
        </div>
      </div>

      {headerData && <MatchingHeader headerData={headerData} />}

      <div className={styles.statusTabs}>
        {statusTabs.map((tab) => (
          <div
            key={tab.key}
            className={`${styles.tabItem} ${
              currentTab === tab.key ? styles.tabItemActive : ""
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label} ({tab.count})
          </div>
        ))}
      </div>

      {(currentTab as string) === "similar" && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <CustomTypography variant="h5" className="!font-bold !text-text-primary">เลือกข้อมูลก่อนยืนยันการจับคู่</CustomTypography>
            <CustomButton
              variant="solid"
              color="primary"
              onClick={handleOpenConfirmModal}
              disabled={selectedRowKeys.length === 0 || isConfirming || isSelectionOnlyAutoMatched}
              loading={isConfirming}
              className="min-w-[160px]"
              dataTestId="btn-confirm-matching"
            >
              นำสินค้าเข้าร้าน
            </CustomButton>
          </div>
          <div className="border-b border-border-primary" />
        </div>
      )}

      <div key={currentTab as string} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="pt-6 pb-6 px-4 flex justify-between items-center">
          <div className="flex flex-col">
            <CustomTypography
              variant="h5"
              className="!text-text-primary !font-bold"
            >
              {(currentTab as string) === "found" ? "สินค้าที่พบตรงกับในระบบ" : 
               (currentTab as string) === "similar" ? "สินค้าใกล้เคียง" : 
               (currentTab as string) === "notFound" ? "สินค้าที่ไม่พบในระบบ" : "สินค้าที่นำเข้า"}
            </CustomTypography>
            <CustomTypography
              variant="paragraph-small"
              className="!text-text-quinery"
            >
              {totalItems} รายการ
            </CustomTypography>
          </div>
          
          <div className="flex items-center gap-4">
            <SelectField
              placeholder="ราคารวมภาษี"
              options={priceDisplayOptions}
              value={priceDisplayMode}
              onChange={(val) => handlePriceDisplayModeChange(String(val ?? ""))}
              className={`!min-w-[120px] ${styles.priceDisplaySelect}`}
            />
            <ToggleSwitch
              title="แสดงรายละเอียดภาษี"
              showLabel={false}
              type="text"
              isChecked={showVatDetails}
              onChange={handleVatDetailsToggle}
            />
          </div>
        </div>

        {currentTab !== "imported" && (
          <div className="px-4 -mt-2">
            <hr className="border-border-primary" />
          </div>
        )}

        {currentTab !== "imported" && (
          <div className="px-4 pb-4 mt-4">
            <CustomTypography
              variant="paragraph-small-semibold"
              className="mb-2 !text-text-secondary"
            >
              ค้นหาสินค้านำเข้า
            </CustomTypography>
            <TextField
              placeholder="บาร์โค้ด แบรนด์ หรือ ชื่อสินค้า"
              prefix={<i className="ri-search-line !text-[#7C889C]" />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="!max-w-[360px] !rounded-lg !bg-white !border !border-[#DEE1E6] !text-text-primary placeholder:!text-[#9DA6B5]"
              allowClear
            />
          </div>
        )}

        <div className={`mt-3 ${styles.matchingResultsTableWrapper}`}>
          <CustomTable
            columns={columns}
            items={data || []}
            loading={isLoading}
            rowKey="id"
            emptyText={
              (currentTab as string) === 'similar'
                ? 'ไม่พบสินค้าใกล้เคียง'
                : (currentTab as string) === 'found'
                  ? 'ไม่พบสินค้าที่พบตรงกับในระบบ'
                  : 'ไม่พบข้อมูล'
            }
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100', '250'],
              onChange: (page, size) => handlePageChange(page, size),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`,
              locale: {
                items_per_page: ' / หน้า',
                prev_page: 'ย้อนกลับ',
                next_page: 'หน้าถัดไป',
              },
            }}
            tableLayout="fixed"
            scroll={{ x: 2920 }}
            className={styles.matchingResultsTable}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={onConfirm}
        isConfirming={isConfirming}
        confirmStats={confirmStats}
        existingProductsList={existingProductsList}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        otherReason={otherReason}
        setOtherReason={setOtherReason}
        showError={showError}
        isReasonValid={isReasonValid}
      />

      <LoadingOverlay visible={isDownloadingMatching} />
      {confirmPopup}
    </div>
  );
});
MatchingResultsDetails.displayName = "MatchingResultsDetails";

export default MatchingResultsDetails;
