'use client';

import React from 'react';
import { Upload, Divider, UploadFile, UploadProps } from 'antd';
import { RcFile } from 'antd/es/upload';
import Typography from '@/components/Typography';
import CustomButton from '@/components/Button';

const { Dragger } = Upload;

interface FileDraggerProps {
  file: UploadFile[];
  setFile: (file: UploadFile[]) => void;
  maxCount?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  description?: string;
  isVerifying?: boolean;
  onValidationError?: (error: { type: string; maxCount?: number; maxSize?: number }) => void;
  className?: string;
}

const FileDragger: React.FC<FileDraggerProps> = ({
  file,
  setFile,
  maxCount = 1,
  maxSize = 20,
  acceptedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  description = 'รองรับไฟล์ .xlsx หรือ .xls',
  isVerifying = false,
  onValidationError,
  className = '',
}) => {
  const isUploading = isVerifying || file.some((f) => f.status === 'uploading');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadProps: UploadProps = {
    multiple: false,
    maxCount,
    accept: '.xlsx,.xls',
    showUploadList: false,
    fileList: file,
    disabled: isUploading,
    beforeUpload: (uploadFile: RcFile) => {
      if (isUploading) {
        onValidationError?.({ type: 'VERIFYING' });
        return Upload.LIST_IGNORE;
      }

      if (file.length >= maxCount) {
        onValidationError?.({ type: 'MAX_COUNT', maxCount });
        return Upload.LIST_IGNORE;
      }

      const isValidType = acceptedTypes.includes(uploadFile.type);
      if (!isValidType) {
        onValidationError?.({ type: 'INVALID_TYPE' });
        return Upload.LIST_IGNORE;
      }

      const isValidSize = uploadFile.size / 1024 / 1024 < maxSize;
      if (!isValidSize) {
        onValidationError?.({ type: 'MAX_SIZE', maxSize });
        return Upload.LIST_IGNORE;
      }

      // Add file to list (manual mode since we verify later)
      const newFile: UploadFile = {
        uid: Date.now().toString(),
        name: uploadFile.name,
        size: uploadFile.size,
        type: uploadFile.type,
        status: 'done',
        originFileObj: uploadFile,
      };
      setFile([newFile]);

      return false; // Prevent automatic upload
    },
  };

  return (
    <div className={className}>
      <Dragger
        {...uploadProps}
        className={`!bg-white !border-dashed !border-border-primary hover:!border-primary rounded-xl transition-all duration-200 ${
          isUploading ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="w-10 h-10 bg-gray-50 border border-border-primary rounded-lg flex items-center justify-center mb-4 text-2xl text-icon-tertiary">
            {isUploading ? (
              <i className="ri-loader-4-line animate-spin"></i>
            ) : (
              <i className="ri-upload-cloud-2-line"></i>
            )}
          </div>
          <Typography variant="paragraph-small-regular" className="!mb-1">
            <span className="text-primary font-semibold mr-2">
              {isUploading ? 'กำลังตรวจสอบ...' : 'คลิกเพื่ออัปโหลด'}
            </span>
            {!isUploading && <span className="text-text-tertiary">หรือ ลากแล้ววางไฟล์ที่นี่</span>}
          </Typography>
          <Typography variant="paragraph-small-regular" className="!text-text-placeholder">
            {isUploading
              ? 'กรุณารอสักครู่ขณะระบบตรวจสอบข้อมูล'
              : `${description} (ขนาดไม่เกิน ${maxSize} MB)`}
          </Typography>
        </div>
      </Dragger>

      {file.length > 0 && (
        <div className="mt-4">
          {file.map((f) => (
            <div
              key={f.uid}
              className="flex justify-between items-center p-4 bg-gray-50 border border-border-primary rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl text-green-600">
                  <i className="ri-file-excel-2-fill"></i>
                </div>
                <div>
                  <Typography variant="paragraph-small" className="!font-medium !text-text-primary">
                    {f.name}
                  </Typography>
                  <Typography variant="paragraph-extra-small" className="!text-text-quarternary">
                    {formatFileSize(f.size || 0)}
                  </Typography>
                </div>
              </div>
              <CustomButton
                variant="ghost"
                color="neutral"
                size="small"
                disabled={isUploading}
                onClick={() => setFile([])}
                icon={<i className="ri-delete-bin-line text-lg"></i>}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileDragger;
