import Button from '@/components/Button';
import { EmptyStateComponent } from '@/components/EmptyState';
import Typography from '@/components/Typography';
import { Divider } from 'antd';

interface StepAddressInfoProps {
  addressInfoData: any;
  onEdit: () => void;
  onAdd: () => void;
  isDisabled: boolean;
}

const StepAddressInfo = ({
  addressInfoData,
  onEdit,
  onAdd,
  isDisabled,
}: StepAddressInfoProps) => {
  return (
    <div className="">
      <div className="p-4 bg-background-secondary rounded-t-xl border border-border-primary">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded flex items-center justify-center bg-primary-hover">
              <i className="ri-map-pin-line text-xl text-primary"></i>
            </div>
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-semibold"
            >
              ข้อมูลที่อยู่
            </Typography>
          </div>
          {addressInfoData && (
            <Button
              size="small"
              variant="ghost"
              icon={<i className="ri-edit-line"></i>}
              onClick={onEdit}
              disabled={isDisabled}
            >
              แก้ไข
            </Button>
          )}
        </div>
      </div>
      <div className="p-4 bg-background-primary rounded-b-xl border border-border-primary border-t-0 flex flex-col gap-4">
        {!addressInfoData ? (
          <EmptyStateComponent
            descriptionNode={
              <div className="flex flex-col items-center gap-1">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-primary"
                >
                  ยังไม่ได้เพิ่มที่อยู่
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quinary"
                >
                  เพิ่มที่อยู่ตามทะเบียนบ้าน หรือที่อยู่ปัจจุบัน
                </Typography>
                <Button variant="outlined" className="mt-2" onClick={onAdd}>
                  เพิ่มข้อมูลที่อยู่
                </Button>
              </div>
            }
          />
        ) : (
          <div className="flex flex-col gap-4 md:gap-6">
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-medium"
            >
              ที่อยู่ตามหนังสือรับรอง / ตามบัตรประชาชน
            </Typography>
            <div className="flex flex-col md:flex-row gap-4 md:gap-0">
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-primary !font-medium"
                >
                  ที่อยู่
                </Typography>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  {addressInfoData?.addressIdCard?.address || ''}
                </Typography>
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-primary !font-medium"
                >
                  อำเภอ/เขต
                </Typography>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  {addressInfoData?.addressIdCard?.districtName || ''}
                </Typography>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-0">
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-primary !font-medium"
                >
                  ตำบล/แขวง
                </Typography>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  {addressInfoData?.addressIdCard?.subDistrictName || ''}
                </Typography>
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-primary !font-medium"
                >
                  จังหวัด/เมือง
                </Typography>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  {addressInfoData?.addressIdCard?.provinceName || ''}
                </Typography>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-0">
              <div className="w-full md:w-1/2 flex flex-col gap-1">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-primary !font-medium"
                >
                  รหัสไปรษณีย์
                </Typography>
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  {addressInfoData?.addressIdCard?.zipcodeName || ''}
                </Typography>
              </div>
            </div>
            <Divider className="!my-0" />
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-medium"
            >
              ที่อยู่ปัจจุบัน
            </Typography>
            {addressInfoData?.addressCurrent?.isSameRegisteredAddress ? (
              <Typography variant="paragraph-small">
                ใช้ที่อยู่เดียวกับหนังสือรับรอง/ตามบัตรประชาชน
              </Typography>
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ที่อยู่
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressCurrent?.address || ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      อำเภอ/เขต
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressCurrent?.districtName || ''}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ตำบล/แขวง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressCurrent?.subDistrictName || ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      จังหวัด/เมือง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressCurrent?.provinceName || ''}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      รหัสไปรษณีย์
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressCurrent?.zipcodeName || ''}
                    </Typography>
                  </div>
                </div>
              </>
            )}
            <Divider className="!my-0" />
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-medium"
            >
              ที่อยู่สำหรับการออกใบกำกับภาษี
            </Typography>
            {addressInfoData?.addressTaxInvoice?.usedAddress === 'ID_CARD' ? (
              <Typography variant="paragraph-small">
                ใช้ที่อยู่เดียวกับหนังสือรับรอง/ตามบัตรประชาชน
              </Typography>
            ) : addressInfoData?.addressTaxInvoice?.usedAddress ===
              'CURRENT_ADDRESS' ? (
              <Typography variant="paragraph-small">
                ใช้ที่อยู่เดียวกับที่อยู่ปัจจุบัน
              </Typography>
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ที่อยู่
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressTaxInvoice?.address || ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      อำเภอ/เขต
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressTaxInvoice?.districtName || ''}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      ตำบล/แขวง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressTaxInvoice?.subDistrictName ||
                        ''}
                    </Typography>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      จังหวัด/เมือง
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressTaxInvoice?.provinceName || ''}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-primary !font-medium"
                    >
                      รหัสไปรษณีย์
                    </Typography>
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-tertiary"
                    >
                      {addressInfoData?.addressTaxInvoice?.zipcodeName || ''}
                    </Typography>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepAddressInfo;
