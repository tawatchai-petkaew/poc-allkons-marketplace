'use client';

import React, { memo, useMemo, useCallback, useTransition } from 'react';
import { useShallow } from 'zustand/shallow';
import Typography from '@/components/Typography';
import CustomButton from '@/components/Button';
import CustomTable from '@/components/Table';
import TextField from '@/components/DataEntry/TextField';
import LoadingOverlay from '@/components/Loading/LoadingOverlay';
import ImportProductModal from './components/ImportProductModal';
import { useProductMatchingStore } from '@/store/product-matching.store';
import { useConfirmPopup } from '@/hooks/useConfirmPopup';
import { useRouter } from 'next/navigation';
import {
  getMenuItemsConfigForStatus,
  getMenuItemConfig,
  MENU_ITEM_TYPES,
  STATUS_MAP,
} from '@/app/(auth)/products/matching/constants';
import type { IProductImportBatch } from '@/interfaces/product/import-product.response.interface';
import { createProductMatchingColumns } from './components/ProductMatchingColumns';
import {
  useBatchListQuery,
  useCancelBatchMutation,
  useCompleteBatchMutation,
  useDeleteBatchMutation,
  useDownloadOriginalFileMutation,
  useDownloadMatchingResultMutation,
} from './hooks/useProductMatching';

