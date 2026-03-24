'use client';

import React, { useMemo } from 'react';
import ResponsivePopup from '@/components/Popup';
import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import BadgeLabel from '@/components/BadgeLabel';
import { useProductImport } from '../hooks/useProductImport';
import FileDragger from './FileDragger';

interface ImportProductModalProps {
  visible: boolean;
  onClose: () => void;
}

const ImportProductModal: React.FC<ImportProductModalProps> = ({ visible, onClose }) => {
  const {
    files,
    setFiles,
    step,
    setStep,
    isUploading,
    isDownloadingTemplate,
    isStartingMatching,
    canVerify,
    passCount,
    failCount,
    hasErrors,
    handleDownloadTemplate,
    handleVerify,
    handleDownloadError,
    handleClose,
    handleImportSuccess,
    handleValidationError,
  } = useProductImport(onClose);

  const acceptedTypes = useMemo(
    () => [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    []
  );

  const titlePopup = (
    <div className="flex flex-col gap-1">
      <Typography variant="h5" className="!font-bold !text-text-primary">
        นำเข้าสินค้าด้วยไฟล์ Excel
      </Typography>
      <Typography variant="paragraph-small" className="!text-text-tertiary">
        อัปโหลดไฟล์ Excel เพื่อเพิ่มหรืออัปเดตรายการสินค้าในร้านของคุณ
      </Typography>
    </div>
  );

  const footerPopup = (
    <div className="flex justify-between items-center">
      <CustomButton
        variant="outlined"
        color="neutral"
        onClick={step === 1 ? handleClose : () => setStep(1)}
        className="min-w-[120px]"
        icon={step === 2 ? <i className="ri-arrow-left-line" /> : undefined}
        dataTestId={step === 1 ? 'btn-cancel-import' : 'btn-back-step'}
      >
        {step === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
      </CustomButton>

      {step === 1 ? (
        <CustomButton
          variant="solid"
          color="primary"
          disabled={!canVerify}
          loading={isUploading}
          onClick={() => handleVerify()}
          className="min-w-[140px]"
          iconPosition="end"
          icon={!isUploading ? <i className="ri-arrow-right-line" /> : undefined}
          dataTestId="btn-verify-data"
        >
          ตรวจสอบข้อมูล
        </CustomButton>
      ) : (
        <CustomButton
          variant="solid"
          color="primary"
          onClick={handleImportSuccess}
          loading={isStartingMatching}
          disabled={isStartingMatching || passCount === 0}
          className="min-w-[140px]"
          dataTestId="btn-start-matching"
        >
          เริ่มจับคู่สินค้า
        </CustomButton>
      )}
    </div>
  );

  return (
    <ResponsivePopup
      visible={visible}
      onClose={handleClose}
      modalProps={{
        width: 960,
        className: '!rounded-2xl overflow-hidden',
        styles: {
          content: {
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            height: 'calc(100vh - 32px)',
            maxHeight: '800px',
          },
          body: {
            flex: 1,
            overflowY: 'auto',
          },
        },
      }}
      drawerProps={{
        styles: {
          content: { height: 'calc(100vh - 32px)', maxHeight: '800px', padding: 24 },
          header: {
            padding: 0,
            borderBottom: 0,
          },
          body: {
            padding: 0,
          },
          footer: {
            padding: 0,
            borderTop: 0,
          },
        },
      }}
      drawerTitle={titlePopup}
      modalTitle={titlePopup}
      drawerClosable={true}
      footer={footerPopup}
    >
      <div className="flex flex-col gap-8 justify-between min-h-[450px] mt-6">
        {/* Info Box */}
        <div className="bg-[#F0F7FF] border border-[#BAE0FF] rounded-lg p-4 flex gap-2">
          <i className="ri-information-line text-[#65B2E8] text-2xl shrink-0 -mt-0.5" />
          <div className="flex flex-col gap-1">
            <Typography
              variant="paragraph-middle-medium"
              className="!font-semibold !text-text-primary"
            >
              ขั้นตอนการเพิ่มสินค้า
            </Typography>
            <ol className="list-decimal list-inside !text-text-secondary !text-sm space-y-1 font-normal">
              <li>ดาวน์โหลดเทมเพลตที่ระบบกำหนด และเพิ่มข้อมูลสินค้า แล้วอัปโหลดไฟล์</li>
              <li>รอระบบดำเนินการจับคู่ แล้วตรวจสอบผลลัพธ์การจับคู่</li>
              <li>ยืนยันข้อมูลผลลัพธ์การจับคู่ แล้วนำเข้าสินค้า</li>
            </ol>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 flex-wrap">
              <Typography variant="paragraph-middle-medium" className="!text-text-primary">
                {step === 1 ? 'อัปโหลดไฟล์ Excel รายการสินค้า' : 'ตรวจสอบผลลัพธ์รายการสินค้า'}
              </Typography>
              <div className="px-2 py-[2px] bg-[#F5F5F5] border border-[#D9D9D9] rounded-full text-neutral-60 font-medium">
                <Typography variant="paragraph-extra-small-regular">
                  {step === 1 ? 'ขั้นตอนที่ 1/2' : 'ขั้นตอนที่ 2/2'}
                </Typography>
              </div>
            </div>

            {step === 1 && (
              <CustomButton
                variant="outlined"
                color="primary"
                onClick={handleDownloadTemplate}
                loading={isDownloadingTemplate}
                icon={
                  !isDownloadingTemplate ? (
                    <i className="ri-file-excel-2-line text-lg" />
                  ) : undefined
                }
                size="middle"
                dataTestId="btn-download-template"
              >
                Download Template
              </CustomButton>
            )}
          </div>

          <div className="flex-1">
            {step === 1 ? (
              <FileDragger
                file={files}
                setFile={setFiles}
                maxCount={1}
                maxSize={20}
                acceptedTypes={acceptedTypes}
                onValidationError={handleValidationError}
                isVerifying={isUploading}
                className="w-full h-full"
              />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-background-secondary rounded-lg py-6 px-4 flex items-center gap-6">
                  <Typography variant="paragraph-medium" className="!text-text-secondary w-[140px]">
                    จำนวนข้อมูลที่ผ่าน
                  </Typography>
                  <BadgeLabel
                    text={`${passCount} รายการ`}
                    color="success"
                    variant="ghost"
                    rounding="pill"
                    icon={<i className="ri-checkbox-circle-line !text-success"></i>}
                  />
                </div>
                <div className="bg-background-secondary rounded-lg py-6 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Typography
                      variant="paragraph-medium"
                      className="!text-text-secondary w-[140px]"
                    >
                      จำนวนข้อมูลที่ไม่ผ่าน
                    </Typography>
                    <BadgeLabel
                      text={`${failCount} รายการ`}
                      color="error"
                      variant="ghost"
                      rounding="pill"
                      icon={<i className="ri-close-circle-line !text-error"></i>}
                    />
                  </div>
                  {hasErrors && (
                    <CustomButton
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={handleDownloadError}
                      icon={<i className="ri-file-close-line text-md text-error" />}
                      dataTestId="btn-download-error"
                    >
                      ดาวน์โหลดข้อผิดพลาด
                    </CustomButton>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsivePopup>
  );
};

export default ImportProductModal;
