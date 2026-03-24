'use client';

import {
  approveKycOrgnization,
  getDraftOrganization,
  IReqDraftOrganization,
  saveDraftOrganization,
} from '@/api/organization.api';
import { juristicTypeList } from '@/constants/organization';
import { KycOrganizationStatus, OrganizationTypes } from '@/constants/enum/organization.enum';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import { useNotification } from '@/hooks/notification.hook';
import { useConfirmPopup } from '@/hooks/useConfirmPopup';
import usePopup from '@/hooks/usePopup';
import { useUserStore } from '@/store/user.store';
import { LoadingOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Grid, Spin } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { FC, useEffect, useMemo, useState } from 'react';
import FormDraftAddressInfo from '../organize-management/components/Form/FormDraftAddressInfo';
import FormDraftContactInfo from '../organize-management/components/Form/FormDraftContactInfo';
import FormDraftFileInfo from '../organize-management/components/Form/FormDraftFileInfo';
import FormDraftOrgInfo from '../organize-management/components/Form/FormDraftOrgInfo';

const steps = [
  {
    id: 1,
    title: 'ข้อมูลเกี่ยวกับองค์กร',
  },
  {
    id: 2,
    title: 'ข้อมูลผู้ติดต่อ',
  },
  {
    id: 3,
    title: 'ข้อมูลที่อยู่',
  },
  {
    id: 4,
    title: 'เอกสารยืนยันตัวตน',
  },
];