const ProductMatchingPage = memo(() => {
  // Zustand State
  const {
    isImportModalOpen,
    filter,
    searchInput,
    currentPage,
    pageSize,
    setIsImportModalOpen,
    setFilter,
    setSearchInput,
    setCurrentPage,
    setPageSize,
    resetFilters,
  } = useProductMatchingStore(
    useShallow((state) => ({
      isImportModalOpen: state.isImportModalOpen,
      filter: state.filter,
      searchInput: state.searchInput,
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      setIsImportModalOpen: state.setIsImportModalOpen,
      setFilter: state.setFilter,
      setSearchInput: state.setSearchInput,
      setCurrentPage: state.setCurrentPage,
      setPageSize: state.setPageSize,
      resetFilters: state.resetFilters,
    }))
  );

  const [isPending, startTransition] = useTransition();

  // Queries & Mutations
  const {
    data: batchListResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useBatchListQuery({
    page: currentPage,
    limit: pageSize,
    search: filter.search,
    status: filter.status,
  });

  const cancelMutation = useCancelBatchMutation();
  const completeMutation = useCompleteBatchMutation();
  const deleteMutation = useDeleteBatchMutation();
  const downloadOriginalMutation = useDownloadOriginalFileMutation();
  const downloadMatchingMutation = useDownloadMatchingResultMutation();

  const data = React.useMemo(() => {
    return (batchListResponse?.data?.items || []).map((item: IProductImportBatch) => ({
      ...item,
      id: item.uuid,
      status: STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status.toLowerCase(),
    }));
  }, [batchListResponse?.data?.items]);

  const totalItems = batchListResponse?.data?.pagination?.total || 0;

  const statusCounts = React.useMemo(() => {
    return (
      batchListResponse?.data?.statusCounts || {
        ALL: 0,
        VALIDATED: 0,
        MATCHING: 0,
        PENDING_REVIEW: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      }
    );
  }, [batchListResponse?.data?.statusCounts]);

  const handleOpenImportModal = useCallback(
    () => setIsImportModalOpen(true),
    [setIsImportModalOpen]
  );

  const handleCloseImportModal = useCallback(() => {
    setIsImportModalOpen(false);
    refetch();
  }, [setIsImportModalOpen, refetch]);

  const handleSearchInputChange = useCallback(
    (value: string) => setSearchInput(value),
    [setSearchInput]
  );

  const handleSearch = useCallback(() => {
    startTransition(() => {
      setFilter({ search: searchInput });
      setCurrentPage(1);
    });
  }, [searchInput, setFilter, setCurrentPage]);

  const handleClearFilter = useCallback(() => {
    startTransition(() => {
      resetFilters();
    });
  }, [resetFilters]);

  const handleStatusFilter = useCallback(
    (status: string) => {
      startTransition(() => {
        setFilter({ status });
        setCurrentPage(1);
      });
    },
    [setFilter, setCurrentPage]
  );

  const handlePageChange = useCallback(
    (page: number, size: number) => {
      if (size !== pageSize) {
        setCurrentPage(1);
        setPageSize(size);
      } else {
        setCurrentPage(page);
      }
    },
    [pageSize, setCurrentPage, setPageSize]
  );

  const router = useRouter();

  const handleActionClick = useCallback(
    (record: IProductImportBatch) => {
      // Navigate to the matching details page
      if (record.uuid || record.id) {
        router.push(`/products/matching/${record.uuid || record.id}`);
      } else {
        console.warn('No UUID or ID found for record', record);
      }
    },
    [router]
  );

  const handleDownloadClick = useCallback(
    (record: IProductImportBatch) => {
      downloadOriginalMutation.mutate(record.uuid || record.id || '');
    },
    [downloadOriginalMutation]
  );

  const handleDownloadMatchingResult = useCallback(
    (record: IProductImportBatch) => {
      downloadMatchingMutation.mutate(record.uuid || record.id || '');
    },
    [downloadMatchingMutation]
  );

  const handleCancelBatch = useCallback(
    (uuid: string) => cancelMutation.mutate(uuid),
    [cancelMutation]
  );
  const handleCompleteBatch = useCallback(
    (uuid: string) => completeMutation.mutate(uuid),
    [completeMutation]
  );
  const handleDeleteBatch = useCallback(
    (uuid: string) => deleteMutation.mutate(uuid),
    [deleteMutation]
  );

  const isDownloadingMatching = downloadMatchingMutation.isPending;

  const { confirmPopup: cancelConfirm, showConfirm: showCancelConfirm } = useConfirmPopup();
  const { confirmPopup: completeConfirm, showConfirm: showCompleteConfirm } = useConfirmPopup();
  const { confirmPopup: deleteConfirm, showConfirm: showDeleteConfirm } = useConfirmPopup();

  // Handlers that show confirmation popups
  const handleCancelClick = useCallback(
    (record: IProductImportBatch) => {
      showCancelConfirm({
        title: 'ยกเลิกการจับคู่',
        detail: 'คุณต้องการยกเลิกการจับคู่สินค้านี้หรือไม่?',
        type: 'warn',
        onConfirm: () => handleCancelBatch(record.uuid || record.id || ''),
      });
    },
    [showCancelConfirm, handleCancelBatch]
  );

  const handleCompleteClick = useCallback(
    (record: IProductImportBatch) => {
      showCompleteConfirm({
        title: 'ยืนยันการเสร็จสิ้นการจับคู่',
        detail: 'การจับคู่ที่คงค้างและสินค้าที่แอดมินกำลังตรวจสอบจะไม่สามารถดำเนินการต่อได้',
        type: 'confirm',
        onConfirm: () => handleCompleteBatch(record.uuid || record.id || ''),
      });
    },
    [showCompleteConfirm, handleCompleteBatch]
  );

  const handleDeleteClick = useCallback(
    (record: IProductImportBatch) => {
      showDeleteConfirm({
        title: 'ยืนยันการลบรายการ',
        detail: 'ไฟล์นี้จะถูกลบออกจากระบบ และไม่สามารถดำเนินการหรือกู้คืนได้',
        type: 'warn',
        onConfirm: () => handleDeleteBatch(record.uuid || record.id || ''),
      });
    },
    [showDeleteConfirm, handleDeleteBatch]
  );

  const handleMainActionClick = useCallback(
    (record: IProductImportBatch, actionType: string) => {
      if (actionType === 'validated' || actionType === 'managing') {
        handleActionClick(record);
      } else if (actionType === 'matching') {
        handleCancelClick(record);
      } else if (actionType === 'cancelled') {
        handleDeleteClick(record);
      }
    },
    [handleActionClick, handleCancelClick, handleDeleteClick]
  );

  const getMenuItems = useCallback(
    (record: IProductImportBatch) => {
      const menuItemTypes = getMenuItemsConfigForStatus(record.status);
      const handlerMap: Record<string, (record: IProductImportBatch) => void> = {
        [MENU_ITEM_TYPES.CANCEL]: handleCancelClick,
        [MENU_ITEM_TYPES.COMPLETE]: handleCompleteClick,
        [MENU_ITEM_TYPES.DOWNLOAD_ORIGINAL]: handleDownloadClick,
        [MENU_ITEM_TYPES.DOWNLOAD_MATCHING]: handleDownloadMatchingResult,
        [MENU_ITEM_TYPES.DELETE]: handleDeleteClick,
        [MENU_ITEM_TYPES.DELETE_DEFAULT]: handleDeleteClick,
        [MENU_ITEM_TYPES.DOWNLOAD]: handleDownloadClick,
      };

      return menuItemTypes.map((type: string) => {
        const config = getMenuItemConfig(type);
        return {
          type,
          config,
          handler: handlerMap[type],
          record,
        };
      });
    },
    [
      handleCancelClick,
      handleCompleteClick,
      handleDeleteClick,
      handleDownloadClick,
      handleDownloadMatchingResult,
    ]
  );

  const tableColumns = useMemo(
    () => createProductMatchingColumns(handleMainActionClick, getMenuItems),
    [handleMainActionClick, getMenuItems]
  );

  const statusTabs = useMemo(
    () => [
      { value: 'all', label: 'ทั้งหมด', count: statusCounts.ALL || 0 },
      {
        value: 'matching',
        label: 'ระบบกำลังจับคู่',
        count: statusCounts.MATCHING || 0,
      },
      {
        value: 'managing',
        label: 'จัดการผลการจับคู่',
        count: statusCounts.PENDING_REVIEW || 0,
      },
      {
        value: 'complete',
        label: 'นำเข้าเสร็จสิ้น',
        count: statusCounts.COMPLETED || 0,
      },
      {
        value: 'cancelled',
        label: 'ยกเลิก',
        count: statusCounts.CANCELLED || 0,
      },
    ],
    [statusCounts]
  );

  // Search input change handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSearchInputChange(e.target.value);
    },
    [handleSearchInputChange]
  );

  return (
    <div className="p-11">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <Typography variant="page-title" className="!font-bold !text-text-primary">
            การจับคู่สินค้า
          </Typography>
          <Typography variant="paragraph-medium" className="!text-text-tertiary">
            คุณกำลังจัดการการนำเข้า และการจับคู่สินค้า
          </Typography>
        </div>
        <div>
          <CustomButton
            variant="solid"
            color="primary"
            icon={<i className="ri-upload-2-line"></i>}
            onClick={handleOpenImportModal}
            dataTestId="btn-import-product"
          >
            นำเข้า/อัปเดตสินค้า
          </CustomButton>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {/* Search Section */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] max-w-[360px]">
              <TextField
                label="ค้นหา"
                vertical={true}
                placeholder="ชื่อไฟล์"
                prefix={<i className="ri-search-line"></i>}
                value={searchInput}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                dataTestId="search-file-name"
              />
            </div>
            <div className="flex gap-2">
              <CustomButton
                variant="outlined"
                color="neutral"
                onClick={handleClearFilter}
                className="!min-w-[120px]"
                dataTestId="btn-clear-filter"
              >
                ล้างค่า
              </CustomButton>
              <CustomButton
                onClick={handleSearch}
                className="!min-w-[120px]"
                dataTestId="btn-search"
              >
                ค้นหา
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {statusTabs.map((tab) => (
            <div
              key={tab.value}
              className={`rounded-full py-[10px] px-4 cursor-pointer text-nowrap flex-shrink-0 ${
                filter.status === tab.value
                  ? 'bg-primary text-white'
                  : 'border border-border-primary'
              }`}
              onClick={() => handleStatusFilter(tab.value)}
            >
              {tab.label} ({tab.count})
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl overflow-auto">
          <div className="pt-6 pb-3 px-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Typography variant="h6" className="!font-bold !text-text-secondary">
                การจับคู่สินค้า {totalItems} รายการ
              </Typography>
            </div>
          </div>

          <div className="mt-3">
            {isError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <i className="ri-error-warning-line text-5xl text-error mb-4"></i>
                <Typography variant="h6" className="!text-text-secondary">
                  เกิดข้อผิดพลาดในการโหลดข้อมูล
                </Typography>
                <Typography variant="paragraph-small" className="!text-text-tertiary">
                  กรุณาลองใหม่อีกครั้ง
                </Typography>
              </div>
            ) : (
              <CustomTable
                className="[&_.ant-table-tbody>tr>td]:!py-6 [&_.ant-table-body]:scrollbar-thin [&_.ant-table-body]:scrollbar-thumb-[#00af43] hover:[&_.ant-table-body]:scrollbar-thumb-[#008c36] [&_.ant-table-body]:scrollbar-track-[#f1f1f1]"
                columns={tableColumns}
                items={data}
                loading={isLoading || isFetching || isPending}
                scroll={{ x: 1600 }}
                tableLayout="fixed"
                emptyText="ไม่พบข้อมูล"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalItems,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '25', '50', '100', '250'],
                  onChange: handlePageChange,
                  locale: {
                    items_per_page: ' / หน้า',
                    prev_page: 'ย้อนกลับ',
                    next_page: 'หน้าถัดไป',
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      <ImportProductModal visible={isImportModalOpen} onClose={handleCloseImportModal} />

      {cancelConfirm}
      {completeConfirm}
      {deleteConfirm}

      <LoadingOverlay visible={isDownloadingMatching} />
    </div>
  );
});

ProductMatchingPage.displayName = 'ProductMatchingPage';

export default ProductMatchingPage;
