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
 * DuplicatedProductsDetailTitle - Title for Duplicated Products Detail step
 */
export const DuplicatedProductsDetailTitle = () => {
  const { setStep, listCanNotAdd } = useAddProductsContext();

  return (
    <div>
      <div className="flex gap-2 items-center">
        <i
          onClick={() => setStep(STEPS.CHECK_RESULTS)}
          className="ri-arrow-left-line text-neutral text-[24px] leading-[24px] cursor-pointer"
        />
        <Typography variant="h4" className="!text-text-primary !font-bold">
          สินค้าที่มีอยู่ในสาขาแล้ว
        </Typography>

        <div className="flex border border-warning-p60 bg-warning-p90 rounded-full w-fit h-fit px-3 py-1 gap-[4px]">
          <i className="ri-close-circle-line max-w-5 max-h-5 text-warning-p20"></i>
          <Typography variant="paragraph-medium" className="text-warning-p20 font-regular">
            {listCanNotAdd.length} รายการ
          </Typography>
        </div>
      </div>
      <Typography variant="paragraph-medium" className="!text-text-tertiary !font-regular">
        ไม่สามารถเพิ่มสินค้า เนื่องจากมีอยู่ในสาขาแล้ว
      </Typography>
    </div>
  );
};

interface DuplicatedProductsDetailProps {
  tableColumns: ColumnsType<ITransformedProduct>;
}

/**
 * DuplicatedProductsDetail - Shows list of duplicated products
 */
export const DuplicatedProductsDetail: React.FC<DuplicatedProductsDetailProps> = ({ tableColumns }) => {
  const { listCanNotAdd } = useAddProductsContext();

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-auto max-h-[calc(100vh-300px)]">
      <CustomTable
        columns={tableColumns}
        items={listCanNotAdd}
        tableLayout="fixed"
        pagination={false}
        scroll={{ x: 900 }}
        sticky={{ offsetHeader: 0 }}
      />
    </div>
  );
};

// Backward compatibility export
export const DuplicatedDetailStep = DuplicatedProductsDetail;

export default DuplicatedProductsDetail;