const OrganizationVerifyDetailPage: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const params = useParams();
  const organizeId = params?.id;
  const {
    data,
    isLoading: loadingOrganize,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['draft-organization', organizeId],
    queryFn: () => getDraftOrganization(Number(organizeId)),
    enabled: !!organizeId,
  });
  const { sm } = Grid.useBreakpoint();
  const { showPopup, PopupComponent } = usePopup();
  const { notification } = useNotification();
  const { showConfirm, confirmPopup } = useConfirmPopup();
  const isMobile = !sm;
  const { user } = useUserStore();
  const { orgInfo, contactInfo, addressInfo, fileInfo } = data?.data || {};
  const orgInfoData = orgInfo ? JSON.parse(orgInfo || '{}') : null;
  const contactInfoData = contactInfo ? JSON.parse(contactInfo || '{}') : null;
  const addressInfoData = addressInfo ? JSON.parse(addressInfo || '{}') : null;
  const fileInfoData = fileInfo ? JSON.parse(fileInfo || '{}') : null;

  const [orgInfoValue, setOrgInfoValue] = useState<any>(null);
  const [contactInfoValue, setContactInfoValue] = useState<any>(null);
  const [addressInfoValue, setAddressInfoValue] = useState<any>(null);

  const [setUserForm] = Form.useForm();
  const [contactInfoForm] = Form.useForm();
  const [addressInfoForm] = Form.useForm();
  const [fileInfoForm] = Form.useForm();

  // Function to map only response data from file upload values
  const mapFileResponseData = (fileValues: any) => {
    const mappedData: any = {};

    Object.keys(fileValues).forEach((key) => {
      if (Array.isArray(fileValues[key])) {
        mappedData[key] = fileValues[key]
          .map((file: any) => {
            // If file has response object, extract it
            if (file.response) {
              return file.response;
            }
            // If file already has documentCisId (already saved file), return clean format
            if (file.documentCisId) {
              return {
                documentCisId: file.documentCisId,
                fileName: file.fileName,
                fileType: file.fileType,
                filePath: file.filePath,
                fileSize: file.fileSize,
              };
            }
            // Fallback
            return file;
          })
          .flat(); // Flatten any nested arrays
      }
    });

    return mappedData;
  };

  const { mutate: handleSaveDraft, isPending: isLoadingSaveDraft } = useMutation({
    mutationFn: ({
      payload,
      draftOrganizationId,
    }: {
      payload: IReqDraftOrganization;
      draftOrganizationId: number;
    }) => saveDraftOrganization(payload, draftOrganizationId),
    onSuccess: () => {
      notification.success({
        message: 'บันทึกแบบร่างสำเร็จ',
        duration: 3,
        icon: <i className="ri-information-line text-primary"></i>,
      });
      refetch();
    },
    onError: () => {
      showPopup('error', {
        statusCode: 500,
      });
    },
  });

  const { mutate: handleSaveDraftToApprove, isPending: isLoadingSaveDraftApprove } = useMutation({
    mutationFn: ({
      payload,
      draftOrganizationId,
    }: {
      payload: IReqDraftOrganization;
      draftOrganizationId: number;
    }) => saveDraftOrganization(payload, draftOrganizationId),
    onSuccess: () => {
      handleApproveKyc(Number(data?.data?.id));
    },
    onError: () => {
      showPopup('error', {
        statusCode: 500,
      });
    },
  });

  const { mutate: handleApproveKyc, isPending: isLoadingApproveKyc } = useMutation({
    mutationFn: (draftOrganizeId: number) => approveKycOrgnization(draftOrganizeId),
    onSuccess: () => {
      notification.success({
        message: 'ส่งคำขออนุมัติการยืนยันตัวตนสำเร็จ',
        duration: 3,
        icon: <i className="ri-information-line text-primary"></i>,
      });
      queryClient.invalidateQueries({ queryKey: ['draft-organization', String(organizeId)] });
      router.push(`/organizations/${organizeId}`);
    },
    onError: () => {
      showPopup('error', {
        statusCode: 500,
      });
    },
  });

  useEffect(() => {
    // step 1
    setUserForm.setFieldsValue({
      ...orgInfoData,
      otherMainPhoneNumber: orgInfoData?.otherMainPhoneNumber || '',
      branchType: orgInfoData?.branchType || 'HEAD_OFFICE',
      branchNumber: orgInfoData?.branchNumber || '00000',
      branchName:
        orgInfoData?.branchName === 'HEAD_OFFICE' || orgInfoData?.branchNumber === '00000'
          ? 'สำนักงานใหญ่'
          : orgInfoData?.branchName === 'BRANCH'
            ? 'สาขา'
            : orgInfoData?.branchName || '',
      juristicTypeId: juristicTypeList?.find((item: any) => item.id === orgInfoData?.juristicTypeId)
        ?.id,
      juristicTypeName: juristicTypeList?.find(
        (item: any) => item.id === orgInfoData?.juristicTypeId
      )?.value,
      commercialName: orgInfoData?.commercialName
        ? orgInfoData?.commercialName
        : `${user?.user?.firstNameTh} ${user?.user?.lastNameTh}`,
      originalJuristic:
        orgInfoData?.juristicType === OrganizationTypes.JURISTIC
          ? orgInfoData?.originalJuristic?.taxId !== orgInfoData?.taxId &&
            orgInfoData?.originalJuristic?.taxId
            ? { ...orgInfoData.originalJuristic }
            : { ...orgInfoData }
          : null,
      originalIdCard:
        orgInfoData?.juristicType === OrganizationTypes.PERSONAL
          ? orgInfoData?.originalIdCard !== orgInfoData?.idCard && orgInfoData?.originalIdCard
            ? orgInfoData?.originalIdCard
            : orgInfoData?.idCard
          : null,
      originalRegistrationNumber:
        orgInfoData?.juristicType === OrganizationTypes.REGISTERED_INDIVIDUAL
          ? orgInfoData?.originalRegistrationNumber !== orgInfoData?.registrationNumber &&
            orgInfoData?.originalRegistrationNumber
            ? orgInfoData?.originalRegistrationNumber
            : orgInfoData?.registrationNumber
          : null,
    });
    // step 2
    contactInfoForm.setFieldsValue({
      highestAuthorityName: contactInfoData?.highestAuthority?.highestAuthorityName || '',
      highestAuthorityPosition: contactInfoData?.highestAuthority?.highestAuthorityPosition || '',
      highestAuthorityPhoneNumber:
        contactInfoData?.highestAuthority?.highestAuthorityPhoneNumber || '',
      highestAuthorityEmail: contactInfoData?.highestAuthority?.highestAuthorityEmail || '',
      contactName: contactInfoData?.contact?.contactName || '',
      contactPhoneNumber: contactInfoData?.contact?.contactPhoneNumber || '',
      contactEmail: contactInfoData?.contact?.contactEmail || '',
      contactShownHighestAuthority: contactInfoData?.contactShownHighestAuthority || false,
    });
    // step 3
    addressInfoForm.setFieldsValue({
      registeredAddress: {
        ...addressInfoData?.addressIdCard,
      },
      currentAddress: {
        ...addressInfoData?.addressCurrent,
      },
      taxAddress: {
        ...addressInfoData?.addressTaxInvoice,
      },
    });
    // step 4
    fileInfoForm.setFieldsValue({
      ...fileInfoData,
    });
  }, [orgInfoData, contactInfoData, addressInfoData, fileInfoData, isLoadingSaveDraft, data]);

  useEffect(() => {
    if (!orgInfoValue) return;
    setUserForm.setFieldsValue({
      ...orgInfoValue,
      otherMainPhoneNumber: orgInfoValue?.otherMainPhoneNumber || '',
      branchType: orgInfoValue?.branchType || 'HEAD_OFFICE',
      branchNumber: orgInfoValue?.branchNumber || '00000',
      juristicTypeId: juristicTypeList?.find(
        (item: any) => item.id === orgInfoValue?.juristicTypeId
      )?.id,
      juristicTypeName: juristicTypeList?.find(
        (item: any) => item.id === orgInfoValue?.juristicTypeId
      )?.value,
      originalJuristic:
        orgInfoValue?.juristicType === OrganizationTypes.JURISTIC
          ? orgInfoValue?.originalJuristic?.taxId !== orgInfoValue?.taxId &&
            orgInfoValue?.originalJuristic
            ? { ...orgInfoValue.originalJuristic }
            : { ...orgInfoValue }
          : null,
      originalIdCard:
        orgInfoValue?.juristicType === OrganizationTypes.PERSONAL
          ? orgInfoValue?.originalIdCard !== orgInfoValue?.idCard && orgInfoValue?.originalIdCard
            ? orgInfoValue?.originalIdCard
            : orgInfoValue?.idCard
          : null,
      originalRegistrationNumber:
        orgInfoValue?.juristicType === OrganizationTypes.REGISTERED_INDIVIDUAL
          ? orgInfoValue?.originalRegistrationNumber !== orgInfoValue?.registrationNumber &&
            orgInfoValue?.originalRegistrationNumber
            ? orgInfoValue?.originalRegistrationNumber
            : orgInfoValue?.registrationNumber
          : null,
    });
  }, [orgInfoValue, currentStep]);

  useEffect(() => {
    if (!contactInfoValue) return;
    contactInfoForm.setFieldsValue({
      highestAuthorityName: contactInfoValue?.highestAuthority?.highestAuthorityName || '',
      highestAuthorityPosition: contactInfoValue?.highestAuthority?.highestAuthorityPosition || '',
      highestAuthorityPhoneNumber:
        contactInfoValue?.highestAuthority?.highestAuthorityPhoneNumber || '',
      highestAuthorityEmail: contactInfoValue?.highestAuthority?.highestAuthorityEmail || '',
      contactName: contactInfoValue?.contact?.contactName || '',
      contactPhoneNumber: contactInfoValue?.contact?.contactPhoneNumber || '',
      contactEmail: contactInfoValue?.contact?.contactEmail || '',
      contactShownHighestAuthority: contactInfoValue?.contactShownHighestAuthority || false,
    });
  }, [contactInfoValue, currentStep]);

  useEffect(() => {
    if (!addressInfoValue) return;
    addressInfoForm.setFieldsValue({
      registeredAddress: {
        ...addressInfoValue?.addressIdCard,
      },
      currentAddress: {
        ...addressInfoValue?.addressCurrent,
      },
      taxAddress: {
        ...addressInfoValue?.addressTaxInvoice,
      },
    });
  }, [addressInfoValue, currentStep]);

  useEffect(() => {
    // Skip if still loading
    if (loadingOrganize || isFetching) return;

    // Check if fileInfoData has any data
    if (!fileInfoData || Object.keys(fileInfoData).length === 0) return;

    fileInfoForm.setFieldsValue({
      ...fileInfoData,
    });
  }, [fileInfoData, currentStep, loadingOrganize, isFetching, fileInfoForm]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  // Organization Info handlers
  const handleOrgInfoFinish = (val: any) => {
    const payload = {
      businessType: val.businessType || [],
      juristicType: val.juristicType || null,
      mainPhoneNumber: val.mainPhoneNumber || null,
      mainEmail: val.mainEmail || null,
      idCard: val.idCard || null,
      organizeName: val.organizeName || null,
      commercialName: val.commercialName || null,
      registrationNumber: val.registrationNumber || null,
      isUseFullName: val.isUseFullName || null,
      taxId: val.taxId || null,
      type: val.type || null,
      branchNumber: val.branchNumber || null,
      juristicTypeId:
        juristicTypeList?.find((item: any) => item.id === val.juristicTypeId)?.id || null,
      branchName: val.branchName || null,
      otherMainPhoneNumber: val.otherMainPhoneNumber || null,
      originalJuristic: val.originalJuristic || null,
      originalIdCard: val.originalIdCard || null,
      originalRegistrationNumber: val.originalRegistrationNumber || null,
      branchType: val.branchType || null,
      remarkTypeOther: val.remarkTypeOther || null,
    };
    setOrgInfoValue(payload);
    setCurrentStep(2);
  };

  const handleOrgInfoSaveDraft = () => {
    const formValues = setUserForm.getFieldsValue();
    if (!data?.data) return;
    handleSaveDraft({
      payload: {
        organizationType: data.data.organizationType || '',
        orgInfo: JSON.stringify(formValues),
        contactInfo: data.data.contactInfo || 'null',
        addressInfo: data.data.addressInfo || 'null',
        taxInfo: data.data.taxInfo || 'null',
        fileInfo: data.data.fileInfo || 'null',
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data.data.id),
    });
  };

  // Contact Info handlers
  const handleContactInfoFinish = (val: any) => {
    const payload = {
      highestAuthority: {
        highestAuthorityName: val.highestAuthorityName,
        highestAuthorityPosition: val.highestAuthorityPosition,
        highestAuthorityPhoneNumber: val.highestAuthorityPhoneNumber,
        highestAuthorityEmail: val.highestAuthorityEmail,
      },
      contact: {
        contactName: val.contactShownHighestAuthority ? val.highestAuthorityName : val.contactName,
        contactPhoneNumber: val.contactShownHighestAuthority
          ? val.highestAuthorityPhoneNumber
          : val.contactPhoneNumber,
        contactEmail: val.contactShownHighestAuthority
          ? val.highestAuthorityEmail
          : val.contactEmail,
      },
      contactShownHighestAuthority: val.contactShownHighestAuthority,
    };
    setContactInfoValue(payload);
    setCurrentStep(3);
  };

  const handleContactInfoSaveDraft = () => {
    const formValues = contactInfoForm.getFieldsValue();
    const payload = {
      highestAuthority: {
        highestAuthorityName: formValues.highestAuthorityName,
        highestAuthorityPosition: formValues.highestAuthorityPosition,
        highestAuthorityPhoneNumber: formValues.highestAuthorityPhoneNumber,
        highestAuthorityEmail: formValues.highestAuthorityEmail,
      },
      contact: {
        contactName: formValues.contactShownHighestAuthority
          ? formValues.highestAuthorityName
          : formValues.contactName,
        contactPhoneNumber: formValues.contactShownHighestAuthority
          ? formValues.highestAuthorityPhoneNumber
          : formValues.contactPhoneNumber,
        contactEmail: formValues.contactShownHighestAuthority
          ? formValues.highestAuthorityEmail
          : formValues.contactEmail,
      },
      contactShownHighestAuthority: formValues.contactShownHighestAuthority,
    };
    if (!data?.data) return;
    handleSaveDraft({
      payload: {
        organizationType: data.data.organizationType || '',
        orgInfo: JSON.stringify(orgInfoValue) || data.data.orgInfo || '',
        contactInfo: JSON.stringify(payload),
        addressInfo: data.data.addressInfo || 'null',
        taxInfo: data.data.taxInfo || 'null',
        fileInfo: data.data.fileInfo || 'null',
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data.data.id) || 0,
    });
  };

  // Address Info handlers
  const handleAddressInfoFinish = (val: any) => {
    const payload = {
      addressIdCard: {
        ...val.registeredAddress,
      },
      addressCurrent: {
        ...val.currentAddress,
        ...(val.currentAddress.isSameRegisteredAddress ? val.registeredAddress : {}),
      },
      addressTaxInvoice: {
        ...val.taxAddress,
        ...(val.taxAddress.usedAddress === 'ID_CARD'
          ? val.registeredAddress
          : val.taxAddress.usedAddress === 'CURRENT_ADDRESS'
            ? val.currentAddress.isSameRegisteredAddress
              ? val.registeredAddress
              : val.currentAddress
            : {}),
      },
    };

    setAddressInfoValue(payload);
    setCurrentStep(4);
  };

  const handleAddressInfoSaveDraft = (payload: any) => {
    const mapPayload = {
      addressIdCard: {
        ...payload.registeredAddress,
      },
      addressCurrent: {
        ...payload.currentAddress,
        ...(payload.currentAddress.isSameRegisteredAddress ? payload.registeredAddress : {}),
      },
      addressTaxInvoice: {
        ...payload.taxAddress,
        ...(payload.taxAddress.usedAddress === 'ID_CARD'
          ? payload.registeredAddress
          : payload.taxAddress.usedAddress === 'CURRENT_ADDRESS'
            ? payload.currentAddress.isSameRegisteredAddress
              ? payload.registeredAddress
              : payload.currentAddress
            : {}),
      },
    };

    if (!data?.data) return;
    handleSaveDraft({
      payload: {
        organizationType: data.data.organizationType || '',
        orgInfo: JSON.stringify(orgInfoValue) || data.data.orgInfo || '',
        contactInfo: JSON.stringify(contactInfoValue) || data.data.contactInfo || 'null',
        addressInfo: JSON.stringify(mapPayload),
        taxInfo: data.data.taxInfo || 'null',
        fileInfo: data.data.fileInfo || 'null',
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data.data.id) || 0,
    });
  };

  // File Info handlers
  const handleFileInfoFinish = async (val: any) => {
    showConfirm({
      title: 'ยืนยันการส่งคำขออนุมัติ',
      detail: 'ระบบจะทำการส่งข้อมูลเพื่อเข้าสู่กระบวนการตรวจสอบ',
      onConfirm: () => {
        if (!data?.data) return;
        const mappedFileData = mapFileResponseData(val);
        handleSaveDraftToApprove({
          payload: {
            organizationType: data.data.organizationType || '',
            orgInfo: JSON.stringify(orgInfoValue) || data.data.orgInfo || '',
            contactInfo: JSON.stringify(contactInfoValue) || data.data.contactInfo || 'null',
            addressInfo: JSON.stringify(addressInfoValue) || data.data.addressInfo || 'null',
            taxInfo: data.data.taxInfo || 'null',
            fileInfo: JSON.stringify(mappedFileData),
            organizeId: Number(organizeId) || 0,
          },
          draftOrganizationId: Number(data.data.id) || 0,
        });
      },
      confirmText: 'ส่งคำขอ',
      type: 'info',
    });
  };

  const handleFileInfoSaveDraft = (val: any) => {
    if (!data?.data) return;
    const mappedFileData = mapFileResponseData(val);
    handleSaveDraft({
      payload: {
        organizationType: data.data.organizationType || '',
        orgInfo: JSON.stringify(orgInfoValue) || data.data.orgInfo || '',
        contactInfo: JSON.stringify(contactInfoValue) || data.data.contactInfo || 'null',
        addressInfo: JSON.stringify(addressInfoValue) || data.data.addressInfo || 'null',
        taxInfo: data.data.taxInfo || 'null',
        fileInfo: JSON.stringify(mappedFileData),
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data.data.id) || 0,
    });
  };

  const renderStepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <FormDraftOrgInfo
            visible={true}
            onClose={() => {}}
            form={setUserForm}
            onFinish={handleOrgInfoFinish}
            isInPopup={false}
            onSaveDraft={handleOrgInfoSaveDraft}
            isLoadingSaveDraft={isLoadingSaveDraft}
            orgInfoData={orgInfoData}
            kycStatus={
              (data?.data?.kycStatus as KycOrganizationStatus) || KycOrganizationStatus.NONE
            }
          />
        );
      case 2:
        return (
          <FormDraftContactInfo
            form={contactInfoForm}
            isInPopup={false}
            onFinish={handleContactInfoFinish}
            onSaveDraft={handleContactInfoSaveDraft}
            isLoadingSaveDraft={isLoadingSaveDraft}
            onBack={() => {
              setCurrentStep(currentStep - 1);
            }}
          />
        );
      case 3:
        return (
          <FormDraftAddressInfo
            form={addressInfoForm}
            isInPopup={false}
            onClose={() => {}}
            onFinish={handleAddressInfoFinish}
            onSaveDraft={handleAddressInfoSaveDraft}
            currentStep={currentStep}
            isLoadingSaveDraft={isLoadingSaveDraft}
            onBack={() => {
              setCurrentStep(currentStep - 1);
            }}
          />
        );
      case 4:
        return (
          <FormDraftFileInfo
            form={fileInfoForm}
            onClose={() => {}}
            onFinish={handleFileInfoFinish}
            orgType={orgInfoData?.juristicType}
            draftOrganizeId={Number(data?.data?.id || 0)}
            isInPopup={false}
            onSaveDraft={handleFileInfoSaveDraft}
            onBack={() => {
              refetch();
              setCurrentStep(currentStep - 1);
            }}
            isLoadingSaveDraft={isLoadingSaveDraft}
            fileInfoData={fileInfoData}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    data,
    setUserForm,
    contactInfoForm,
    addressInfoForm,
    fileInfoForm,
    isLoadingSaveDraft,
    loadingOrganize,
    isFetching,
    contactInfoValue,
    fileInfoData,
    orgInfoData,
  ]);
  return (
    <div>
      <div className="bg-background-secondary">
        <div className="container mx-auto p-4">
          <div>
            <Button
              size="small"
              bold="400"
              variant="ghost"
              color="neutral"
              icon={<i className="ri-arrow-left-line"></i>}
              onClick={() => router.back()}
            >
              ย้อนกลับ
            </Button>
            <div className="flex justify-between flex-wrap gap-2 items-end">
              <div className="flex flex-col gap-1">
                <div className="flex gap-3">
                  <Typography variant="page-title">{user?.user?.name}</Typography>
                </div>
                <Typography variant="paragraph-medium" className="!text-text-tertiary">
                  เมื่อกรอกข้อมูลครบถ้วนแล้ว คุณสามารถส่งคำขอเพื่ออนุมัติเปิดร้านได้ทันที
                </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white">
          {loadingOrganize || isFetching ? (
            <div className="flex justify-center py-20">
              <Spin indicator={<LoadingOutlined spin size={100} />} size="large" />
            </div>
          ) : (
            <div className="max-w-[904px] px-4 md:px-0 mx-auto py-4 md:py-10">
              <div className="relative flex justify-between items-start">
                <div
                  className="absolute top-[32px] md:top-[60px] h-0.5 bg-gray-300 z-0"
                  style={{
                    left: isMobile
                      ? `calc(${100 / steps.length / 2}% + 16px)`
                      : `calc(${100 / steps.length / 2}% + 32px)`,
                    right: isMobile
                      ? `calc(${100 / steps.length / 2}% + 16px)`
                      : `calc(${100 / steps.length / 2}% + 32px)`,
                  }}
                >
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {steps.map((step) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;

                  return (
                    <div
                      key={step.id}
                      className="flex flex-col items-center flex-1 relative py-4 md:py-8"
                    >
                      <div
                        className={`w-8 h-8 md:w-[64px] md:h-[64px] rounded-full flex items-center justify-center z-10 transition-all text-base md:text-2xl duration-200 ${
                          isActive
                            ? 'bg-primary text-white shadow-lg'
                            : isCompleted
                              ? 'bg-primary text-white'
                              : 'bg-background-secondary text-gray-600 border border-border-primary'
                        }`}
                      >
                        {isCompleted ? (
                          <i className="ri-check-line text-base md:text-3xl text-white" />
                        ) : (
                          step.id
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="mt-4 text-center ">
                        <Typography
                          variant={isMobile ? 'paragraph-extra-small' : 'paragraph-big'}
                          className={`${
                            isCompleted || isActive ? '!text-primary' : '!text-text-secondary'
                          } !font-medium`}
                        >
                          {step.title}
                        </Typography>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-6">{renderStepContent}</div>
            </div>
          )}
        </div>
      </div>
      <PopupComponent />
      {confirmPopup}
    </div>
  );
};

export default OrganizationVerifyDetailPage;
