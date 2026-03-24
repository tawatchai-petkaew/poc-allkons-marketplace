import React, { memo } from "react";
import { Input } from "antd";
import CustomButton from "@/components/Button";
import CustomTypography from "@/components/Typography";
import ResponsivePopup from "@/components/Popup";
import SelectField from "@/components/DataEntry/Select";
import styles from "./MatchingResultsDetails.module.css";

const { TextArea } = Input;

const REJECT_REASONS = [
  { label: "ข้อมูลชื่อสินค้าผิด", value: "ข้อมูลชื่อสินค้าผิด" },
  { label: "ข้อมูล barcode ผิด", value: "ข้อมูล barcode ผิด" },
  { label: "ข้อมูลแบรนด์ผิด", value: "ข้อมูลแบรนด์ผิด" },
  {
    label: "ไม่ใช่สินค้าที่ต้องการ (ขอสร้างสินค้าใหม่)",
    value: "ไม่ใช่สินค้าที่ต้องการ (ขอสร้างสินค้าใหม่)",
  },
  { label: "อื่นๆ โปรดระบุเหตุผล", value: "อื่นๆ โปรดระบุเหตุผล" },
];

interface ConfirmStats {
  importCount: number;
  notFoundCount: number;
  existingCount: number;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
  confirmStats: ConfirmStats;
  existingProductsList: string[];
  rejectReason: string | null;
  setRejectReason: (val: string) => void;
  otherReason: string;
  setOtherReason: (val: string) => void;
  showError: boolean;
  isReasonValid: boolean;
}

const ConfirmationModal = memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    isConfirming,
    confirmStats,
    existingProductsList,
    rejectReason,
    setRejectReason,
    otherReason,
    setOtherReason,
    showError,
    isReasonValid,
  }: ConfirmationModalProps) => {
    const renderTitle = (
      <div className="flex flex-col pt-2 pb-2 mb-4">
        <CustomTypography variant="h5" className="!m-0 !font-bold !text-text-primary">
          สรุปผลการยืนยันการนำเข้าสินค้า
        </CustomTypography>
        <CustomTypography variant="paragraph-extra-small" className="!text-text-quinery">
          รายการสินค้าที่มีในร้านค้า/สาขาจะถูกแก้ไขเป็นข้อมูลปัจจุบัน
        </CustomTypography>
      </div>
    );

    const renderFooter = (
      <div className="flex justify-end gap-3">
        <CustomButton
          variant="outlined"
          color="neutral"
          onClick={onClose}
          className="min-w-[120px]"
          dataTestId="btn-cancel-confirmation"
        >
          ยกเลิก
        </CustomButton>
        <CustomButton
          variant="solid"
          color="primary"
          onClick={onConfirm}
          className="min-w-[120px]"
          loading={isConfirming}
          disabled={isConfirming || !isReasonValid}
          dataTestId="btn-confirm-confirmation"
        >
          ยืนยัน
        </CustomButton>
      </div>
    );

    return (
      <ResponsivePopup
        visible={isOpen}
        onClose={onClose}
        modalTitle={renderTitle}
        footer={renderFooter}
        modalProps={{
          width: 800,
          centered: true,
          className: "custom-allkons rounded-2xl",
          closable: true,
        }}
      >
        <div className="flex flex-col gap-6">
          {/* Reason Section - Show only if there are items not found/rejected */}
          {confirmStats.notFoundCount > 0 && (
            <div className={`bg-white border border-gray-100 rounded-xl p-6 shadow-sm`}>
              <CustomTypography variant="h6" className="!m-0 !text-text-primary !font-bold mb-4">
                สินค้าที่ไม่นำเข้าร้านค้า/สาขา
              </CustomTypography>
              
              <div className="flex items-center gap-2 mb-6">
                <CustomTypography variant="paragraph-small" className="!text-text-secondary">จำนวนสินค้า :</CustomTypography>
                <div className={styles.matchingStatusNotFound}>
                  <CustomTypography variant="paragraph-small" className="!text-inherit">
                    {confirmStats.notFoundCount} รายการ
                  </CustomTypography>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <CustomTypography variant="paragraph-small-medium" className="block mb-2 !text-text-secondary">
                    เหตุผล <span className="text-error">*</span>
                  </CustomTypography>
                  <SelectField
                    placeholder="เลือกเหตุผล"
                    options={REJECT_REASONS}
                    value={rejectReason}
                    onChange={(val) => setRejectReason(String(val ?? ""))}
                    className="w-full h-10 rounded-lg"
                    dataTestId="select-reject-reason"
                  />
                </div>

                {rejectReason === "อื่นๆ โปรดระบุเหตุผล" && (
                  <div>
                    <CustomTypography variant="paragraph-small-medium" className="block mb-2 !text-text-secondary">
                      ระบุเหตุผลหรือข้อมูลเพิ่มเติม <span className="text-error">*</span>
                    </CustomTypography>
                    <TextArea
                      placeholder="ระบุเหตุผลหรือข้อมูลเพิ่มเติม"
                      rows={4}
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      status={
                        showError && !otherReason.trim() ? "error" : undefined
                      }
                      className="rounded-lg"
                      data-testid="textarea-other-reason"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 1: Existing Products List */}
          {existingProductsList.length > 0 && (
            <div className="flex flex-col gap-3">
              <CustomTypography variant="h6" className="!m-0 !text-text-primary !font-bold">
                สินค้านำเข้าร้านค้า/สาขา โดยการแก้ไขข้อมูล
              </CustomTypography>
              
              <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                  <CustomTypography variant="paragraph-small" className="!text-text-secondary">
                    จำนวนสินค้า {existingProductsList.length} รายการ
                  </CustomTypography>
                </div>
                <div className="bg-white max-h-[240px] overflow-y-auto px-6 font-medium">
                  {existingProductsList.map((name, index) => (
                    <div
                      key={index}
                      className="py-3 border-b border-gray-100 last:border-0"
                    >
                      <CustomTypography variant="paragraph-small" className="!text-text-secondary truncate block">
                        {name}
                      </CustomTypography>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="bg-[#fffbe6] border border-[#ffe58f] rounded-xl p-5 flex gap-3 items-start">
            <i className="ri-information-line text-[#faad14] text-xl" />
            <div className="text-xs">
              <CustomTypography variant="paragraph-small-semibold" className="mb-2 !text-text-primary">หมายเหตุ</CustomTypography>
              <div className="space-y-1.5 text-text-secondary font-medium pl-1">
                <div className="flex gap-1">
                  <span>1.</span>
                  <span>สินค้าที่ยืนยันตรงกับในระบบจะถูกเพิ่มเข้าสถานะของสินค้า ขายอยู่และไม่แสดง ของทางร้านค้า ตามสถานะสินค้าที่กำหนดไว้</span>
                </div>
                <div className="flex gap-1">
                  <span>2.</span>
                  <span>สินค้าที่ยืนยันพบตรงกับในระบบแต่มีอยู่ในร้านค้าจะไม่ถูกเพิ่มเข้าร้านค้าซ้ำ</span>
                </div>
                <div className="flex gap-1">
                  <span>3.</span>
                  <span>สินค้าที่ยืนยันไม่พบตรงกับในระบบ ร้านค้าสามารถดาวน์โหลด และหากต้องการเพิ่มสินค้า กรุณาติดต่อ <a href="https://allkons.com" target="_blank" rel="noreferrer" className="underline font-semibold text-[#00af43]">Allkons</a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePopup>
    );
  },
);

ConfirmationModal.displayName = "ConfirmationModal";

export default ConfirmationModal;
