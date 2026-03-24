'use client';

import { getDraftOrganization, saveDraftOrganization } from '@/api/organization.api';
import { IReqDraftOrganization } from '@/interfaces/organization/organization.request.interface';
import { juristicTypeList } from '@/constants/organization';
import { KycOrganizationStatus, OrganizationTypes } from '@/constants/enum/organization.enum';
import ResponsivePopup from '@/components/Popup';
import { useNotification, usePopup } from '@/hooks/index';
import { LoadingOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Form, Spin } from 'antd';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import FormDraftAddressInfo from './components/Form/FormDraftAddressInfo';
import FormDraftContactInfo from './components/Form/FormDraftContactInfo';
import FormDraftFileInfo from './components/Form/FormDraftFileInfo';
import FormDraftOrgInfo from './components/Form/FormDraftOrgInfo';
import StepAddressInfo from './components/Step/StepAddressInfo';
import StepContactInfo from './components/Step/StepContactInfo';
import StepFileInfo from './components/Step/StepFileInfo';
import StepOrganizationInfo from './components/Step/StepOrganizationInfo';
import UploadProfile from './components/UploadFileCis/UploadProfile';
import { FormDraftAddressInfoValues } from './components/Form/FormDraftAddressInfo';
import { FormDraftContactInfoValues } from './components/Form/FormDraftContactInfo';
import { useUserStore } from '@/store/user.store';

type FormDraftOrgInfoValues = {
  businessType?: string[];
  juristicType?: string;
  mainPhoneNumber?: string;
  mainEmail?: string;
  idCard?: string;
  organizeName?: string;
  commercialName?: string;
  registrationNumber?: string;
  isUseFullName?: boolean;
  taxId?: string;
  type?: string;
  branchNumber?: string;
  juristicTypeId?: number;
  branchName?: string;
  otherMainPhoneNumber?: string;
  originalJuristic?: Record<string, unknown>;
  originalIdCard?: string;
  originalRegistrationNumber?: string;
  branchType?: string;
  remarkTypeOther?: string;
};

