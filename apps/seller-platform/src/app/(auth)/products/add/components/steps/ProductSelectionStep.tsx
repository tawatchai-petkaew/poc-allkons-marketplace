'use client';

import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import CustomTable from '@/components/Table';
import { useAddProductsContext } from '../../context/AddProductsContext';
import { STEPS } from '../../AddProducts.constants';
import type { ColumnsType } from 'antd/es/table';
import type { IProductImport } from '@/interfaces/product/product.response.interface';

interface ProductSelectionStepProps {
  tableColumns: ColumnsType<IProductImport>;
  isLoading: boolean;
}

/**
 * ProductSelectionStepTitle - Title for Step 1
 */
export const ProductSelectionStepTitle = () => {
  const { selectedAddProductsKey } = useAddProductsContext();

  return (
    <div>
      <Typography variant="h4" className="!font-bold !text-text-primary">
        สินค้าที่เลือกจากระบบ
      </Typography>
      <Typography variant="paragraph-medium" className="!text-text-tertiary">
        ทั้งหมด {selectedAddProductsKey?.length} รายการ
      </Typography>
    </div>
  );
};

/**
 * ProductSelectionStep - Step 1 of Add Products flow
 * Displays selected products and allows user to confirm selection
 */
export const ProductSelectionStep: React.FC<ProductSelectionStepProps> = ({ tableColumns, isLoading }) => {
  const {
    selectedProducts: selectedProductsSearch,
    selectedAddProductsKey,
    setSelectedAddProductsKey,
    setSelectedAddProducts,
  } = useAddProductsContext();

  const handleSelectionChange = (selectedKeys: React.Key[]) => {
    setSelectedAddProductsKey(selectedKeys);

    setSelectedAddProducts((prev) => {
      // หา id ของหน้าปัจจุบัน
      const currentPageIds = selectedProductsSearch.map((p: IProductImport) => p.id);

      // เก็บสินค้าที่เลือกไว้จากหน้าอื่นๆ (ไม่อยู่ในหน้าปัจจุบัน)
      const productsFromOtherPages = prev.filter((item: IProductImport) => !currentPageIds.includes(item.id));

      // สินค้าที่เลือกในหน้าปัจจุบัน (object product เต็ม)
      const selectedInCurrentPage = selectedProductsSearch.filter((product: IProductImport) => selectedKeys.includes(product.id));

      // รวมกัน
      const combined = [...productsFromOtherPages, ...selectedInCurrentPage];

      // ลบ duplicate ตาม id
      const unique = combined.filter(
        (item: IProductImport, index: number, self: IProductImport[]) => index === self.findIndex((t: IProductImport) => t.id === item.id),
      );
      return unique;
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-auto max-h-[calc(100vh-300px)]">
      <CustomTable
        columns={tableColumns}
        items={selectedProductsSearch}
        loading={isLoading}
        tableLayout="fixed"
        rowSelection={{
          selectedRowKeys: selectedAddProductsKey,
          onChange: handleSelectionChange,
          columnWidth: 56,
          fixed: true,
        }}
        pagination={false}
        scroll={{ x: 900 }}
        sticky={{ offsetHeader: 0 }}
      />
    </div>
  );
};

/**
 * ProductSelectionStepFooter - Footer for Step 1
 */
export const ProductSelectionStepFooter = () => {
  const { selectedAddProductsKey, setStep } = useAddProductsContext();

  return (
    <div className="flex justify-end mt-4">
      <CustomButton onClick={() => setStep(STEPS.MERCHANT_SELECTION)} disabled={selectedAddProductsKey.length === 0}>
        ยืนยันเพิ่มสินค้า {selectedAddProductsKey.length} รายการ
      </CustomButton>
    </div>
  );
};

export default ProductSelectionStep;
