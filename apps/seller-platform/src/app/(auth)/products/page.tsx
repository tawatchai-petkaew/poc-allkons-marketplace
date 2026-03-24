'use client';

import { ProductSelectionProvider } from './context/ProductSelectionContext';
import { ProductsHeader } from './components/ProductsHeader';
import { ProductsFilterSection } from './components/ProductsFilterSection';
import { ProductsStatusTabs } from './components/ProductsStatusTabs';
import { ProductsTableActions } from './components/ProductsTableActions';
import { ProductsTable } from './components/ProductsTable';
import { AddProductSuccessAlert } from './components/AddProductSuccessAlert';
import { useProduct } from './hooks/useProduct';

function ProductsContent() {
  const {
    merchantSlug,
    products,
    isLoading,
    totalItems,
    productImageMap,
    categoryPathMap,
    categoryTreeData,
    productTypeOptions,
    statusCounts,
    currentPage,
    pageSize,
    priceDisplayMode,
    setPriceDisplayMode,
    showVatDetails,
    setShowVatDetails,
    isUpdatingStatus,
    hasInvalidStatusSelected,
    currentFilters,
    filter,
    selection,
    handlers,
  } = useProduct();

  return (
    <div className="p-3">
      <div className="px-8 py-5 pt-10">
        <AddProductSuccessAlert />

        <ProductsHeader 
          merchantSlug={merchantSlug} 
          currentFilters={currentFilters}
          priceDisplayMode={priceDisplayMode}
        />

        <div className="mt-6 flex flex-col gap-6">
          <ProductsFilterSection
            tempFilter={filter.temp}
            onTempFilterChange={filter.updateTemp}
            productTypeOptions={productTypeOptions}
            categoryTreeData={categoryTreeData}
            tempCategoryFilter={filter.tempCategory}
            onTempCategoryFilterChange={filter.setTempCategory}
            onSearch={handlers.onSearch}
            onReset={handlers.onReset}
          />

          <ProductsStatusTabs
            currentStatus={filter.active.status}
            statusCounts={statusCounts}
            onStatusChange={handlers.onStatusChange}
          />

          <div className="bg-white rounded-xl overflow-auto">
            <ProductsTableActions
              totalItems={totalItems}
              selectedRowKeys={Array.from(selection.selectedRowKeys)}
              selectedCount={selection.selectedCount}
              priceDisplayMode={priceDisplayMode}
              onPriceDisplayModeChange={setPriceDisplayMode}
              showVatDetails={showVatDetails}
              onShowVatDetailsChange={setShowVatDetails}
              onShowProducts={handlers.onShowProducts}
              isUpdatingStatus={isUpdatingStatus}
              hasInvalidStatusSelected={hasInvalidStatusSelected}
              cachedProducts={selection.getAllCachedProducts()}
              getAllCachedProducts={selection.getAllCachedProducts}
              clearAll={selection.clearAll}
              onEditPricing={handlers.onEditPricing}
              onBulkUpdateStatus={handlers.onBulkUpdateStatus}
              onBulkDelete={handlers.onBulkDelete}
            />

            <ProductsTable
              products={products}
              loading={isLoading}
              selectedRowKeys={selection.getSelectedKeysArray()}
              onSelectionChange={handlers.onSelectionChange}
              priceDisplayMode={priceDisplayMode}
              showVatDetails={showVatDetails}
              productImageMap={productImageMap}
              categoryPathMap={categoryPathMap}
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlers.onPageChange}
              onEdit={handlers.onEdit}
              onDelete={handlers.onDelete}
              onToggleStatus={handlers.onToggleStatus}
              isUpdatingStatus={isUpdatingStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  return (
    <ProductSelectionProvider>
      <ProductsContent />
    </ProductSelectionProvider>
  );
}
