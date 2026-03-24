'use client';

// External dependencies
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Popover } from 'antd';
import type { ColumnsType } from 'antd/es/table';

// UI Components
import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import TextField from '@/components/DataEntry/TextField';
import Select from '@/components/DataEntry/Select';
import BadgeLabel from '@/components/BadgeLabel';
import CustomTable from '@/components/Table';
import ResponsivePopup from '@/components/Popup';
import ProductImage from '@/components/Image';

// Hooks
import { useConfirmPopup } from '@/hooks/useConfirmPopup';
import { useNotification } from '@/hooks/useNotification';

// Constants
import { SEARCH_TYPE_OPTIONS } from '../constants/products.constants';
import { PAGINATION_SIZE_OPTIONS } from '@/constants/common.constants';
import { routes } from '@/constants/routing.constants';

// Local imports
import { STEPS } from './AddProducts.constants';
import { AddProductsProvider, useAddProductsContext } from './context/AddProductsContext';
import { useAddProducts } from './hooks/useAddProducts';
import {
  ProductSelectionStepTitle,
  ProductSelectionStep,
  ProductSelectionStepFooter,
  MerchantSelectionStepTitle,
  MerchantSelectionStep,
  MerchantSelectionStepFooter,
  CheckResultsStepTitle,
  CheckResultsStep,
  CheckResultsStepFooter,
  AddableProductsDetailTitle,
  AddableProductsDetail,
  DuplicatedProductsDetailTitle,
  DuplicatedProductsDetail,
  ProductNameCell,
} from './components';

// Types
import type { ICheckResultItem, IAddProductToMerchantPayload } from '@/interfaces/product/add-product.interface';
import type { IProductImport } from '@/interfaces/product/product.response.interface';

// Transformed product type for display in detail views
interface ITransformedProduct {
  name: string;
  barcode: string;
  id: string;
  categoryName: string;
  brand: string;
  image: string;
}

/**
 * Calculate success data for localStorage after adding products
 * Returns null if only HEAD_OFFICE selected (should clear storage)
 */
function calculateSuccessData(
  checkResultsData: ICheckResultItem[],
  isOnHeadOffice: boolean,
  totalAddableMerchant: number,
): { merchants: number; products: number } | null {
  // If only HEAD_OFFICE is selected, clear localStorage
  if (
    checkResultsData.length === 1 &&
    isOnHeadOffice &&
    checkResultsData[0].merchant?.merchantBranchType === 'HEAD_OFFICE'
  ) {
    return null;
  }

  // Calculate total products added to branches only (exclude HEAD_OFFICE)
  const combinedSkus = Array.from(
    new Set(
      (checkResultsData || [])
        .filter((item) => item.merchant?.merchantBranchType !== 'HEAD_OFFICE')
        .flatMap((item) => (item.addableProducts || []).map((product) => product?.id))
        .filter(Boolean),
    ),
  );

  // Get product IDs that already exist in HEAD_OFFICE
  const productOfHeadOffice = checkResultsData.filter(
    (item) => item.merchant?.merchantBranchType === 'HEAD_OFFICE',
  );

  const headOfficeSkus = new Set(
    productOfHeadOffice
      .flatMap((item) => (item.duplicatedProducts || []).map((product) => product?.id))
      .filter(Boolean),
  );

  // Filter out product IDs that already exist in HEAD_OFFICE
  const filteredSkus = combinedSkus.filter((sku) => !headOfficeSkus.has(sku));

  return {
    merchants: totalAddableMerchant || 0,
    products: filteredSkus.length || 0,
  };
}

// Wrapper component with Provider
const Products = () => {
  return (
    <AddProductsProvider>
      <ProductsContent />
    </AddProductsProvider>
  );
};

