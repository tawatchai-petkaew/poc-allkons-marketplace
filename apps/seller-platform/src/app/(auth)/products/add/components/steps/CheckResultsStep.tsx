'use client';

import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import BadgeLabel from '@/components/BadgeLabel';
import { useAddProductsContext } from '../../context/AddProductsContext';
import { STEPS } from '../../AddProducts.constants';
import type { ICheckResultItem } from '@/interfaces/product/add-product.interface';
import type { ICheckDuplicateProductItem } from '@/interfaces/product/product.response.interface';

// Transformed product for display
interface ITransformedProduct {
  name: string;
  barcode: string;
  id: string;
  categoryName: string;
  brand: string;
  image: string;
}

interface MerchantCheckResultCardProps {
  item: ICheckResultItem;
  onViewAddable: (products: ITransformedProduct[]) => void;
  onViewDuplicated: (products: ITransformedProduct[]) => void;
}

/**
 * MerchantCheckResultCard - Shows individual merchant check result
 */
export const MerchantCheckResultCard: React.FC<MerchantCheckResultCardProps> = ({
  item,
  onViewAddable,
  onViewDuplicated,
}) => {
  const addableProducts = item?.addableProducts || [];
  const duplicatedProducts = item?.duplicatedProducts || [];
  const merchant = item?.merchant || {};

  // Transform product data for display
  const transformProducts = (products: ICheckDuplicateProductItem[]): ITransformedProduct[] =>
    (products ?? []).map((product) => ({
      name: product.alias,
      barcode: product.barcode,
      id: product.id,
      categoryName: (product?.productVariantCategories ?? [])
        .map((x) => x?.category?.name || '')
        .filter(Boolean)
        .join(', '),
      brand: (product?.productVariantCategories ?? [])
        .map((x) => x?.brand?.name_th || '')
        .filter(Boolean)
        .join(', '),
      image: (product?.productVariantImages ?? [])
        .map((x) => x?.imageUpload?.url || '')
        .filter(Boolean)
        .join(', '),
    }));

  return (
    <div className="border border-primary-light rounded-lg bg-neutral-bg p-3 mt-6">
      <div className="flex gap-4">
        <img src={'/images/store/default.png'} className="w-16 h-16 object-cover rounded-md" alt="store" />
        <div className="flex flex-col justify-center">
          <Typography variant="paragraph-medium" className="!text-text-primary">
            {merchant?.merchantTranslations?.[0]?.name}{' '}
            {merchant?.merchantBranchType === 'HEAD_OFFICE' ? 'สำนักงานใหญ่' : null}
          </Typography>
          <Typography variant="paragraph-medium" className="!text-text-neutral-60 !font-regular mt-[10px]">
            สินค้าทั้งหมด {addableProducts.length + duplicatedProducts.length} รายการ
          </Typography>
        </div>
      </div>

      {/* Addable products section */}
      {addableProducts.length > 0 && (
        <div className="pl-[60px] mt-4 border bg-white rounded-md border-transparent">
          <div className="flex justify-between p-4">
            <div className="flex gap-6">
              <Typography variant="paragraph-medium" className="!text-text-primary">
                สินค้าที่สามารถเพิ่มได้
              </Typography>
              <div>
                <BadgeLabel
                  prefix={<i className="ri-checkbox-circle-line text-text-breadcrumb-active"></i>}
                  text={`${addableProducts.length} รายการ`}
                  color="success"
                  variant="ghost"
                  size="small"
                  rounding="pill"
                />
                <Typography variant="paragraph-medium" className="!text-text-quarternary mt-2">
                  สามารถเพิ่มสินค้าได้ เนื่องจากยังไม่มีในสาขา
                </Typography>
              </div>
            </div>
            <div>
              <CustomButton
                variant="link"
                color="neutral"
                onClick={() => onViewAddable(transformProducts(addableProducts))}
                className="border-transparent"
              >
                <Typography variant="paragraph-medium" className="!text-primary-background !font-medium">
                  ดูรายการสินค้า
                </Typography>
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Duplicated products section */}
      {duplicatedProducts.length > 0 && (
        <div className="pl-[60px] mt-4 border bg-white rounded-md border-transparent">
          <div className="flex justify-between p-4">
            <div className="flex gap-6">
              <Typography variant="paragraph-medium" className="!text-text-primary">
                สินค้าที่มีอยู่ในสาขาแล้ว
              </Typography>
              <div>
                <BadgeLabel
                  prefix={<i className="ri-close-circle-line text-warning-p20"></i>}
                  text={`${duplicatedProducts.length} รายการ`}
                  color="warning"
                  variant="ghost"
                  size="small"
                  rounding="pill"
                />
                <Typography variant="paragraph-medium" className="!text-text-quarternary mt-2">
                  ไม่สามารถเพิ่มสินค้า
                </Typography>
              </div>
            </div>
            <div>
              <CustomButton
                variant="link"
                color="neutral"
                onClick={() => onViewDuplicated(transformProducts(duplicatedProducts))}
                className="border-transparent"
              >
                <Typography variant="paragraph-medium" className="text-primary-background !font-medium">
                  ดูรายการสินค้า
                </Typography>
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * CheckResultsStepTitle - Title for Step 3
 */
export const CheckResultsStepTitle: React.FC<{ totalMerchants?: number }> = ({ totalMerchants = 0 }) => {
  const { setStep, totalAddableMerchant } = useAddProductsContext();

  return (
    <div>
      <div className="flex items-center gap-2">
        <i
          onClick={() => setStep(STEPS.MERCHANT_SELECTION)}
          className="ri-arrow-left-line text-neutral text-[24px] leading-[24px] cursor-pointer"
        />
        <Typography variant="h4" className="!text-text-primary !font-bold">
          สินค้าบางรายการมีอยู่ในสาขาแล้ว
        </Typography>
        <BadgeLabel
          prefix={<i className="ri-checkbox-circle-line max-w-[20px] max-h-[20px] text-neutral-60"></i>}
          text={`เพิ่มได้ ${totalAddableMerchant} สาขา`}
          variant="ghost"
          size="small"
          rounding="pill"
        />
      </div>
      <Typography variant="paragraph-medium" className="!text-text-tertiary !font-regular">
        ทั้งหมด {totalMerchants} สาขา
      </Typography>
    </div>
  );
};

interface CheckResultsStepProps {
  checkResults: ICheckResultItem[];
}

/**
 * CheckResultsStep - Step 3: Shows check results with addable/duplicated products
 */
export const CheckResultsStep: React.FC<CheckResultsStepProps> = ({ checkResults }) => {
  const { setStep, setListCanAdd, setListCanNotAdd } = useAddProductsContext();

  const handleViewAddable = (products: ITransformedProduct[]) => {
    setListCanAdd(products);
    setStep(STEPS.ADDABLE_DETAIL);
  };

  const handleViewDuplicated = (products: ITransformedProduct[]) => {
    setListCanNotAdd(products);
    setStep(STEPS.DUPLICATED_DETAIL);
  };

  return (
    <div>
      {checkResults.map((item, index) => (
        <MerchantCheckResultCard
          key={index}
          item={item}
          onViewAddable={handleViewAddable}
          onViewDuplicated={handleViewDuplicated}
        />
      ))}
    </div>
  );
};

interface CheckResultsStepFooterProps {
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * CheckResultsStepFooter - Footer for Step 3
 */
export const CheckResultsStepFooter: React.FC<CheckResultsStepFooterProps> = ({ onConfirm, onClose }) => {
  const { totalAddableMerchant, setStep } = useAddProductsContext();

  const handleClick = () => {
    if (totalAddableMerchant === 0) {
      onClose();
      setStep(STEPS.PRODUCT_SELECTION);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="flex gap-2 justify-end mt-6">
      <CustomButton onClick={handleClick}>
        {totalAddableMerchant === 0 ? 'ตกลง' : `เพิ่มสินค้าลง ${totalAddableMerchant} สาขา`}
      </CustomButton>
    </div>
  );
};

export default CheckResultsStep;
