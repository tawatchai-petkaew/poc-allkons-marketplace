'use client';

import Typography from '@/components/Typography';
import { Upload, UploadFile, UploadProps, FormInstance, Divider, Image as AntdImage } from 'antd';
import { FC, useEffect, useState } from 'react';
import { RcFile } from 'antd/es/upload';
import './custom.css';
import Button from '@/components/Button';
import { useNotification } from '@/hooks/notification.hook';
import { deleteFileDraftOrganization, uploadFileDraftOrganization } from '@/api/organization.api';
import { DocumentType } from '@/constants/enum/document.enum';
import { useOrganizationKycStore } from '@/store/organization-kyc.store';
import { deleteFileUserKyc, uploadFileUserKyc } from '@/api/user.api';
import { useDataTestIdWithPath } from '@/utils/DataTestId/data-test-id.utils';
import { usePathname } from 'next/navigation';

const { Dragger } = Upload;

type FormType = {
  key: string;
  formInstance: FormInstance<unknown>;
};

interface UploadFileDraggerProps {
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
  showUploadList?: boolean;
  customFileList?: boolean;
  draftOrganizeId?: number;
  cisFileType: DocumentType;
  exampleSrc?: string;
  disabled?: boolean;
}

const UploadFileDragger: FC<UploadFileDraggerProps> = ({
  dataTestId,
  name,
  file,
  setFile,
  form,
  label,
  maxCount = 6,
  maxSize = 20,
  acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  acceptedExtensions = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls',
  description = 'PDF, DOC, DOCX, JPG, PNG, XLS, XLSX',
  required = false,
  className = '',
  showUploadList = false,
  customFileList = true,
  draftOrganizeId,
  cisFileType,
  exampleSrc,
  disabled = false,
}) => {
  const { notification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const { setIsUploadFileCis, isUploadFileCis } = useOrganizationKycStore();

  // Check if any file is currently uploading
  const isUploading = file?.some((f) => f.status === 'uploading');

  useEffect(() => {
    setIsUploadFileCis(isUploading || isLoading);
  }, [isUploading, isLoading, setIsUploadFileCis]);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'ri-file-pdf-line text-red-500';
      case 'doc':
      case 'docx':
        return 'ri-file-word-line text-blue-600';
      case 'xls':
      case 'xlsx':
        return 'ri-file-excel-line text-green-600';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'ri-image-line text-purple-500';
      default:
        return 'ri-file-line text-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const CustomFileList: FC<{ fileList: UploadFile[] }> = ({ fileList }) => {
    return (
      <div className="mt-4">
        {fileList.map((file) => {
          return (
            <div
              key={file.uid}
              className={`flex relative p-3 border ${
                file.status === 'error' ? 'border-error' : 'border-border-primary'
              }  rounded-lg mb-2 bg-background-secondary`}
            >
              <div className="flex w-[calc(100%_-_20px)] items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                  <i className={`${getFileIcon(file.name || '')} text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-secondary !font-medium truncate"
                  >
                    {file.name}
                  </Typography>
                  <div className="flex items-center gap-2 mt-1">
                    <Typography variant="paragraph-small" className="!text-text-quarternary">
                      {formatFileSize(file.size || 0)}
                    </Typography>
                    <Divider type="vertical" className="!mx-0" />
                    {file.status === 'done' && (
                      <Typography variant="paragraph-small" className="!text-success">
                        <i className="ri-checkbox-circle-line mr-1"></i>
                        สำเร็จ
                      </Typography>
                    )}
                    {file.status === 'error' && (
                      <Typography variant="paragraph-small" className="!text-error">
                        <i className="ri-error-warning-line mr-1"></i>
                        ล้มเหลว
                      </Typography>
                    )}
                    {file.status === 'uploading' && (
                      <Typography variant="paragraph-small" className="!text-text-quinary text-xs">
                        <i className="ri-upload-cloud-2-line mr-1"></i>
                        กำลังอัปโหลด
                      </Typography>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-1">
                <Button
                  variant="ghost"
                  color="neutral"
                  size="small"
                  disabled={disabled || file.status === 'uploading'}
                  icon={<i className="ri-delete-bin-6-line text-neutral-60"></i>}
                  onClick={async () => {
                    if (disabled) return;
                    try {
                      setIsLoading(true);
                      const documentIds = draftOrganizeId
                        ? file.response?.length > 0
                          ? [file.response[0].documentCisId]
                          : [file.uid]
                        : file.response?.data?.length > 0
                          ? [file.response.data[0].documentCisId]
                          : [file.uid];

                      const res = (
                        draftOrganizeId
                          ? await deleteFileDraftOrganization(Number(draftOrganizeId), documentIds)
                          : await deleteFileUserKyc(documentIds)
                      ) as { message?: string };
                      const result = res as { message?: string };
                      if (result.message === 'success' || result.message === 'Success') {
                        const currentFiles = fileList || [];
                        const updatedFiles = currentFiles.filter(
                          (f: UploadFile) => f.uid !== file.uid
                        );

                        const finalFiles = updatedFiles.length > 0 ? updatedFiles : [];
                        // Remove file from state

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
                      }
                    } catch (error) {
                      console.log(error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                />
                {file.status === 'error' && (
                  <Typography variant="paragraph-small" className="!text-error !font-medium">
                    ลองใหม่อีกครั้ง
                  </Typography>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleMultipleFileUpload = async (filesToUpload: RcFile[]) => {
    const currentFiles = file || [];

    const uploadFiles: UploadFile[] = filesToUpload.map((fileToUpload) => ({
      uid: fileToUpload.uid || Date.now().toString() + Math.random().toString(),
      name: fileToUpload.name,
      size: fileToUpload.size,
      type: fileToUpload.type,
      status: 'uploading',
      originFileObj: fileToUpload,
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

    const uploadPromises = uploadFiles.map(async (fileUpload) => {
      try {
        const formData = new FormData();
        formData.append('files', fileUpload.originFileObj as File);
        formData.append('documentType', cisFileType);
        if (!draftOrganizeId) {
          formData.append('attachType', 'VERIFY_DOCUMENT');
        }
        const response = (
          draftOrganizeId
            ? await uploadFileDraftOrganization(formData, Number(draftOrganizeId))
            : await uploadFileUserKyc(formData)
        ) as { url?: string };

        return {
          uid: fileUpload.uid,
          status: 'done' as const,
          response: response,
          url: (response as { url?: string })?.url || undefined,
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

      const hasFailedUpload = results.some((result) => result.status === 'error');

      if (hasFailedUpload) {
        notification.error({
          message: 'การอัปโหลดล้มเหลว',
          description: 'มีไฟล์บางไฟล์อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
          duration: 4,
          icon: <i className="ri-error-warning-line text-error"></i>,
        });

        setFile(currentFiles);

        if (form) {
          const { key, formInstance } = form;
          formInstance.setFieldValue(key, currentFiles);
        }

        return;
      }

      const updatedFilesWithResults = updatedFiles.map((f) => {
        const result = results.find((r) => r.uid === f.uid);
        if (result) {
          return {
            ...f,
            status: result.status,
            response: result.response,
            url: result.url,
            error: result.error as Error | unknown,
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

      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง',
        duration: 4,
        icon: <i className="ri-error-warning-line text-error"></i>,
      });

      setFile(currentFiles);

      if (form) {
        const { key, formInstance } = form;
        formInstance.setFieldValue(key, currentFiles);
      }
    }
  };

  const handleFileUpload = async (fileToUpload: RcFile) => {
    await handleMultipleFileUpload([fileToUpload]);
  };

  const onChange: UploadProps['onChange'] = ({ file: newFile }) => {
    if (newFile.status === 'removed') {
      const currentFiles = file || [];
      const updatedFiles = currentFiles.filter((f: UploadFile) => f.uid !== newFile.uid);

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
    }
  };

  const uploadProps: UploadProps = {
    multiple: true,
    maxCount,
    accept: acceptedExtensions,
    showUploadList,
    fileList: file || [],
    disabled: disabled || isUploading,
    beforeUpload: (uploadFile: RcFile, fileList: RcFile[]) => {
      if (disabled) {
        return Upload.LIST_IGNORE;
      }

      if (isUploading || isLoading) {
        notification.error({
          message: 'กรุณารอให้การอัปโหลดปัจจุบันเสร็จสิ้นก่อน',
          duration: 3,
          icon: <i className="ri-information-line text-error"></i>,
        });
        return Upload.LIST_IGNORE;
      }

      const currentFileCount = file?.length || 0;
      const totalFilesAfterUpload = currentFileCount + fileList.length;
      if (totalFilesAfterUpload > maxCount) {
        notification.error({
          message: `สามารถอัปโหลดได้สูงสุด ${maxCount} ไฟล์!`,
          duration: 4,
          icon: <i className="ri-information-line text-error"></i>,
        });
        return Upload.LIST_IGNORE;
      }

      const isDuplicate = file?.some((existingFile) => existingFile.name === uploadFile.name);
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

      const currentIndex = fileList.findIndex((f) => f.uid === uploadFile.uid);
      const isLastFile = currentIndex === fileList.length - 1;

      if (isLastFile && fileList.length > 1) {
        handleMultipleFileUpload(fileList);
      } else if (fileList.length === 1) {
        handleFileUpload(uploadFile);
      }

      return false;
    },
    onChange,
  };

  const [isVisbleImage, setIsVisibleImage] = useState<boolean>(false);
  const useAntImgDataTestId = useDataTestIdWithPath(usePathname(), 'ant-image', name, dataTestId);
  const useDraggerDataTestId = useDataTestIdWithPath(usePathname(), 'dragger', name, dataTestId);

  return (
    <div className={className}>
      {label && (
        <div className="mb-2 flex justify-between">
          <div>
            {label}
            {required && <span className="text-error ml-1 text-xs">*</span>}
          </div>
          {exampleSrc && (
            <>
              <Button
                name={`example-${name}`}
                size="small"
                onClick={() => {
                  setIsVisibleImage(true);
                }}
                className="!px-0"
                variant="link"
              >
                ดูตัวอย่าง
              </Button>
              <AntdImage
                data-testid={useAntImgDataTestId}
                wrapperClassName="!hidden"
                preview={{
                  visible: isVisbleImage,
                  src: exampleSrc,
                  onVisibleChange: (value) => {
                    setIsVisibleImage(value);
                  },
                }}
              />
            </>
          )}
        </div>
      )}
      <Dragger
        data-testid={useDraggerDataTestId}
        {...uploadProps}
        className={`custom-allkons-upload-file-dragger ${
          disabled || isUploading || isLoading || isUploadFileCis
            ? 'pointer-events-none opacity-60'
            : ''
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-white border border-border-primary rounded-lg flex items-center justify-center">
            {isUploading || isLoading || isUploadFileCis ? (
              <i className="ri-loader-4-line text-2xl text-icon-tertiary animate-spin"></i>
            ) : (
              <i className="ri-upload-cloud-2-line text-2xl text-icon-tertiary"></i>
            )}
          </div>
          <Typography variant="paragraph-small" className="!mb-1 !mt-3">
            <span className="text-button-tertiary font-semibold mr-2">
              {isUploading || isLoading ? 'กำลังอัปโหลด...' : 'คลิกเพื่ออัพโหลด'}
            </span>
            {(!isUploading || isLoading) && (
              <span className="text-text-tertiary">หรือ ลากแล้ววางไฟล์ที่นี่</span>
            )}
          </Typography>
          <Typography variant="paragraph-small" className="!text-text-placeholder">
            {isUploading || isLoading
              ? 'กรุณารอให้การอัปโหลดเสร็จสิ้น'
              : `${description} (สูงสุด ${maxSize}MB)`}
          </Typography>
        </div>
      </Dragger>

      {customFileList && file && file.length > 0 && <CustomFileList fileList={file} />}
    </div>
  );
};

export default UploadFileDragger;