// Main content component using hooks
const ProductsContent = () => {
  const router = useRouter();
  const { confirmPopup, showConfirm } = useConfirmPopup();
  const { notification } = useNotification();

  // Get context values for modal product selection
  const {
    setSelectedAddProductsKey,
    setSelectedAddProducts,
    step,
    setStep,
    selectedMerchants,
    totalAddableMerchant,
    isOnHeadOffice,
  } = useAddProductsContext();

  // Use consolidated hook for all AddProducts functionality
  const {
    // Product Search
    products,
    total,
    isLoadingProducts,
    currentPage,
    pageSize,
    tempFilter,
    setTempFilter,
    categoryPathMap,
    handleSearch,
    handleClearSearch,
    handlePageChange,
    handlePageSizeChange,

    // Product Selection
    selectedProducts,
    productRowSelection,

    // Modals
    modals,
    openModal,
    closeModal,
    closeAllModals,

    // Check & Add Products
    isCheckingDuplicates,
    isAddingProducts,
    checkResultsData,
    handleCheckAndAddProducts,
    handleAddProductsAfterCheck,
    addProductsToMerchants,
  } = useAddProducts({ notification });

  // Table columns - Memoized to prevent unnecessary re-renders
  const tableColumns = useMemo(
    () => [
      {
        title: <span className="whitespace-nowrap">รายการสินค้า/แบรนด์</span>,
        dataIndex: 'image',
        key: 'image',
        width: 480,
        render: (_: unknown, record: IProductImport) => (
          <ProductNameCell
            image={record.image}
            name={record.name}
            brand={record.brand}
            showPopover={true}
          />
        ),
      },
      {
        title: <span className="whitespace-nowrap">Barcode</span>,
        dataIndex: 'barcode',
        key: 'barcode',
        width: 160,
        render: (barcode: string) => (
          <Typography variant="paragraph-small" className="!text-text-secondary whitespace-nowrap">
            {barcode}
          </Typography>
        ),
      },
      {
        title: <span className="whitespace-nowrap">หมวดหมู่</span>,
        dataIndex: 'categoryName',
        key: 'categoryName',
        width: 200,
        render: (_: unknown, record: IProductImport) => {
          const productVariantId = record?.productVariant?.id;
          const categoryPathData = productVariantId ? categoryPathMap[productVariantId] : undefined;
          const fallbackData = {
            fullPath: '-',
            pathWithoutLast: '-',
            lastItem: '',
          };
          const pathData = categoryPathData || fallbackData;
          const categoryName = record.productVariant?.product?.category?.name;

          return categoryName ? (
            <Popover
              className="w-fit"
              content={
                <div className="flex flex-col gap-1">
                  <Typography variant="paragraph-small" className="!text-text-primary !font-medium whitespace-nowrap">
                    หมวดหมู่
                  </Typography>
                  <Typography variant="paragraph-small" className="!text-text-secondary break-words">
                    {pathData.pathWithoutLast && (
                      <span className="text-gray-light">{pathData.pathWithoutLast}</span>
                    )}
                    {pathData.lastItem && (
                      <span className="!font-weight-bold">
                        {pathData.pathWithoutLast
                          ? ` > ${pathData.lastItem}`
                          : pathData.lastItem}
                      </span>
                    )}
                  </Typography>
                </div>
              }
              trigger="click"
              placement="top"
              overlayStyle={{ maxWidth: '400px' }}
            >
              <div>
                <BadgeLabel
                  text={categoryName}
                  color="brand"
                  variant="ghost"
                  size="small"
                  rounding="pill"
                  maxLength={20}
                />
              </div>
            </Popover>
          ) : (
            '-'
          );
        },
      },
    ],
    [categoryPathMap],
  );

  // Columns for transformed product detail views (addable/duplicated)
  const transformedTableColumns: ColumnsType<ITransformedProduct> = useMemo(
    () => [
      {
        title: <span className="whitespace-nowrap">รายการสินค้า/แบรนด์</span>,
        dataIndex: 'image',
        key: 'image',
        width: 480,
        render: (_: unknown, record: ITransformedProduct) => (
          <ProductNameCell
            image={record.image}
            name={record.name}
            brand={record.brand}
            showPopover={false}
          />
        ),
      },
      {
        title: <span className="whitespace-nowrap">Barcode</span>,
        dataIndex: 'barcode',
        key: 'barcode',
        width: 160,
        render: (barcode: string) => (
          <Typography variant="paragraph-small" className="!text-text-secondary whitespace-nowrap">
            {barcode}
          </Typography>
        ),
      },
      {
        title: <span className="whitespace-nowrap">หมวดหมู่</span>,
        dataIndex: 'categoryName',
        key: 'categoryName',
        width: 200,
        render: (categoryName: string) => (
          <Typography variant="paragraph-small" className="!text-text-secondary">
            {categoryName || '-'}
          </Typography>
        ),
      },
    ],
    [],
  );

  // Handlers - Memoized with useCallback
  const handleOpenAddProductModal = useCallback(() => {
    setSelectedAddProductsKey(selectedProducts.map((p) => p.id));
    setSelectedAddProducts(selectedProducts);
    openModal('isShowAddProduct');
  }, [selectedProducts, setSelectedAddProductsKey, setSelectedAddProducts, openModal]);

  const handleCloseAddProductModal = useCallback(() => {
    closeModal('isShowAddProduct');
    setStep(STEPS.PRODUCT_SELECTION);
    setSelectedAddProductsKey([]);
    setSelectedAddProducts([]);
  }, [closeModal, setStep, setSelectedAddProductsKey, setSelectedAddProducts]);

  // Shared success handler - saves to localStorage and shows success modal
  const showSuccessAndRedirect = useCallback(
    (resultsData: ICheckResultItem[], merchantCount: number) => {
      // Calculate and save success data immediately with fresh data
      const successData = calculateSuccessData(resultsData, isOnHeadOffice, merchantCount);

      if (successData === null) {
        localStorage.removeItem('addProduct');
      } else {
        localStorage.setItem('addProduct', JSON.stringify(successData));
      }

      // Show success popup
      showConfirm({
        type: 'confirm',
        title: `เพิ่มสินค้าลง ${merchantCount} สาขาสำเร็จ`,
        detail: '',
        confirmText: 'ตกลง',
        footerButtons: 'confirm',
        onConfirm: () => {
          router.push(routes.productList() + '?status=NotApproved');
        },
      });
    },
    [isOnHeadOffice, showConfirm, router],
  );

  const handleConfirmAddProducts = useCallback(() => {
    handleCheckAndAddProducts({
      onNoDuplicates: async (payload: IAddProductToMerchantPayload[], resultsData: ICheckResultItem[]) => {
        await addProductsToMerchants(payload);
        closeAllModals();

        // Calculate merchant count from payload (fixes timing issue with state update)
        const merchantCount = payload.length;

        // Use shared success handler with fresh data
        showSuccessAndRedirect(resultsData, merchantCount);
      },
      onHasDuplicates: () => {
        closeModal('isShowConfirmAddProduct');
      },
      onError: () => {
        closeModal('isShowConfirmAddProduct');
        showConfirm({
          type: 'warn',
          title: 'เกิดข้อผิดพลาด',
          detail: 'กรุณาลองใหม่อีกครั้ง',
          confirmText: 'ตกลง',
          footerButtons: 'confirm',
        });
      },
    });
  }, [
    handleCheckAndAddProducts,
    addProductsToMerchants,
    closeAllModals,
    closeModal,
    showConfirm,
    showSuccessAndRedirect,
  ]);

  const handleAddProductsAfterDuplicateCheck = useCallback(async () => {
    await handleAddProductsAfterCheck();
    closeAllModals();

    // Use fresh data from checkResultsData state (already updated by handleAddProductsAfterCheck)
    const merchantCount = checkResultsData?.length || 0;
    showSuccessAndRedirect(checkResultsData, merchantCount);
  }, [handleAddProductsAfterCheck, closeAllModals, checkResultsData, showSuccessAndRedirect]);

  // Unified pagination handler
  const handlePaginationChange = useCallback(
    (page: number, size: number) => {
      size !== pageSize ? handlePageSizeChange(size) : handlePageChange(page);
    },
    [pageSize, handlePageSizeChange, handlePageChange],
  );

  // Step configuration mapping - Memoized to prevent re-creating JSX on every render
  const STEP_CONFIG = useMemo(
    () => ({
      [STEPS.PRODUCT_SELECTION]: {
        title: <ProductSelectionStepTitle />,
        content: <ProductSelectionStep tableColumns={tableColumns} isLoading={isLoadingProducts} />,
        footer: <ProductSelectionStepFooter />,
      },
      [STEPS.MERCHANT_SELECTION]: {
        title: <MerchantSelectionStepTitle />,
        content: <MerchantSelectionStep />,
        footer: (
          <MerchantSelectionStepFooter
            onConfirm={() => {
              showConfirm({
                type: 'confirm',
                title: 'ยืนยันเพิ่มสินค้าลงสาขา',
                detail: `ระบบจะเพิ่มสินค้าลง ${selectedMerchants?.length || 0} สาขา`,
                confirmText: 'ยืนยัน',
                cancelText: 'ยกเลิก',
                onConfirm: handleConfirmAddProducts,
              });
            }}
          />
        ),
      },
      [STEPS.CHECK_RESULTS]: {
        title: <CheckResultsStepTitle totalMerchants={checkResultsData?.length || 0} />,
        content: <CheckResultsStep checkResults={checkResultsData} />,
        footer: (
          <CheckResultsStepFooter
            onConfirm={() => {
              showConfirm({
                type: 'confirm',
                title: 'ยืนยันเพิ่มสินค้าลงสาขา',
                detail: `ระบบจะเพิ่มสินค้าลง ${totalAddableMerchant} สาขา`,
                confirmText: 'ยืนยัน',
                cancelText: 'ยกเลิก',
                onConfirm: handleAddProductsAfterDuplicateCheck,
              });
            }}
            onClose={closeAllModals}
          />
        ),
      },
      [STEPS.ADDABLE_DETAIL]: {
        title: <AddableProductsDetailTitle />,
        content: <AddableProductsDetail tableColumns={transformedTableColumns} />,
        footer: null,
      },
      [STEPS.DUPLICATED_DETAIL]: {
        title: <DuplicatedProductsDetailTitle />,
        content: <DuplicatedProductsDetail tableColumns={transformedTableColumns} />,
        footer: null,
      },
    }),
    [
      tableColumns,
      transformedTableColumns,
      isLoadingProducts,
      selectedMerchants?.length,
      handleConfirmAddProducts,
      checkResultsData,
      totalAddableMerchant,
      handleAddProductsAfterDuplicateCheck,
      closeAllModals,
      showConfirm,
    ],
  );

  // Get current step config with fallback
  const currentStepConfig = STEP_CONFIG[step] || {
    title: '',
    content: null,
    footer: null,
  };

  return (
    <div className="px-8 py-5">
      {confirmPopup}
      {/* Header */}
      <div>
        <CustomButton
          variant="link"
          className="!px-0"
          icon={<i className="ri-arrow-left-line" />}
          color="neutral"
          onClick={() => router.push(routes.productList())}
        >
          ย้อนกลับ
        </CustomButton>
        <Typography variant="h3" className="!text-text-primary !font-bold">
          เพิ่มสินค้าจากระบบ
        </Typography>
        <Typography variant="paragraph-medium" className="!text-text-tertiary">
          คุณกำลังเลือกสินค้าจากระบบเข้าร้านค้า
        </Typography>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {/* Search Filter */}
        <div className="p-6 bg-white rounded-lg relative shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            <Select
              label="ประเภทคำค้นหา"
              placeholder="เลือกประเภทการค้นหา"
              options={[...SEARCH_TYPE_OPTIONS]}
              className="!h-[40px] [&_.ant-select-selector]:!h-[40px]"
              vertical
              value={tempFilter.searchType}
              onChange={(value) => setTempFilter({ ...tempFilter, searchType: value })}
            />
            <TextField
              label="ค้นหา"
              vertical={true}
              placeholder="บาร์โค้ด แบรนด์ หรือชื่อสินค้า"
              prefix={<i className="ri-search-line"></i>}
              value={tempFilter.search}
              onChange={(e) => setTempFilter({ ...tempFilter, search: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              maxLength={100}
            />
          </div>
          <div className="flex gap-2 absolute bottom-6 right-6">
            <CustomButton color="neutral" variant="outlined" onClick={handleClearSearch}>
              ล้างค่า
            </CustomButton>
            <CustomButton onClick={handleSearch}>ค้นหา</CustomButton>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-auto">
          <div className="py-6 px-4 flex justify-between items-center">
            <Typography variant="paragraph-medium" className="!text-text-secondary !font-semibold">
              สินค้าทั้งหมด {total} รายการ
            </Typography>
          </div>
          <div>
            <CustomTable
              columns={tableColumns}
              items={products}
              loading={isLoadingProducts}
              tableLayout="fixed"
              rowSelection={productRowSelection}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                pageSizeOptions: [...PAGINATION_SIZE_OPTIONS],
                onChange: handlePaginationChange,
                hideOnSinglePage: false,
              }}
              emptyText={
                <Typography variant="paragraph-big" className="!font-medium !text-text-secondary">
                  ไม่พบสินค้า
                </Typography>
              }
              scroll={{ x: 900 }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 justify-end">
          <CustomButton color="neutral" variant="outlined" onClick={() => router.push(routes.productList())}>
            ยกเลิก
          </CustomButton>
          <CustomButton onClick={handleOpenAddProductModal} disabled={selectedProducts.length === 0}>
            {selectedProducts.length === 0 ? 'เพิ่มสินค้า' : `เพิ่มสินค้า ${selectedProducts.length} รายการ`}
          </CustomButton>
        </div>
      </div>

      {/* Add Product Modal */}
      <ResponsivePopup
        visible={modals.isShowAddProduct}
        onClose={handleCloseAddProductModal}
        modalTitle={currentStepConfig.title}
        drawerTitle={currentStepConfig.title}
        modalProps={{
          width: 960,
          styles: {
            content: {
              height: '90vh',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            },
            body: {
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
          zIndex: 1000,
        }}
        footer={currentStepConfig.footer}
      >
        <div className="flex-1 min-h-0 flex flex-col">{currentStepConfig.content}</div>
      </ResponsivePopup>
    </div>
  );
};

export default Products;
