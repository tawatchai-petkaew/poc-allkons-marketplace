'use client';

import Typography from '@/components/Typography';
import CustomTable from '@/components/Table';
import { useAddProductsContext } from '../../context/AddProductsContext';
import { STEPS } from '../../AddProducts.constants';
import type { ColumnsType } from 'antd/es/table';

// Transformed product type (matches transformed products from CheckResultsStep)
interface ITransformedProduct {
  name: string;
  barcode: string;
  id: string;
  categoryName: string;
  brand: string;
  image: string;
}

/**
 * AddableProductsDetailTitle - Title for Addable Products Detail step
 */
export const AddableProductsDetailTitle = () => {
  const { setStep, listCanAdd } = useAddProductsContext();

  return (
    <div>
      <div className="flex gap-2 items-center">
        <i
          onClick={() => setStep(STEPS.CHECK_RESULTS)}
          className="ri-arrow-left-line text-neutral text-[24px] leading-[24px] cursor-pointer"
        />
        <Typography variant="h4" className="!text-text-primary !font-bold">
          สินค้าที่สามารถเพิ่มได้
        </Typography>

        <div className="flex border border-border-brand-lighter bg-utils-primary-p90 rounded-full w-fit h-fit px-3 py-1 gap-[4px]">
          <i className="ri-checkbox-circle-line max-w-[20px] max-h-[20px] text-text-breadcrumb-active"></i>
          <Typography variant="paragraph-small" className="text-text-breadcrumb-active !font-regular">
            {listCanAdd.length} รายการ
          </Typography>
        </div>
      </div>
      <Typography variant="paragraph-medium" className="!text-text-tertiary !font-regular">
        สามารถเพิ่มสินค้าได้ เนื่องจากยังไม่มีในสาขา
      </Typography>
    </div>
  );
};

interface AddableProductsDetailProps {
  tableColumns: ColumnsType<ITransformedProduct>;
}

/**
 * AddableProductsDetail - Shows list of products that can be added
 */
export const AddableProductsDetail: React.FC<AddableProductsDetailProps> = ({ tableColumns }) => {
  const { listCanAdd } = useAddProductsContext();

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-auto max-h-[calc(100vh-300px)]">
      <CustomTable
        columns={tableColumns}
        items={listCanAdd}
        tableLayout="fixed"
        pagination={false}
        scroll={{ x: 900 }}
        sticky={{ offsetHeader: 0 }}
      />
    </div>
  );
};

// Backward compatibility export
export const AddableDetailStep = AddableProductsDetail;

export default AddableProductsDetail;
