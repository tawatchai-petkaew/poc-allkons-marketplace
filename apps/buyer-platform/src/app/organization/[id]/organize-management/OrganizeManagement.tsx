'use client';

import { FC, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Grid, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Typography from '@/components/Typography';
import { Label } from '@/components/Label';
import ResponsivePopup from '@/components/Popup';
import { useNotification } from '@/hooks/notification.hook';
import usePopup from '@/hooks/usePopup';
import { useGlobalStore } from '@/store/global.store';
import {
  getDraftOrganization,
  getJuristicTypeList,
  saveDraftOrganization,
  IReqDraftOrganization,
} from '@/common/api/customer-service/organization.api';
import {
  KycOrganizationStatus,
  OrganizationTypes,
} from '@/common/enum/organization.enum';
import StepOrganizationInfo from '../components/Verify/Step/StepOrganizationInfo';
import StepContactInfo from '../components/Verify/Step/StepContactInfo';
import StepAddressInfo from '../components/Verify/Step/StepAddressInfo';
import StepFileInfo from '../components/Verify/Step/StepFileInfo';
import FormDraftOrgInfo from '../components/Verify/Form/FormDraftOrgInfo';
import FormDraftContactInfo from '../components/Verify/Form/FormDraftContactInfo';
import FormDraftAddressInfo from '../components/Verify/Form/FormDraftAddressInfo';
import FormDraftFileInfo from '../components/Verify/Form/FormDraftFileInfo';

type FormDraftContactInfoValues = {
  highestAuthorityName: string;
  highestAuthorityPosition: string;
  highestAuthorityPhoneNumber: string;
  highestAuthorityEmail: string;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  contactShownHighestAuthority: boolean;
};

const OrganizeManagement: FC = () => {
  const params = useParams();
  const router = useRouter();
  const { notification } = useNotification();
  const { showPopup, PopupComponent } = usePopup();
  const { id: organizeId } = params;
  const { profile } = useGlobalStore();
  const { sm } = Grid.useBreakpoint();

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

  const loading = loadingOrganize || isFetching;

  const [setUserForm] = Form.useForm();
  const [contactInfoForm] = Form.useForm<FormDraftContactInfoValues>();
  const [addressInfoForm] = Form.useForm();
  const [fileInfoForm] = Form.useForm();

  const { data: juristicTypeList } = useQuery({
    queryKey: ['juristicTypeList'],
    queryFn: async () => {
      const response = await getJuristicTypeList();
      return response.data;
    },
    enabled: orgInfoData?.juristicType === OrganizationTypes.JURISTIC,
  });

  const { mutate: handleSaveDraft, isPending: isLoadingSaveDraft } =
    useMutation({
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

  const handleOrgInfoFinish = async (values: any) => {
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
          (item: any) => item.value === values.juristicTypeId
        )?.id || null,
      branchName: values.branchName || null,
      otherMainPhoneNumber: values.otherMainPhoneNumber || null,
    };
    handleSaveDraft({
      payload: {
        organizationType: data?.data.organizationType || '',
        orgInfo: JSON.stringify(payload),
        contactInfo: data?.data.contactInfo || 'null',
        addressInfo: data?.data.addressInfo || 'null',
        fileInfo: data?.data.fileInfo || 'null',
        taxInfo: data?.data.taxInfo || 'null',
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data.data.id) || 0,
    });
  };

  const handleContactInfoFinish = async (
    values: FormDraftContactInfoValues
  ) => {
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
        organizationType: data?.data.organizationType || '',
        orgInfo: data?.data.orgInfo || '',
        contactInfo: JSON.stringify(payload),
        addressInfo: data?.data.addressInfo || 'null',
        fileInfo: data?.data.fileInfo || 'null',
        taxInfo: data?.data.taxInfo || 'null',
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data.data.id) || 0,
    });
  };

  const handleAddressInfoFinish = (values: any) => {
    const payload = {
      addressIdCard: {
        ...values.registeredAddress,
      },
      addressCurrent: {
        ...values.currentAddress,
        ...(values.currentAddress.isSameRegisteredAddress
          ? values.registeredAddress
          : {}),
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
        organizationType: data?.data.organizationType || '',
        orgInfo: data?.data.orgInfo || '',
        contactInfo: data?.data.contactInfo || 'null',
        addressInfo: JSON.stringify(payload) || 'null',
        fileInfo: data?.data.fileInfo || 'null',
        taxInfo: data?.data.taxInfo || 'null',
        organizeId: Number(organizeId) || 0,
      },
      draftOrganizationId: Number(data.data.id) || 0,
    });
  };

  const handleFileInfoFinish = () => {
    setIsOpenDocumentInfo(false);
  };

  const getKycStatusLabel = () => {
    switch (data?.data?.kycStatus) {
      case KycOrganizationStatus.APPROVE:
        return (
          <Label
            prefix={<i className="ri-checkbox-circle-line text-success"></i>}
            variant="ghost"
            color="success"
            text="ยืนยันตัวตนแล้ว"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.WAIT_FOR_APPROVE:
        return (
          <Label
            prefix={<i className="ri-time-line text-warning"></i>}
            variant="ghost"
            color="warning"
            text="รอการอนุมัติ"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.REQUEST_MORE:
        return (
          <Label
            prefix={<i className="ri-information-line text-info"></i>}
            variant="ghost"
            color="info"
            text="ขอข้อมูลเพิ่มเติม"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.REJECT:
        return (
          <Label
            prefix={<i className="ri-close-circle-line text-error"></i>}
            variant="ghost"
            color="error"
            text="ถูกปฏิเสธ"
            rounding="pill"
          />
        );
      default:
        return (
          <Label
            prefix={<i className="ri-information-line text-error"></i>}
            variant="ghost"
            color="error"
            text="ยังไม่ยืนยันตัวตน"
            rounding="pill"
          />
        );
    }
  };

  return (
    <div>
      <div className="bg-background-secondary">
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-2 items-start md:items-center">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col md:flex-row gap-1 md:gap-3">
                <Typography variant="page-title">{profile?.name}</Typography>
                {getKycStatusLabel()}
              </div>
            </div>
            {/* {data?.data?.kycStatus !== KycOrganizationStatus.APPROVE &&
              data?.data?.kycStatus !==
                KycOrganizationStatus.WAIT_FOR_APPROVE && (
                <Button
                  variant="solid"
                  onClick={() =>
                    router.push(`/organization/${organizeId}/verify-kyc`)
                  }
                >
                  ยืนยันตัวตน
                </Button>
              )} */}
          </div>
        </div>
      </div>
      <div className="bg-white">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spin
              indicator={<LoadingOutlined spin size={100} />}
              size="large"
            />
          </div>
        ) : (
          <div className="max-w-[904px] px-4 md:px-0 mx-auto py-4 md:py-10">
            <div className="flex flex-col gap-6">
              {/* Step 1: Organization Info */}
              <StepOrganizationInfo
                orgInfoData={orgInfoData}
                juristicTypeList={juristicTypeList || []}
                onEdit={() => {
                  setUserForm.setFieldsValue({
                    ...orgInfoData,
                    otherContactNumber: orgInfoData?.otherContactNumber || '',
                    branchType: orgInfoData?.branchType || 'HEAD_OFFICE',
                    branchNumber: orgInfoData?.branchNumber || '00000',
                    juristicTypeId: juristicTypeList?.find(
                      (item: any) => item.id === orgInfoData?.juristicTypeId
                    )?.value,
                  });
                  setIsOpenOrgInfo(true);
                }}
                onAdd={() => setIsOpenOrgInfo(true)}
                isDisabled={
                  data?.data?.kycStatus ===
                  KycOrganizationStatus.WAIT_FOR_APPROVE
                }
              />

              {/* Step 2: Contact Info */}
              <StepContactInfo
                contactInfoData={contactInfoData}
                onEdit={() => {
                  contactInfoForm.setFieldsValue({
                    highestAuthorityName:
                      contactInfoData?.highestAuthority?.highestAuthorityName ||
                      '',
                    highestAuthorityPosition:
                      contactInfoData?.highestAuthority
                        ?.highestAuthorityPosition || '',
                    highestAuthorityPhoneNumber:
                      contactInfoData?.highestAuthority
                        ?.highestAuthorityPhoneNumber || '',
                    highestAuthorityEmail:
                      contactInfoData?.highestAuthority
                        ?.highestAuthorityEmail || '',
                    contactName: contactInfoData?.contact?.contactName || '',
                    contactPhoneNumber:
                      contactInfoData?.contact?.contactPhoneNumber || '',
                    contactEmail: contactInfoData?.contact?.contactEmail || '',
                    contactShownHighestAuthority:
                      contactInfoData?.contactShownHighestAuthority || false,
                  });
                  setIsOpenContactInfo(true);
                }}
                onAdd={() => setIsOpenContactInfo(true)}
                isDisabled={
                  data?.data?.kycStatus ===
                  KycOrganizationStatus.WAIT_FOR_APPROVE
                }
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
                      provinceName:
                        addressInfoData?.addressIdCard?.provinceName,
                      districtId: addressInfoData?.addressIdCard?.districtId,
                      districtName:
                        addressInfoData?.addressIdCard?.districtName,
                      subDistrictId:
                        addressInfoData?.addressIdCard?.subDistrictId,
                      subDistrictName:
                        addressInfoData?.addressIdCard?.subDistrictName,
                      zipcodeId: addressInfoData?.addressIdCard?.zipcodeId,
                      zipcodeName: addressInfoData?.addressIdCard?.zipcodeName,
                    },
                    currentAddress: {
                      countryId: addressInfoData?.addressCurrent?.countryId,
                      address: addressInfoData?.addressCurrent?.address,
                      provinceId: addressInfoData?.addressCurrent?.provinceId,
                      provinceName:
                        addressInfoData?.addressCurrent?.provinceName,
                      districtId: addressInfoData?.addressCurrent?.districtId,
                      districtName:
                        addressInfoData?.addressCurrent?.districtName,
                      subDistrictId:
                        addressInfoData?.addressCurrent?.subDistrictId,
                      subDistrictName:
                        addressInfoData?.addressCurrent?.subDistrictName,
                      zipcodeId: addressInfoData?.addressCurrent?.zipcodeId,
                      zipcodeName: addressInfoData?.addressCurrent?.zipcodeName,
                      isSameRegisteredAddress:
                        addressInfoData?.addressCurrent
                          ?.isSameRegisteredAddress,
                    },
                    taxAddress: {
                      countryId: addressInfoData?.addressTaxInvoice?.countryId,
                      address: addressInfoData?.addressTaxInvoice?.address,
                      provinceId:
                        addressInfoData?.addressTaxInvoice?.provinceId,
                      provinceName:
                        addressInfoData?.addressTaxInvoice?.provinceName,
                      districtId:
                        addressInfoData?.addressTaxInvoice?.districtId,
                      districtName:
                        addressInfoData?.addressTaxInvoice?.districtName,
                      subDistrictId:
                        addressInfoData?.addressTaxInvoice?.subDistrictId,
                      subDistrictName:
                        addressInfoData?.addressTaxInvoice?.subDistrictName,
                      zipcodeId: addressInfoData?.addressTaxInvoice?.zipcodeId,
                      zipcodeName:
                        addressInfoData?.addressTaxInvoice?.zipcodeName,
                      usedAddress:
                        addressInfoData?.addressTaxInvoice?.usedAddress,
                    },
                  });
                  setIsOpenAddressInfo(true);
                }}
                onAdd={() => setIsOpenAddressInfo(true)}
                isDisabled={
                  data?.data?.kycStatus ===
                  KycOrganizationStatus.WAIT_FOR_APPROVE
                }
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
                isDisabled={
                  data?.data?.kycStatus ===
                  KycOrganizationStatus.WAIT_FOR_APPROVE
                }
              />
            </div>

            {/* Forms */}
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
                kycStatus={data?.data?.kycStatus || KycOrganizationStatus.NONE}
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
              <FormDraftContactInfo
                form={contactInfoForm}
                onFinish={handleContactInfoFinish}
              />
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
                visible={isOpenAddressInfo}
                onClose={() => setIsOpenAddressInfo(false)}
                form={addressInfoForm}
                onFinish={handleAddressInfoFinish}
              />
            </ResponsivePopup>

            <ResponsivePopup
              visible={isOpenDocumentInfo}
              onClose={() => {
                setIsOpenDocumentInfo(false);
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
              />
            </ResponsivePopup>
          </div>
        )}
      </div>

      <PopupComponent />
    </div>
  );
};

export default OrganizeManagement;