const OrganizeManagement = () => {
  const params = useParams();
  const { id: organizeId } = params as { id: string };
  const { notification } = useNotification();
  const { showPopup, PopupComponent } = usePopup();
  const { user: userProfile } = useUserStore();

  const [isOpenOrgInfo, setIsOpenOrgInfo] = useState(false);
  const [isOpenContactInfo, setIsOpenContactInfo] = useState(false);
  const [isOpenAddressInfo, setIsOpenAddressInfo] = useState(false);
  const [isOpenDocumentInfo, setIsOpenDocumentInfo] = useState(false);

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

  const { orgInfo, contactInfo, addressInfo, fileInfo } = data?.data || {};
  const orgInfoData = orgInfo ? JSON.parse(orgInfo || '{}') : null;
  const contactInfoData = contactInfo ? JSON.parse(contactInfo || '{}') : null;
  const addressInfoData = addressInfo ? JSON.parse(addressInfo || '{}') : null;
  const fileInfoData = fileInfo ? JSON.parse(fileInfo || '{}') : null;

  const [setUserForm] = Form.useForm();
  const [contactInfoForm] = Form.useForm<FormDraftContactInfoValues>();
  const [addressInfoForm] = Form.useForm();
  const [fileInfoForm] = Form.useForm();

  const loading = loadingOrganize || isFetching;

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
        message: 'บันทึกข้อมูลสำเร็จ',
        duration: 3,
        icon: <i className="ri-information-line text-primary"></i>,
      });
      refetch();
      setIsOpenOrgInfo(false);
      setIsOpenContactInfo(false);
      setIsOpenAddressInfo(false);
    },
    onError: () => {
      showPopup('error', {
        statusCode: 500,
      });
    },
  });

  const handleOrgInfoFinish = async (values: FormDraftOrgInfoValues) => {
    const payload = {
      businessType: values.businessType || [],
      juristicType: values.juristicType || null,
      mainPhoneNumber: values.mainPhoneNumber || null,
      mainEmail: values.mainEmail || null,
      idCard: values.idCard || null,
      organizeName: values.organizeName || null,
      commercialName: values.commercialName || null,
      registrationNumber: values.registrationNumber || null,
      isUseFullName: values.isUseFullName || null,
      taxId: values.taxId || null,
      type: values.type || null,
      branchNumber: values.branchNumber || null,
      juristicTypeId:
        juristicTypeList?.find(
          (item: { id: number; label: string }) => item.id === values.juristicTypeId
        )?.id || null,
      branchName: values.branchName || null,
      otherMainPhoneNumber: values.otherMainPhoneNumber || null,
      originalJuristic: values.originalJuristic || null,
      originalIdCard: values.originalIdCard || null,
      originalRegistrationNumber: values.originalRegistrationNumber || null,
      branchType: values.branchType || null,
      remarkTypeOther: values.remarkTypeOther || null,
    };
    handleSaveDraft({
      payload: {
        organizationType: data?.data?.organizationType || '',
        orgInfo: JSON.stringify(payload),
        contactInfo: data?.data?.contactInfo || 'null',
        addressInfo: data?.data?.addressInfo || 'null',
        fileInfo: data?.data?.fileInfo || 'null',
        taxInfo: data?.data?.taxInfo || 'null',
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data?.data?.id) || 0,
    });
  };

  const handleContactInfoFinish = async (values: FormDraftContactInfoValues) => {
    const payload = {
      highestAuthority: {
        highestAuthorityName: values.highestAuthorityName,
        highestAuthorityPosition: values.highestAuthorityPosition,
        highestAuthorityPhoneNumber: values.highestAuthorityPhoneNumber,
        highestAuthorityEmail: values.highestAuthorityEmail,
      },
      contact: {
        contactName: values.contactShownHighestAuthority
          ? values.highestAuthorityName
          : values.contactName,
        contactPhoneNumber: values.contactShownHighestAuthority
          ? values.highestAuthorityPhoneNumber
          : values.contactPhoneNumber,
        contactEmail: values.contactShownHighestAuthority
          ? values.highestAuthorityEmail
          : values.contactEmail,
      },
      contactShownHighestAuthority: values.contactShownHighestAuthority,
    };
    handleSaveDraft({
      payload: {
        organizationType: data?.data?.organizationType || '',
        orgInfo: data?.data?.orgInfo || '',
        contactInfo: JSON.stringify(payload),
        addressInfo: data?.data?.addressInfo || 'null',
        fileInfo: data?.data?.fileInfo || 'null',
        taxInfo: data?.data?.taxInfo || 'null',
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data?.data?.id) || 0,
    });
  };

  const handleAddressInfoFinish = (values: FormDraftAddressInfoValues) => {
    const payload = {
      addressIdCard: {
        ...values.registeredAddress,
      },
      addressCurrent: {
        ...values.currentAddress,
        ...(values.currentAddress.isSameRegisteredAddress ? values.registeredAddress : {}),
      },
      addressTaxInvoice: {
        ...values.taxAddress,
        ...(values.taxAddress.usedAddress === 'ID_CARD'
          ? values.registeredAddress
          : values.taxAddress.usedAddress === 'CURRENT_ADDRESS'
            ? values.currentAddress.isSameRegisteredAddress
              ? values.registeredAddress
              : values.currentAddress
            : {}),
      },
    };
    handleSaveDraft({
      payload: {
        organizationType: data?.data?.organizationType || '',
        orgInfo: data?.data?.orgInfo || '',
        contactInfo: data?.data?.contactInfo || 'null',
        addressInfo: JSON.stringify(payload) || 'null',
        fileInfo: data?.data?.fileInfo || 'null',
        taxInfo: data?.data?.taxInfo || 'null',
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data?.data?.id) || 0,
    });
  };

  const handleFileInfoFinish = () => {
    setIsOpenDocumentInfo(false);
    refetch();
  };
  return (
    <div className="w-full justify-center">
      {loading ? (
        <div className="flex w-full justify-center py-20">
          <Spin indicator={<LoadingOutlined spin size={100} />} size="large" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {/* Step 1: Organization Info */}
            <StepOrganizationInfo
              orgInfoData={orgInfoData}
              juristicTypeList={juristicTypeList || []}
              onEdit={() => {
                const formPayload = {
                  ...orgInfoData,
                  otherMainPhoneNumber: orgInfoData?.otherMainPhoneNumber || '',
                  branchType: orgInfoData?.branchType || 'HEAD_OFFICE',
                  branchNumber: orgInfoData?.branchNumber || '00000',
                  branchName:
                    orgInfoData?.branchName === 'HEAD_OFFICE' ||
                    orgInfoData?.branchNumber === '00000'
                      ? 'สำนักงานใหญ่'
                      : orgInfoData?.branchName === 'BRANCH'
                        ? 'สาขา'
                        : orgInfoData?.branchName || '',
                  juristicTypeId: juristicTypeList?.find(
                    (item: { id: number; label: string }) => item.id === orgInfoData?.juristicTypeId
                  )?.id,
                  juristicTypeName: juristicTypeList?.find(
                    (item: { id: number; label: string }) => item.id === orgInfoData?.juristicTypeId
                  )?.label,
                  commercialName: orgInfoData?.commercialName
                    ? orgInfoData?.commercialName
                    : `${userProfile?.user?.firstNameTh} ${userProfile?.user?.lastNameTh}`,
                  originalJuristic:
                    orgInfoData?.juristicType === OrganizationTypes.JURISTIC
                      ? orgInfoData?.originalJuristic?.taxId !== orgInfoData?.taxId &&
                        orgInfoData?.originalJuristic?.taxId
                        ? { ...orgInfoData.originalJuristic }
                        : { ...orgInfoData }
                      : null,
                  originalIdCard:
                    orgInfoData?.juristicType === OrganizationTypes.PERSONAL
                      ? orgInfoData?.originalIdCard !== orgInfoData?.idCard &&
                        orgInfoData?.originalIdCard
                        ? orgInfoData?.originalIdCard
                        : orgInfoData?.idCard
                      : null,
                  originalRegistrationNumber:
                    orgInfoData?.juristicType === OrganizationTypes.REGISTERED_INDIVIDUAL
                      ? orgInfoData?.originalRegistrationNumber !==
                          orgInfoData?.registrationNumber && orgInfoData?.originalRegistrationNumber
                        ? orgInfoData?.originalRegistrationNumber
                        : orgInfoData?.registrationNumber
                      : null,
                };
                setUserForm.setFieldsValue(formPayload);
                setIsOpenOrgInfo(true);
              }}
              onAdd={() => setIsOpenOrgInfo(true)}
              isDisabled={data?.data?.kycStatus === KycOrganizationStatus.WAIT_FOR_APPROVE}
            />

            {/* Step 2: Contact Info */}
            <StepContactInfo
              contactInfoData={contactInfoData}
              onEdit={() => {
                contactInfoForm.setFieldsValue({
                  highestAuthorityName:
                    contactInfoData?.highestAuthority?.highestAuthorityName || '',
                  highestAuthorityPosition:
                    contactInfoData?.highestAuthority?.highestAuthorityPosition || '',
                  highestAuthorityPhoneNumber:
                    contactInfoData?.highestAuthority?.highestAuthorityPhoneNumber || '',
                  highestAuthorityEmail:
                    contactInfoData?.highestAuthority?.highestAuthorityEmail || '',
                  contactName: contactInfoData?.contact?.contactName || '',
                  contactPhoneNumber: contactInfoData?.contact?.contactPhoneNumber || '',
                  contactEmail: contactInfoData?.contact?.contactEmail || '',
                  contactShownHighestAuthority:
                    contactInfoData?.contactShownHighestAuthority || false,
                });
                setIsOpenContactInfo(true);
              }}
              onAdd={() => setIsOpenContactInfo(true)}
              isDisabled={data?.data?.kycStatus === KycOrganizationStatus.WAIT_FOR_APPROVE}
            />

            {/* Step 3: Address Info */}
            <StepAddressInfo
              addressInfoData={addressInfoData}
              onEdit={() => {
                addressInfoForm.setFieldsValue({
                  registeredAddress: {
                    countryId: addressInfoData?.addressIdCard?.countryId,
                    address: addressInfoData?.addressIdCard?.address,
                    provinceId: addressInfoData?.addressIdCard?.provinceId,
                    provinceName: addressInfoData?.addressIdCard?.provinceName,
                    districtId: addressInfoData?.addressIdCard?.districtId,
                    districtName: addressInfoData?.addressIdCard?.districtName,
                    subDistrictId: addressInfoData?.addressIdCard?.subDistrictId,
                    subDistrictName: addressInfoData?.addressIdCard?.subDistrictName,
                    zipCode: addressInfoData?.addressIdCard?.zipCode,
                    zipcodeName: addressInfoData?.addressIdCard?.zipcodeName,
                  },
                  currentAddress: {
                    countryId: addressInfoData?.addressCurrent?.countryId,
                    address: addressInfoData?.addressCurrent?.address,
                    provinceId: addressInfoData?.addressCurrent?.provinceId,
                    provinceName: addressInfoData?.addressCurrent?.provinceName,
                    districtId: addressInfoData?.addressCurrent?.districtId,
                    districtName: addressInfoData?.addressCurrent?.districtName,
                    subDistrictId: addressInfoData?.addressCurrent?.subDistrictId,
                    subDistrictName: addressInfoData?.addressCurrent?.subDistrictName,
                    zipCode: addressInfoData?.addressCurrent?.zipCode,
                    zipcodeName: addressInfoData?.addressCurrent?.zipcodeName,
                    isSameRegisteredAddress:
                      addressInfoData?.addressCurrent?.isSameRegisteredAddress,
                  },
                  taxAddress: {
                    countryId: addressInfoData?.addressTaxInvoice?.countryId,
                    address: addressInfoData?.addressTaxInvoice?.address,
                    provinceId: addressInfoData?.addressTaxInvoice?.provinceId,
                    provinceName: addressInfoData?.addressTaxInvoice?.provinceName,
                    districtId: addressInfoData?.addressTaxInvoice?.districtId,
                    districtName: addressInfoData?.addressTaxInvoice?.districtName,
                    subDistrictId: addressInfoData?.addressTaxInvoice?.subDistrictId,
                    subDistrictName: addressInfoData?.addressTaxInvoice?.subDistrictName,
                    zipCode: addressInfoData?.addressTaxInvoice?.zipCode,
                    zipcodeName: addressInfoData?.addressTaxInvoice?.zipcodeName,
                    usedAddress: addressInfoData?.addressTaxInvoice?.usedAddress,
                  },
                });
                setIsOpenAddressInfo(true);
              }}
              onAdd={() => setIsOpenAddressInfo(true)}
              isDisabled={data?.data?.kycStatus === KycOrganizationStatus.WAIT_FOR_APPROVE}
            />

            {/* Step 4: File Info */}
            <StepFileInfo
              fileInfoData={fileInfoData}
              onEdit={() => {
                fileInfoForm.setFieldsValue({
                  ...fileInfoData,
                });
                setIsOpenDocumentInfo(true);
              }}
              onAdd={() => {
                fileInfoForm.setFieldsValue({
                  ...fileInfoData,
                });
                setIsOpenDocumentInfo(true);
              }}
              isDisabled={data?.data?.kycStatus === KycOrganizationStatus.WAIT_FOR_APPROVE}
              juristicType={orgInfoData?.juristicType}
            />
          </div>
          <ResponsivePopup
            visible={isOpenOrgInfo}
            onClose={() => {
              setIsOpenOrgInfo(false);
            }}
            modalProps={{
              width: '60vw',
            }}
            drawerProps={{
              height: '90%',
              destroyOnClose: true,
            }}
          >
            <FormDraftOrgInfo
              visible={isOpenOrgInfo}
              onClose={() => setIsOpenOrgInfo(false)}
              form={setUserForm}
              onFinish={handleOrgInfoFinish}
              orgInfoData={orgInfoData}
              kycStatus={
                (data?.data?.kycStatus as KycOrganizationStatus) || KycOrganizationStatus.NONE
              }
            />
          </ResponsivePopup>

          <ResponsivePopup
            visible={isOpenContactInfo}
            onClose={() => {
              setIsOpenContactInfo(false);
            }}
            modalProps={{
              width: '60vw',
            }}
            drawerProps={{
              height: '90%',
              destroyOnClose: true,
            }}
          >
            <FormDraftContactInfo form={contactInfoForm} onFinish={handleContactInfoFinish} />
          </ResponsivePopup>
          <ResponsivePopup
            visible={isOpenAddressInfo}
            onClose={() => {
              setIsOpenAddressInfo(false);
            }}
            modalProps={{
              width: '60vw',
            }}
            drawerProps={{
              height: '90%',
              destroyOnClose: true,
            }}
          >
            <FormDraftAddressInfo
              onClose={() => setIsOpenAddressInfo(false)}
              form={addressInfoForm}
              onFinish={handleAddressInfoFinish}
            />
          </ResponsivePopup>

          <ResponsivePopup
            visible={isOpenDocumentInfo}
            onClose={() => {
              setIsOpenDocumentInfo(false);
              refetch();
            }}
            modalProps={{
              width: '60vw',
            }}
            drawerProps={{
              height: '90%',
              destroyOnClose: true,
            }}
          >
            <FormDraftFileInfo
              onClose={() => setIsOpenDocumentInfo(false)}
              form={fileInfoForm}
              onFinish={handleFileInfoFinish}
              orgType={orgInfoData?.juristicType}
              draftOrganizeId={Number(data?.data?.id)}
              fileInfoData={fileInfoData}
            />
          </ResponsivePopup>
        </>
      )}
      <PopupComponent />
    </div>
  );
};

export default OrganizeManagement;
