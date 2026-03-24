'use client';

import Typography from '@/components/Typography';
import CustomButton from '@/components/Button';
import { Checkbox } from 'antd';
import { useAddProductsContext } from '../../context/AddProductsContext';
import { STEPS } from '../../AddProducts.constants';

const CheckboxGroup = Checkbox.Group;

/**
 * MerchantSelectionStepTitle - Title for Step 2
 * Shows back button with title and merchant count
 */
export const MerchantSelectionStepTitle = () => {
  const { merchants, setStep } = useAddProductsContext();

  return (
    <>
      <div className="flex gap-2 items-center justify-start">
        <i
          onClick={() => setStep(STEPS.PRODUCT_SELECTION)}
          className="ri-arrow-left-line text-neutral text-[24px] leading-[24px] cursor-pointer"
        />
        <Typography variant="h4" className="!text-text-primary !font-bold">
          เพิ่มสินค้าลงสาขา
        </Typography>
      </div>
      <Typography variant="paragraph-medium" className="!text-text-tertiary !font-regular">
        ทั้งหมด {merchants.length} สาขา
      </Typography>
    </>
  );
};

/**
 * MerchantSelectionStep - Step 2 of Add Products flow
 * Displays merchant list and allows user to select branches
 * Uses context for all data and handlers
 */
export const MerchantSelectionStep = () => {
  const {
    merchants,
    isOnHeadOffice,
    selectedMerchants,
    merchantCheckAll,
    merchantIndeterminate,
    handleMerchantCheckAllChange,
    handleMerchantChange,
  } = useAddProductsContext();

  return (
    <div>
      {/* Info message for sub-branch */}
      {!isOnHeadOffice && (
        <div className="flex p-[18px] border rounded-xl bg-background-info-subtle border-info-p60 gap-2">
          <i className="ri-error-warning-line text-[20px] leading-[20px] text-[#65B2E8] shrink-0"></i>
          <Typography variant="paragraph-medium" className="!text-text-tertiary !font-medium">
            สินค้าที่เพิ่มเข้าร้านค้า "ระดับสาขา" จะถูกเพิ่มไปที่ร้านค้า "สำนักงานใหญ่" อัตโนมัติ
          </Typography>
        </div>
      )}

      {/* Merchant checkbox list */}
      <div className="max-h-[60vh] overflow-y-auto mt-6">
        <Checkbox
          indeterminate={merchantIndeterminate}
          onChange={handleMerchantCheckAllChange}
          checked={merchantCheckAll}
        >
          ทุกสาขา
        </Checkbox>
        <br />
        <CheckboxGroup onChange={handleMerchantChange} value={selectedMerchants}>
          {(merchants || []).map((item, i) => (
            <Checkbox
              value={item.uuid}
              key={i}
              className="mb-4 w-full mt-4"
              disabled={item.merchantBranchType === 'HEAD_OFFICE'}
            >
              <div className="flex gap-2 align-center">
                <img
                  src={item.image || '/images/store/default.png'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <Typography variant="paragraph-small" className="!text-text-primary !font-normal">
                  {item?.merchantTranslations?.[0]?.name}{' '}
                  {item?.merchantBranchType === 'HEAD_OFFICE' ? 'สำนักงานใหญ่' : null}
                </Typography>
              </div>
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>
    </div>
  );
};

interface MerchantSelectionStepFooterProps {
  onConfirm: () => void;
}

/**
 * MerchantSelectionStepFooter - Footer for Step 2
 * Uses context for loading state and selected count
 *
 * @param {Object} props
 * @param {Function} props.onConfirm - Handler for confirm button (opens modal)
 */
export const MerchantSelectionStepFooter: React.FC<MerchantSelectionStepFooterProps> = ({ onConfirm }) => {
  const { selectedMerchants, isCheckingDuplicates } = useAddProductsContext();

  return (
    <div className="flex justify-end mt-4">
      <CustomButton
        onClick={onConfirm}
        disabled={selectedMerchants.length === 0}
        loading={isCheckingDuplicates}
      >
        เพิ่มสินค้าลง {selectedMerchants.length} สาขา
      </CustomButton>
    </div>
  );
};

export default MerchantSelectionStep;
