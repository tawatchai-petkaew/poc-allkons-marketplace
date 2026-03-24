import Typography from '@/components/Typography';
import { Upload, UploadFile, UploadProps, FormInstance } from 'antd';
import { FC, useEffect, useState } from 'react';
import { RcFile } from 'antd/es/upload';
import { useNotification } from '@/hooks/notification.hook';
import { DocumentType } from '@/common/enum/document.enum';
import { useOrganizationKycStore } from '@/store/organization-kyc.store';
import { deleteFileUserKyc, uploadFileUserKyc } from '@/common/api/customer-service/user.api';
import { uploadFile } from '@/common/api/customer-service/file-upload';
import { useDataTestIdWithPath } from '@/utils/DataTestId/data-test-id.utils';
import { usePathname } from 'next/navigation';

type FormType = {
  key: any;
  formInstance: FormInstance<any>;
};

interface UploadProfileProps {
  dataTestId?: string;
  name?: string;
  file: UploadFile[];
  setFile: (file: UploadFile[]) => void;
  form?: FormType;
  label?: string;
  maxCount?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  acceptedExtensions?: string;
  description?: string;
  required?: boolean;
  className?: string;
  cisFileType?: DocumentType;
  attachType?: string;
  disabled?: boolean;
}

const UploadProfile: FC<UploadProfileProps> = ({
  dataTestId,
  name,
  file,
  setFile,
  form,
  label,
  maxCount = 1,
  maxSize = 20,
  acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/bmp',
    'image/gif',
    'image/tiff',
    'image/heic',
  ],
  acceptedExtensions = '.jpg,.jpeg,.png,.bmp,.gif,.tiff,.tif,.heic',
  description = 'JPG, JPEG, PNG, BMP, GIF, TIFF, HEIC',
  required = false,
  className = '',
  cisFileType,
  attachType,
  disabled = false,
}) => {
  const useDataTestId = useDataTestIdWithPath(usePathname(), 'upload-profile', name, dataTestId);
  const { notification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const { setIsUploadFileCis, isUploadFileCis } = useOrganizationKycStore();

  // Check if any file is currently uploading
  const isUploading = file?.some((f) => f.status === 'uploading');

  useEffect(() => {
    setIsUploadFileCis(isUploading || isLoading);
  }, [isUploading, isLoading]);

  // Handle multiple files upload in parallel
  const handleMultipleFileUpload = async (filesToUpload: RcFile[]) => {
    const currentFiles = file || [];
    console.log('Starting upload for multiple files:', filesToUpload);
    // Create UploadFile objects for all files
    const uploadFiles: UploadFile[] = filesToUpload.map((fileToUpload) => ({
      uid: fileToUpload.uid || Date.now().toString() + Math.random().toString(),
      name: fileToUpload.name,
      size: fileToUpload.size,
      type: fileToUpload.type,
      status: 'uploading',
      originFileObj: fileToUpload,
      lastModified: fileToUpload.lastModified,
      lastModifiedDate: fileToUpload.lastModifiedDate,
    }));

    const updatedFiles = [...currentFiles, ...uploadFiles];
    setFile(updatedFiles);

    if (form) {
      const { key, formInstance } = form;
      formInstance.setFieldValue(key, updatedFiles);
      formInstance.setFields([
        {
          name: key,
          errors: [],
        },
      ]);
    }

    // Upload all files in parallel using Promise.all
    const uploadPromises = uploadFiles.map(async (fileUpload) => {
      try {
        const formData = new FormData();
        formData.append('file', fileUpload.originFileObj as File);
        formData.append('folderName', 'profile-pic');
        formData.append('isPublic', 'true');
        const response = await uploadFile(formData);
        const formDataCis = new FormData();
        if (attachType) {
          formDataCis.append('files', fileUpload.originFileObj as File);
          formDataCis.append('attachType', attachType);
        }
        const responseCis = await uploadFileUserKyc(formDataCis);
        return {
          uid: fileUpload.uid,
          status: 'done' as const,
          response: responseCis,
          url: response?.url || response?.data?.[0]?.url || undefined,
        };
      } catch (error) {
        console.error('Upload failed for:', fileUpload.name, error);
        return {
          uid: fileUpload.uid,
          status: 'error' as const,
          error: error,
        };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);

      // Check if any upload failed
      const hasFailedUpload = results.some(
        (result) => result.status === 'error'
      );

      if (hasFailedUpload) {
        // Show error notification
        notification.error({
          message: 'การอัปโหลดล้มเหลว',
          description: 'มีไฟล์บางไฟล์อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
          duration: 4,
          icon: <i className="ri-error-warning-line text-error"></i>,
        });

        // Remove failed files from the list, keep only the original files
        setFile(currentFiles);

        if (form) {
          const { key, formInstance } = form;
          formInstance.setFieldValue(key, currentFiles);
        }

        return; // Exit early without updating files
      }

      // Update all files with their final status (all successful)
      const updatedFilesWithResults = updatedFiles.map((f) => {
        const result = results.find((r) => r.uid === f.uid);
        if (result) {
          return {
            ...f,
            status: result.status,
            response: result.response,
            url: result.url,
            error: result.error,
          };
        }
        return f;
      });

      setFile(updatedFilesWithResults);

      if (form) {
        const { key, formInstance } = form;
        formInstance.setFieldValue(key, updatedFilesWithResults);
      }
    } catch (error) {
      console.error('Promise.all failed:', error);

      // Show error notification
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง',
        duration: 4,
        icon: <i className="ri-error-warning-line text-error"></i>,
      });

      // Revert to original file list
      setFile(currentFiles);

      if (form) {
        const { key, formInstance } = form;
        formInstance.setFieldValue(key, currentFiles);
      }
    }
  };

  // Handle single file upload (fallback)
  const handleFileUpload = async (fileToUpload: RcFile) => {
    await handleMultipleFileUpload([fileToUpload]);
  };

  const handleRemove = async (fileToRemove: UploadFile) => {
    try {
      setIsLoading(true);
      const documentIds = fileToRemove.response?.data?.documentCisId
        ? [fileToRemove.response.data.documentCisId]
        : [(fileToRemove as any).documentCisId];
      const res = await deleteFileUserKyc(documentIds);

      if (res.message === 'Success') {
        const currentFiles = file || [];
        const updatedFiles = currentFiles.filter(
          (f: UploadFile) => f.uid !== fileToRemove.uid
        );

        const finalFiles = updatedFiles.length > 0 ? updatedFiles : [];
        setFile(finalFiles);

        if (form) {
          const { key, formInstance } = form;
          formInstance.setFieldValue(key, finalFiles);

          if (!finalFiles || finalFiles.length === 0) {
            formInstance.setFields([
              {
                name: key,
                errors: [],
              },
            ]);
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete failed:', error);
      notification.error({
        message: 'ลบไฟล์ล้มเหลว',
        description: 'ไม่สามารถลบไฟล์ได้ กรุณาลองใหม่อีกครั้ง',
        duration: 3,
        icon: <i className="ri-error-warning-line text-error"></i>,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadButton = (
    <div className="bg-primary-subtle w-full h-full rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-primary-subtle-hover p-4">
      {isUploading || isLoading || isUploadFileCis ? (
        <i className="ri-loader-4-line text-[48px] text-primary-dark animate-spin"></i>
      ) : (
        <i className="ri-upload-cloud-2-line text-[48px] text-primary-dark"></i>
      )}
    </div>
  );

  const uploadProps: UploadProps = {
    listType: 'picture-circle',
    fileList: file || [],
    accept: acceptedExtensions,
    multiple: maxCount > 1,
    maxCount,
    className: 'upload-profile-picture',
    disabled: disabled || isUploading || isLoading || isUploadFileCis,
    onRemove: disabled ? undefined : handleRemove,
    beforeUpload: (uploadFile: RcFile, fileList: RcFile[]) => {
      // Check if disabled
      if (disabled) {
        return Upload.LIST_IGNORE;
      }

      // Check if any file is currently uploading
      if (isUploading || isLoading) {
        notification.error({
          message: 'กรุณารอให้การอัปโหลดปัจจุบันเสร็จสิ้นก่อน',
          duration: 3,
          icon: <i className="ri-information-line text-error"></i>,
        });
        return Upload.LIST_IGNORE;
      }

      // Check total count including current batch
      const currentFileCount = file?.length || 0;
      const totalFilesAfterUpload = currentFileCount + fileList.length;
      if (totalFilesAfterUpload > maxCount) {
        notification.error({
          message: `สามารถอัปโหลดได้สูงสุด ${maxCount} ไฟล์! กำลังพยายามอัปโหลด ${
            fileList.length
          } ไฟล์ แต่เหลือที่ว่างเพียง ${maxCount - currentFileCount} ไฟล์`,
          duration: 4,
          icon: <i className="ri-information-line text-error"></i>,
        });
        return Upload.LIST_IGNORE;
      }

      const isDuplicate = file?.some(
        (existingFile) => existingFile.name === uploadFile.name
      );
      if (isDuplicate) {
        notification.error({
          message: `ไฟล์ "${uploadFile.name}" มีอยู่แล้ว กรุณาเลือกไฟล์อื่น`,
          duration: 3,
          icon: <i className="ri-information-line text-error"></i>,
        });
        return Upload.LIST_IGNORE;
      }

      const isValidType = acceptedTypes.includes(uploadFile.type);
      if (!isValidType) {
        notification.error({
          message: `รองรับเฉพาะไฟล์ ${description} เท่านั้น!`,
          duration: 3,
          icon: <i className="ri-information-line text-error"></i>,
        });
        return Upload.LIST_IGNORE;
      }

      const isValidSize = uploadFile.size / 1024 / 1024 < maxSize + 0.1;
      if (!isValidSize) {
        notification.error({
          message: `ไม่รองรับไฟล์ขนาดเกิน ${maxSize} MB`,
          duration: 3,
          icon: <i className="ri-information-line text-error"></i>,
        });
        return Upload.LIST_IGNORE;
      }

      // Check if this is the last file in the current batch
      const currentIndex = fileList.findIndex((f) => f.uid === uploadFile.uid);
      const isLastFile = currentIndex === fileList.length - 1;

      if (isLastFile && fileList.length > 1) {
        // Process all files in parallel
        handleMultipleFileUpload(fileList);
      } else if (fileList.length === 1) {
        // Single file upload
        handleFileUpload(uploadFile);
      }

      return false;
    },
  };

  return (
    <div className={className}>
      {label && (
        <div className="mb-2">
          <Typography variant="paragraph-small" className="!font-medium">
            {label}
            {required && <span className="text-primary ml-1 text-xs">*</span>}
          </Typography>
        </div>
      )}

      <Upload {...uploadProps} data-testid={useDataTestId}>
        {(file?.length || 0) >= maxCount ? null : uploadButton}
      </Upload>
    </div>
  );
};

export default UploadProfile;
