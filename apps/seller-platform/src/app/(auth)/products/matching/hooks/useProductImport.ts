'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useNotification } from '@/hooks/useNotification';
import {
  downloadImportProductTemplate,
  uploadProductImportFile,
  startMatchingProducts,
} from '@/api/import-product.api';
import type { IImportProductResponseUploadExtract } from '@/interfaces/product/import-product.response.interface';
import type { ApiResponse } from '@/types/common.type';
import { UploadFile } from 'antd';

type ErrorMessageConfig = {
  message: string;
  description: string;
};

type ErrorMessageFactory = (value: number) => ErrorMessageConfig;

export const useProductImport = (onClose: () => void) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [step, setStep] = useState(1);
  const [uploadResult, setUploadResult] = useState<IImportProductResponseUploadExtract | null>(
    null
  );
  const { notification } = useNotification();

  const errorMessages: Record<string, ErrorMessageConfig | ErrorMessageFactory> = useMemo(
    () => ({
      MAX_COUNT: (maxCount: number): ErrorMessageConfig => ({
        message: 'จำนวนไฟล์เกินกำหนด',
        description: `รองรับการนำเข้ารอบละ ${maxCount} ไฟล์`,
      }),
      INVALID_TYPE: {
        message: 'ไม่รองรับไฟล์ประเภทนี้',
        description: 'รองรับเฉพาะไฟล์ .xlsx หรือ .xls',
      } as ErrorMessageConfig,
      MAX_SIZE: (maxSize: number): ErrorMessageConfig => ({
        message: 'ขนาดไฟล์เกินกำหนด',
        description: `รองรับขนาดไฟล์ไม่เกิน ${maxSize} MB`,
      }),
      VERIFYING: {
        message: 'กรุณารอสักครู่',
        description: 'กำลังตรวจสอบข้อมูล กรุณารอให้การตรวจสอบเสร็จสิ้นก่อนอัปโหลดไฟล์ใหม่',
      } as ErrorMessageConfig,
    }),
    []
  );

  const {
    mutate: uploadFile,
    isPending: isUploading,
    reset: resetUpload,
  } = useMutation({
    mutationFn: uploadProductImportFile,
    onSuccess: (data) => {
      setUploadResult(data.data);
      setStep(2);
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorData = axiosError?.response?.data;
      notification.error({
        message: 'เกิดข้อผิดพลาดในการอัปโหลด',
        description: 'โปรดลองใหม่อีกครั้ง',
        duration: 3,
      });
    },
  });

  const { mutate: downloadTemplate, isPending: isDownloadingTemplate } = useMutation({
    mutationFn: downloadImportProductTemplate,
    onSuccess: () => {
      notification.success({
        message: 'ดาวน์โหลดเทมเพลตสำเร็จ',
        duration: 3,
      });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorData = axiosError?.response?.data;
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'โปรดลองใหม่อีกครั้ง',
        duration: 3,
      });
    },
  });

  const { mutate: startMatching, isPending: isStartingMatching } = useMutation({
    mutationFn: startMatchingProducts,
    onSuccess: () => {
      notification.success({
        message: 'เริ่มการจับคู่สินค้าสำเร็จ',
        description: 'ระบบกำลังดำเนินการจับคู่สินค้า กรุณารอสักครู่',
        duration: 3,
      });
      resetAllState();
      onClose();
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorData = axiosError?.response?.data;
      notification.error({
        message: errorData?.message || 'เกิดข้อผิดพลาดในการเริ่มจับคู่',
        description: 'โปรดลองใหม่อีกครั้ง',
        duration: 3,
      });
    },
  });

  const resetAllState = useCallback(() => {
    setFiles([]);
    setStep(1);
    setUploadResult(null);
    resetUpload();
  }, [resetUpload]);

  const handleDownloadTemplate = useCallback(() => {
    downloadTemplate();
  }, [downloadTemplate]);

  const handleVerify = useCallback(
    (e?: React.MouseEvent | React.FormEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (files.length === 0 || isUploading) return;
      const storedFile = files[0].originFileObj ?? (files[0] as unknown as File);
      const formData = new FormData();
      formData.append('file', storedFile);
      uploadFile(formData);
    },
    [files, uploadFile, isUploading]
  );

  const handleDownloadError = useCallback(() => {
    if (uploadResult?.resultFileUrl) {
      const link = document.createElement('a');
      link.href = uploadResult.resultFileUrl;
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();

      notification.success({
        message: 'บันทึกสำเร็จ',
        duration: 3,
      });
    }
  }, [uploadResult, notification]);

  const handleClose = useCallback(() => {
    resetAllState();
    onClose();
  }, [resetAllState, onClose]);

  const handleImportSuccess = useCallback(() => {
    if (!uploadResult?.batchUuid) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่พบข้อมูล Batch UUID',
        duration: 3,
      });
      return;
    }

    startMatching(uploadResult.batchUuid);
  }, [uploadResult, startMatching, notification]);

  const handleValidationError = useCallback(
    (error: { type: string; maxCount?: number; maxSize?: number }) => {
      const errorConfig = errorMessages[error.type];
      if (!errorConfig) return;

      const config =
        typeof errorConfig === 'function'
          ? errorConfig(error.maxCount ?? error.maxSize ?? 0)
          : errorConfig;

      notification.error({
        ...config,
        duration: 3,
      });
    },
    [notification, errorMessages]
  );

  const canVerify = useMemo(() => files.length > 0 && !isUploading, [files.length, isUploading]);

  const passCount = useMemo(() => uploadResult?.result?.pass || 0, [uploadResult?.result?.pass]);

  const failCount = useMemo(() => uploadResult?.result?.fail || 0, [uploadResult?.result?.fail]);

  const hasErrors = useMemo(() => failCount > 0, [failCount]);

  return {
    files,
    setFiles,
    step,
    setStep,
    uploadResult,
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
  };
};
