'use client';

import { getLocations } from '@/api/location.api';
import {
  getDraftUserKyc,
  getMasterBusinessType,
  updateDraftUserKyc,
  sendOtpEmail,
  approveUserKyc,
  checkIdCardToCis,
  checkEmail,
} from '@/api/user.api';
import PopupOtp from './PopupOtp';
import ResponsivePopup from '@/components/Popup';
import { checkRegister, sendToken } from '@/api/auth.api';
import { useDebounce } from '@/hooks/useDebounce';
import { useConfirmPopup } from '@/hooks/useConfirmPopup';
import { useNotification } from '@/hooks/useNotification';
import usePopup from '@/hooks/usePopup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, AutoComplete, Divider, Form, Grid, Spin, TreeSelect } from 'antd';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import TextField from '@/components/DataEntry/TextField';
import DatePicker from '@/components/DataEntry/DatePicker';
import RadioGroup from '@/components/DataEntry/RadioGroup';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import BadgeLabel from '@/components/BadgeLabel';
import Select from '@/components/DataEntry/Select';
import UploadProfile from '@/components/Upload/Cis/UploadProfile';
import { UploadFile } from 'antd';

import { Gender, MaritalStatus, AddressTypeEnum, KycStatus } from '@/constants/enum/user.enum';
import {
  IUpdateDraftUserKycPayload,
  IDraftUserAddress,
  IMasterDataBusinessTypeResponse,
} from '@/interfaces/user/user.response.interface';
import UploadFileDragger from '@/components/Upload/Cis/UploadFileDragger';
import { DocumentType } from '@/constants/enum/document.enum';
import { ILocationResponse } from '@/interfaces/location/location.response.interface';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types/common.type';
import { useUserStore } from '@/store/user.store';

interface IFileInfoItem {
  documentCisId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
}

interface IBlockUntilErrorResponse {
  data?: {
    data?: {
      blockUntil?: string;
    };
  };
}

interface IAddressStateValue {
  provinceId: number | null;
  provinceName: string;
  districtId: number | null;
  districtName: string;
  subDistrictId: number | null;
  subDistrictName: string;
  zipCode: string | number | null;
  zipcodeName: string;
}

interface ILocationOption extends ILocationResponse {
  value: string;
  label: string;
}

type FileValues = {
  ID_CARD_FRONT: UploadFile[];
  ID_CARD_WITH_PERSON: UploadFile[];
};

// ID card validation function
const idCardCheck = (idCard: string): boolean => {
  if (!idCard || idCard.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(idCard.charAt(i)) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(idCard.charAt(12));
};

const countryOptions = [{ label: 'ประเทศไทย', value: 1 }];

const ProfileKycForm = () => {
  const [userKycForm] = Form.useForm();
  const queryClient = useQueryClient();
  const { md } = Grid.useBreakpoint();
  const isMobile = !md;
  const { confirmPopup, showConfirm } = useConfirmPopup();
  const { notification } = useNotification();
  const { showPopup, PopupComponent } = usePopup();
  const { user: userProfile, setUser: setUserProfile } = useUserStore();
  console.log('userProfile', userProfile);
  // Check states
  const [isSuccessCheckIdCard, setIsSuccessCheckIdCard] = useState(false);
  const [isCheckTelNumber, setIsCheckTelNumber] = useState(false);
  const [isCheckEmail, setIsCheckEmail] = useState(false);

  // OTP states
  const [otpData, setOtpData] = useState<{ token: string; refNo: string }>({
    token: '',
    refNo: '',
  });
  const [isOpenOtpPopup, setIsOpenOtpPopup] = useState(false);
  const [isOpenOtpPopupEmail, setIsOpenOtpPopupEmail] = useState(false);
  const [isOpenRejectReason, setIsOpenRejectReason] = useState(false);
  const [otpTelNumber, setOtpTelNumber] = useState<string>('');
  const [otpEmail, setOtpEmail] = useState<string>('');

  // Profile picture state
  const [profilePic, setProfilePic] = useState<UploadFile[]>([]);

  // File upload states
  const [files, setFiles] = useState<FileValues>({
    ID_CARD_FRONT: [],
    ID_CARD_WITH_PERSON: [],
  });

  // Address states
  const [searchIdCardAddressText, setSearchIdCardAddressText] = useState('');
  const [idCardAddress, setIdCardAddress] = useState<IAddressStateValue | null>(null);
  const [errorIdCardAddress, setErrorIdCardAddress] = useState(false);
  const [isFocusedIdCardAddress, setIsFocusedIdCardAddress] = useState(false);
  const [wasDirtyIdCardAddress, setWasDirtyIdCardAddress] = useState(false);

  const [searchCurrentAddressText, setSearchCurrentAddressText] = useState('');
  const [currentAddress, setCurrentAddress] = useState<IAddressStateValue | null>(null);
  const [errorCurrentAddress, setErrorCurrentAddress] = useState(false);
  const [isFocusedCurrentAddress, setIsFocusedCurrentAddress] = useState(false);
  const [wasDirtyCurrentAddress, setWasDirtyCurrentAddress] = useState(false);

  const debouncedIdCardAddress = useDebounce(searchIdCardAddressText);
  const debouncedCurrentAddress = useDebounce(searchCurrentAddressText);

  // Queries
  const {
    data: dataUserKyc,
    isLoading: isLoadingUserKyc,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['draftUserKyc'],
    queryFn: async () => await getDraftUserKyc(),
  });

  const { data: dataBusinessType } = useQuery({
    queryKey: ['masterDataBusinessType'],
    queryFn: () => getMasterBusinessType(),
  });

  const { data: idCardAddressAutocomplete } = useQuery({
    queryKey: ['idCardAddressAutocomplete', debouncedIdCardAddress],
    queryFn: async () => {
      if (!debouncedIdCardAddress) return [];
      return await getLocations(debouncedIdCardAddress);
    },
  });

  const { data: currentAddressAutocomplete } = useQuery({
    queryKey: ['currentAddressAutocomplete', debouncedCurrentAddress],
    queryFn: async () => {
      if (!debouncedCurrentAddress) return [];
      return await getLocations(debouncedCurrentAddress);
    },
  });

  const userKyc = dataUserKyc?.data;

  // Mutations
  const { mutate: handleCheckTelNumber, isPending: isLoadingCheckTelNumber } = useMutation({
    mutationFn: () => {
      const telNumberValue = userKycForm.getFieldValue('tel');
      const telNumber = telNumberValue?.startsWith('0') ? telNumberValue.slice(1) : telNumberValue;

      // Skip duplicate check if the value matches the user's own existing tel
      const existingTel = userKyc?.tel?.startsWith('0') ? userKyc.tel.slice(1) : userKyc?.tel;
      if (existingTel && telNumber === existingTel) {
        return Promise.resolve({
          data: { code: 'REGISTER_SUCC003' },
        } as ApiResponse<{ code: string }>);
      }

      return checkRegister({ countryCode: '66', phoneNumber: telNumber });
    },
    onSuccess: (response) => {
      if (response.data?.code === 'REGISTER_SUCC003') {
        handleSendToken();
      } else {
        userKycForm.setFields([{ name: 'tel', errors: ['เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว'] }]);
      }
    },
  });

  const { mutate: handleSendToken, isPending: isLoadingSendToken } = useMutation({
    mutationFn: () => {
      const telNumberValue = userKycForm.getFieldValue('tel');
      const telNumber = telNumberValue?.startsWith('0') ? telNumberValue.slice(1) : telNumberValue;
      return sendToken({ countryCode: '66', phoneNumber: telNumber });
    },
    onSuccess: (response) => {
      const telNumberValue = userKycForm.getFieldValue('tel');
      setOtpTelNumber(telNumberValue);
      setOtpData({
        token: response.data?.token || '',
        refNo: response.data?.refno || '',
      });
      setIsOpenOtpPopup(true);
    },
    onError: (error: AxiosError<IBlockUntilErrorResponse>) => {
      if (error.response?.data?.data?.data?.blockUntil) {
        showPopup('error', {
          title: 'ถูกระงับการใช้งานชั่วคราว',
          description: `เนื่องจากขอ OTP หลายครั้ง\nกรุณาลองใหม่อีกครั้งในวันที่ ${new Date(
            error.response.data.data.data.blockUntil
          ).toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })} น.`,
        });
      }
    },
  });

  const { mutate: handleCheckEmailMutation, isPending: isLoadingCheckEmail } = useMutation({
    mutationFn: () => {
      const emailValue = userKycForm.getFieldValue('email');

      // Skip duplicate check if the value matches the user's own existing email
      if (userKyc?.email && emailValue?.toLowerCase() === userKyc.email.toLowerCase()) {
        return Promise.resolve({
          data: { exists: false },
        } as ApiResponse<{ exists: boolean }>);
      }

      return checkEmail({ email: emailValue });
    },
    onSuccess: (response) => {
      if (!response.data?.exists) {
        handleSendOtpEmail();
      } else {
        userKycForm.setFields([{ name: 'email', errors: ['อีเมลนี้ถูกใช้ไปแล้ว'] }]);
      }
    },
  });

  const { mutate: handleSendOtpEmail, isPending: isLoadingSendOtpEmail } = useMutation({
    mutationFn: () => {
      const emailValue = userKycForm.getFieldValue('email');
      return sendOtpEmail({ email: emailValue });
    },
    onSuccess: (response) => {
      const emailValue = userKycForm.getFieldValue('email');
      setOtpEmail(emailValue);
      setOtpData({
        token: '',
        refNo: response.data?.refno || '',
      });
      setIsOpenOtpPopupEmail(true);
    },
    onError: (error: AxiosError<IBlockUntilErrorResponse>) => {
      if (error.response?.data?.data?.data?.blockUntil) {
        showPopup('error', {
          title: 'ถูกระงับการใช้งานชั่วคราว',
          description: `เนื่องจากกรอก OTP ผิดหลายครั้ง\nกรุณาลองใหม่อีกครั้งในวันที่ ${new Date(
            error.response.data.data.data.blockUntil
          ).toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })} น.`,
        });
      } else {
        showPopup('default', {
          statusCode: 500,
        });
      }
    },
  });

  const { mutate: handleResendOtp } = useMutation({
    mutationFn: async () => {
      const telNumberValue = userKycForm.getFieldValue('tel');
      const telNumber = telNumberValue?.startsWith('0') ? telNumberValue.slice(1) : telNumberValue;
      return await sendToken({
        phoneNumber: telNumber || '',
        countryCode: '66',
      });
    },
    onSuccess: (response) => {
      setOtpData({
        token: response.data?.token || '',
        refNo: response.data?.refno || '',
      });
    },
    onError: (error: AxiosError<IBlockUntilErrorResponse>) => {
      if (error.response?.data?.data?.data?.blockUntil) {
        setIsOpenOtpPopup(false);
        showPopup('error', {
          title: 'ถูกระงับการใช้งานชั่วคราว',
          description: `เนื่องจากขอ OTP หลายครั้ง\nกรุณาลองใหม่อีกครั้งในวันที่ ${new Date(
            error.response.data.data.data.blockUntil
          ).toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })} น.`,
        });
      } else {
        showPopup('default', {
          statusCode: 500,
        });
      }
    },
  });

  const { mutate: handleResendOtpEmail } = useMutation({
    mutationFn: async () => {
      const emailValue = userKycForm.getFieldValue('email');
      return sendOtpEmail({ email: emailValue });
    },
    onSuccess: (response) => {
      setOtpData({
        token: '',
        refNo: response.data?.refno || '',
      });
    },
    onError: (error: AxiosError<IBlockUntilErrorResponse>) => {
      if (error.response?.data?.data?.data?.blockUntil) {
        setIsOpenOtpPopupEmail(false);
        showPopup('error', {
          title: 'ถูกระงับการใช้งานชั่วคราว',
          description: `เนื่องจากขอ OTP หลายครั้ง\nกรุณาลองใหม่อีกครั้งในวันที่ ${new Date(
            error.response.data.data.data.blockUntil
          ).toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })} น.`,
        });
      } else {
        showPopup('default', {
          statusCode: 500,
        });
      }
    },
  });

  const { mutate: handleCheckIdCard, isPending: isLoadingIdCard } = useMutation({
    mutationFn: async () => {
      const idCardValue = userKycForm.getFieldValue('idCard');

      // Skip duplicate check if the value matches the user's own existing idCard
      if (userKyc?.idCard && idCardValue === userKyc.idCard) {
        return Promise.resolve({
          data: { exists: false },
        } as ApiResponse<{ exists: boolean }>);
      }

      return checkIdCardToCis({ idCard: idCardValue });
    },
    onSuccess: (response) => {
      if (response.data?.exists) {
        userKycForm.setFields([{ name: 'idCard', errors: ['หมายเลขบัตรประชาชนนี้ถูกใช้ไปแล้ว'] }]);
      } else {
        setIsSuccessCheckIdCard(true);
      }
    },
  });

  const {
    mutate: handleUpdateDraft,
    mutateAsync: handleUpdateDraftAsync,
    isPending: isLoadingUpdateDraft,
  } = useMutation({
    mutationFn: async ({ payload }: { payload: IUpdateDraftUserKycPayload; silent?: boolean }) => {
      return updateDraftUserKyc(payload);
    },
    onSuccess: (_data, variables) => {
      if (!variables.silent) {
        notification.success({
          message: 'บันทึกแบบร่างสำเร็จ',
          duration: 3,
          icon: <i className="ri-information-line text-primary"></i>,
        });
      }
      refetch();
    },
    onError: (_error, variables) => {
      if (!variables.silent) {
        notification.error({
          message: 'ไม่สามารถบันทึกแบบร่างได้',
          duration: 3,
          icon: <i className="ri-information-line text-error"></i>,
        });
      }
    },
  });

  const { mutate: handleUpdateDraftImage, isPending: isLoadingUpdateDraftImage } = useMutation({
    mutationFn: async (payload: IUpdateDraftUserKycPayload) => {
      return updateDraftUserKyc(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataProfileMerchant'] });
      queryClient.invalidateQueries({ queryKey: ['draftUserKyc'] });
    },
  });

  const { mutate: handleSubmitKyc, isPending: isLoadingSubmitKyc } = useMutation({
    mutationFn: async () => {
      return approveUserKyc();
    },
    onSuccess: () => {
      notification.success({
        message: 'ส่งคำขออนุมัติการยืนยันตัวตนสำเร็จ',
        duration: 3,
        icon: <i className="ri-information-line text-primary"></i>,
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['getMyUser'] });
    },
  });

  const isLoadingCheckPhone = isLoadingCheckTelNumber || isLoadingSendToken;
  const isLoadingCheckEmailAll = isLoadingCheckEmail || isLoadingSendOtpEmail;

  // OTP success handlers
  const handleOtpTelSuccess = () => {
    setIsCheckTelNumber(true);
    setIsOpenOtpPopup(false);
    notification.success({
      message: 'ยืนยันเบอร์โทรศัพท์สำเร็จ',
      duration: 3,
    });
  };

  const handleOtpEmailSuccess = () => {
    setIsCheckEmail(true);
    setIsOpenOtpPopupEmail(false);
    notification.success({
      message: 'ยืนยันอีเมลสำเร็จ',
      duration: 3,
    });
  };

  // Business type options for TreeSelect
  const businessTypeData = dataBusinessType?.data as IMasterDataBusinessTypeResponse[] | undefined;
  const businessTypeOptions = Array.isArray(businessTypeData)
    ? businessTypeData.map((item: IMasterDataBusinessTypeResponse) => ({
        title: item.name,
        value: item.code,
        key: item.code,
        children: item.children?.map((child: IMasterDataBusinessTypeResponse) => ({
          title: child.name,
          value: child.code,
          key: child.code,
        })),
      }))
    : [];

  // Address options
  const idCardAddressOptions =
    idCardAddressAutocomplete?.map((location: ILocationResponse) => ({
      value: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
      label: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
      ...location,
    })) || [];

  const currentAddressOptions =
    currentAddressAutocomplete?.map((location: ILocationResponse) => ({
      value: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
      label: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
      ...location,
    })) || [];

  // Initialize form
  useEffect(() => {
    if (userKyc) {
      if (userKyc.tel) setIsCheckTelNumber(true);
      if (userKyc.email) setIsCheckEmail(true);
      if (userKyc.idCard) setIsSuccessCheckIdCard(true);
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          organizations: userProfile.organizations || [],
          merchants: userProfile.merchants,
          user: { ...userProfile.user, kycStatus: userKyc.kycStatus },
        });
      }
      // Parse and set profile picture
      const image = userKyc?.image ? JSON.parse(userKyc?.image || '{}') : null;
      if (image) {
        setProfilePic([image]);
      }

      // Parse and set file uploads
      const fileInfo = userKyc?.fileInfo ? JSON.parse(userKyc?.fileInfo || '{}') : null;
      const convertedFiles: Partial<FileValues> = {};
      if (fileInfo) {
        Object.keys(fileInfo).forEach((key) => {
          if (fileInfo[key] && Array.isArray(fileInfo[key]) && fileInfo[key].length > 0) {
            convertedFiles[key as keyof FileValues] = fileInfo[key].map(
              (file: IFileInfoItem, index: number) => ({
                uid: file.documentCisId || `${key}-${index}`,
                name: file.fileName || `file-${index}`,
                status: 'done' as const,
                url: file.filePath,
                type: file.fileType,
                size: file.fileSize,
                response: {
                  documentCisId: file.documentCisId,
                  fileName: file.fileName,
                  fileType: file.fileType,
                  filePath: file.filePath,
                  fileSize: file.fileSize,
                },
              })
            );
          }
        });
        setFiles(convertedFiles as FileValues);
      }

      // Sort addresses so ID_CARD is at index 0, CURRENT at index 1
      const sortedAddresses = [...(userKyc.draftUserAddresses || [])].sort(
        (a: IDraftUserAddress, b: IDraftUserAddress) => {
          if (a.addressType === AddressTypeEnum.ID_CARD) return -1;
          if (b.addressType === AddressTypeEnum.ID_CARD) return 1;
          return 0;
        }
      );

      userKycForm.setFieldsValue({
        ...userKyc,
        files: convertedFiles,
        tel:
          !userKyc.tel?.startsWith('0') && userKyc.tel?.length === 9
            ? '0' + userKyc.tel
            : userKyc.tel,
        birthDate: userKyc.birthDate ? dayjs(userKyc.birthDate) : null,
        gender: userKyc.gender || Gender.NOT_SPECIFIED,
        maritalStatus: userKyc.maritalStatus || MaritalStatus.CELIBATE,
        draftUserAddresses: sortedAddresses.map((addr: IDraftUserAddress) => ({
          ...addr,
          isSameAddress: addr.isSameAddress ? AddressTypeEnum.ID_CARD : null,
        })),
      });

      // Set address data
      const idCardAddressData = userKyc.draftUserAddresses?.find(
        (addr: IDraftUserAddress) => addr.addressType === AddressTypeEnum.ID_CARD
      );
      const currentAddressData = userKyc.draftUserAddresses?.find(
        (addr: IDraftUserAddress) => addr.addressType === AddressTypeEnum.CURRENT
      );

      if (idCardAddressData && idCardAddressData.province !== null) {
        const provinceName = idCardAddressData?.province ? idCardAddressData.province.name_th : '';
        const districtName = idCardAddressData?.district ? idCardAddressData.district.name_th : '';
        const subDistrictName = idCardAddressData?.subDistrict
          ? idCardAddressData.subDistrict.name_th
          : '';
        const zipCodeId = idCardAddressData?.subDistrict
          ? idCardAddressData.subDistrict.zipCodeId
          : '';
        const zipCode = idCardAddressData?.subDistrict
          ? idCardAddressData.subDistrict.zip_code
          : '';
        setIdCardAddress({
          provinceId: idCardAddressData.provinceId,
          provinceName: provinceName,
          districtId: idCardAddressData.districtId,
          districtName: districtName,
          subDistrictId: idCardAddressData.subDistrictId,
          subDistrictName: subDistrictName,
          zipCode: zipCodeId,
          zipcodeName: zipCode,
        });
        setSearchIdCardAddressText(
          `${subDistrictName || ''} ${districtName || ''} ${provinceName || ''} ${zipCode || ''}`.trim()
        );
        setWasDirtyIdCardAddress(true);
      }
      if (currentAddressData && currentAddressData.province !== null) {
        const provinceName = currentAddressData?.province
          ? currentAddressData.province.name_th
          : '';
        const districtName = currentAddressData?.district
          ? currentAddressData.district.name_th
          : '';
        const subDistrictName = currentAddressData?.subDistrict
          ? currentAddressData.subDistrict.name_th
          : '';
        const zipCodeId = currentAddressData?.subDistrict
          ? currentAddressData.subDistrict.zipCodeId
          : '';
        const zipCode = currentAddressData?.subDistrict
          ? currentAddressData.subDistrict.zip_code
          : '';
        setCurrentAddress({
          provinceId: currentAddressData.provinceId,
          provinceName: provinceName,
          districtId: currentAddressData.districtId,
          districtName: districtName,
          subDistrictId: currentAddressData.subDistrictId,
          subDistrictName: subDistrictName,
          zipCode: zipCodeId,
          zipcodeName: zipCode,
        });
        setSearchCurrentAddressText(
          `${subDistrictName || ''} ${districtName || ''} ${provinceName || ''} ${zipCode || ''}`.trim()
        );
        setWasDirtyCurrentAddress(true);
      }
    }
  }, [userKyc, userKycForm]);

  const handleBlurAddress = (type: AddressTypeEnum) => {
    if (type === AddressTypeEnum.ID_CARD) {
      setIsFocusedIdCardAddress(false);
      if (searchIdCardAddressText && !idCardAddress) {
        setErrorIdCardAddress(true);
      } else {
        setSearchIdCardAddressText(
          idCardAddress
            ? `${idCardAddress?.subDistrictName || ''} ${idCardAddress?.districtName || ''} ${idCardAddress?.provinceName || ''} ${idCardAddress?.zipcodeName || ''}`.trim()
            : ''
        );
        setErrorIdCardAddress(false);
      }
    } else if (type === AddressTypeEnum.CURRENT) {
      setIsFocusedCurrentAddress(false);
      if (searchCurrentAddressText && !currentAddress) {
        setErrorCurrentAddress(true);
      } else {
        setSearchCurrentAddressText(
          currentAddress
            ? `${currentAddress?.subDistrictName || ''} ${currentAddress?.districtName || ''} ${currentAddress?.provinceName || ''} ${currentAddress?.zipcodeName || ''}`
            : ''
        );
        setErrorCurrentAddress(false);
      }
    }
  };

  const handleSelectAddress = (option: ILocationOption, type: AddressTypeEnum) => {
    const addressValue: IAddressStateValue = {
      provinceId: option.province_id,
      provinceName: option.province,
      districtId: option.district_id,
      districtName: option.district,
      subDistrictId: option.subdistrict_id,
      subDistrictName: option.subdistrict,
      zipCode: option.zip_code_id ? Number(option.zip_code_id) : null,
      zipcodeName: option.zip_code,
    };

    const addressText = `${option.subdistrict} ${option.district} ${option.province} ${option.zip_code}`;

    if (type === AddressTypeEnum.ID_CARD) {
      setSearchIdCardAddressText(addressText);
      setIdCardAddress(addressValue);
      setErrorIdCardAddress(false);
      setWasDirtyIdCardAddress(true);
    } else {
      setSearchCurrentAddressText(addressText);
      setCurrentAddress(addressValue);
      setErrorCurrentAddress(false);
      setWasDirtyCurrentAddress(true);
    }
  };

  const buildDraftPayload = (): IUpdateDraftUserKycPayload => {
    const formValues = userKycForm.getFieldsValue();

    // Handle image serialization
    const image =
      formValues.image && formValues.image.length > 0 && typeof formValues.image !== 'string'
        ? JSON.stringify(formValues.image[0])
        : typeof formValues.image === 'string'
          ? formValues.image
          : '';

    const currentAddrIsSame = formValues.draftUserAddresses?.[1]?.isSameAddress;

    return {
      ...formValues,
      image,
      birthDate: formValues.birthDate ? dayjs(formValues.birthDate).format('YYYY-MM-DD') : null,
      draftUserAddresses: [
        {
          addressType: AddressTypeEnum.ID_CARD,
          address: formValues.draftUserAddresses?.[0]?.address,
          countryId: formValues.draftUserAddresses?.[0]?.countryId ?? 1,
          provinceId: idCardAddress?.provinceId,
          districtId: idCardAddress?.districtId,
          subDistrictId: idCardAddress?.subDistrictId,
        },
        {
          addressType: AddressTypeEnum.CURRENT,
          address: currentAddrIsSame
            ? formValues.draftUserAddresses?.[0]?.address
            : formValues.draftUserAddresses?.[1]?.address,
          countryId: currentAddrIsSame
            ? (formValues.draftUserAddresses?.[0]?.countryId ?? 1)
            : (formValues.draftUserAddresses?.[1]?.countryId ?? 1),
          provinceId: currentAddrIsSame ? idCardAddress?.provinceId : currentAddress?.provinceId,
          districtId: currentAddrIsSame ? idCardAddress?.districtId : currentAddress?.districtId,
          subDistrictId: currentAddrIsSame
            ? idCardAddress?.subDistrictId
            : currentAddress?.subDistrictId,
          isSameAddress: currentAddrIsSame ? AddressTypeEnum.ID_CARD : null,
        },
      ],
    };
  };

  const onSaveDraft = (type?: 'image') => {
    const payload = buildDraftPayload();

    if (type === 'image') {
      handleUpdateDraftImage(payload);
    } else {
      handleUpdateDraft({ payload });
    }
  };

  const renderLabelByStatus = (status: string) => {
    switch (status) {
      case KycStatus.NONE:
        return (
          <BadgeLabel
            prefix={<i className="ri-information-line text-error"></i>}
            variant="ghost"
            color="error"
            text="ยังไม่ยืนยันตัวตน"
            rounding="pill"
          />
        );
      case KycStatus.WAIT_FOR_APPROVE:
        return (
          <BadgeLabel
            prefix={<i className="ri-information-line text-warning"></i>}
            variant="ghost"
            color="warning"
            text="รอการอนุมัติ"
            rounding="pill"
          />
        );
      case KycStatus.REQUEST_MORE:
        return (
          <BadgeLabel
            prefix={<i className="ri-draft-line text-info"></i>}
            variant="ghost"
            color="info"
            text="ขอข้อมูลเพิ่มเติม"
            rounding="pill"
          />
        );
      case KycStatus.APPROVE:
        return (
          <BadgeLabel
            prefix={<i className="ri-verified-badge-line text-success"></i>}
            variant="ghost"
            color="success"
            text="ยืนยันตัวตนแล้ว"
            rounding="pill"
          />
        );
      case KycStatus.REJECT:
        return (
          <BadgeLabel
            prefix={<i className="ri-close-line text-error"></i>}
            variant="ghost"
            color="error"
            text="ไม่ได้รับการอนุมัติ"
            rounding="pill"
          />
        );
      default:
        return (
          <BadgeLabel
            prefix={<i className="ri-information-line text-error"></i>}
            variant="ghost"
            color="error"
            text="ยังไม่ยืนยันตัวตน"
            rounding="pill"
          />
        );
    }
  };

  const isDisabled = userKyc?.kycStatus === KycStatus.WAIT_FOR_APPROVE;

  if (isLoadingUserKyc || isFetching) {
    return (
      <div className="min-h-[300px] flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="w-full bg-white px-0 py-0 md:py-6 md:px-4 rounded-xl">
      {confirmPopup}
      <Form layout="vertical" form={userKycForm} scrollToFirstError>
        <div className="flex flex-col">
          {userKyc?.kycStatus === KycStatus.REJECT && (
            <Alert
              message={
                <div className="flex gap-2">
                  <i className="ri-file-info-line text-xl text-error"></i>
                  <div className="flex flex-col">
                    <Typography variant="paragraph-medium" className="!font-medium">
                      คำขอยืนยันตัวตนผู้ใช้งานไม่ได้รับการอนุมัติ
                    </Typography>
                    <Typography variant="paragraph-small">
                      โปรดตรวจสอบรายละเอียดและเอกสารที่คุณส่งอีกครั้ง
                    </Typography>
                    <div className="w-fit">
                      <CustomButton
                        variant="link"
                        color="error"
                        className="!p-0"
                        onClick={() => setIsOpenRejectReason(true)}
                      >
                        ดูเหตุผล
                      </CustomButton>
                    </div>
                  </div>
                </div>
              }
              type="error"
              className="!mb-5"
            />
          )}
          {userKyc?.kycStatus === KycStatus.REQUEST_MORE && (
            <Alert
              message={
                <div className="flex gap-2">
                  <i className="ri-file-info-line text-xl text-error"></i>
                  <div className="flex flex-col">
                    <Typography variant="paragraph-medium" className="!font-medium">
                      ขอข้อมูลยืนยันตัวตนผู้ใช้งานเพิ่มเติมเพื่อพิจารณาอนุมัติ
                    </Typography>
                    <Typography variant="paragraph-small">
                      โปรดตรวจสอบรายละเอียดและเอกสารที่คุณส่งอีกครั้ง
                    </Typography>
                    <div className="w-fit">
                      <CustomButton
                        variant="link"
                        color="error"
                        className="!p-0"
                        onClick={() => setIsOpenRejectReason(true)}
                      >
                        ดูเหตุผล
                      </CustomButton>
                    </div>
                  </div>
                </div>
              }
              type="error"
              className="!mb-5"
            />
          )}
          {/* Status Section */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-3 md:col-span-1">
              <Typography variant="paragraph-medium" className="!text-text-secondary !font-medium">
                สถานะยืนยันตัวตน
              </Typography>
              <Typography variant="paragraph-medium" className="!text-text-quarternary">
                โปรดยืนยันตัวตนของคุณ เพื่อให้สามารถใช้งานครบทุกฟังก์ชัน
              </Typography>
            </div>
            <div className="col-span-3 md:col-span-2">
              <div className="w-fit">
                {renderLabelByStatus(userKyc?.kycStatus || KycStatus.NONE)}
              </div>
            </div>
          </div>

          <Divider className="!my-5 md:!my-6" />

          {/* Profile Picture Section */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-3 md:col-span-1">
              <Typography variant="paragraph-medium" className="!text-text-secondary !font-medium">
                รูปโปรไฟล์
              </Typography>
              <Typography variant="paragraph-medium" className="!text-text-quarternary">
                รูปโปรไฟล์ช่วยให้คู่ค้าและทีมงานภายในองค์กร สามารถจดจำคุณได้ง่ายขึ้น
              </Typography>
            </div>
            <div className="col-span-3 md:col-span-2">
              <Form.Item name="image" className="!mb-0">
                <UploadProfile
                  name="image"
                  file={profilePic}
                  setFile={(files) => {
                    userKycForm.setFieldValue('image', files);
                    setProfilePic(files);
                    // Only save draft when all files are done uploading or list is empty (deleted)
                    const isStillUploading = files.some((f) => f.status === 'uploading');
                    if (!isStillUploading) {
                      onSaveDraft('image');
                    }
                  }}
                  label="รูปโปรไฟล์"
                  maxCount={1}
                  maxSize={10}
                  attachType="IMAGE_PROFILE"
                  form={{
                    formInstance: userKycForm,
                    key: 'image',
                  }}
                  disabled={isDisabled}
                />
              </Form.Item>
            </div>
          </div>

          <Divider className="!my-5 md:!my-6" />

          {/* Personal Info Section */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-3 md:col-span-1">
              <Typography variant="paragraph-medium" className="!text-text-secondary !font-medium">
                ข้อมูลส่วนตัว
              </Typography>
              <Typography variant="paragraph-medium" className="!text-text-quarternary">
                โปรดกรอกชื่อตามบัตรประชาชนหรือเอกสารทางราชการ
              </Typography>
            </div>
            <div className="col-span-3 md:col-span-2">
              <div className="flex flex-col gap-2 md:gap-4">
                <TextField
                  label="ชื่อ (ภาษาไทย)"
                  name="firstNameTh"
                  placeholder="กรอกชื่อ (ภาษาไทย)"
                  required
                  disabled={isDisabled}
                  rules={[
                    { required: true, message: 'กรุณากรอกชื่อ (ภาษาไทย)' },
                    { max: 50, message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด' },
                    { pattern: /^[ก-๙\s]+$/, message: 'กรุณากรอกเฉพาะภาษาไทย' },
                  ]}
                />
                <TextField
                  label="ชื่อกลาง (ภาษาไทย)"
                  name="middleNameTh"
                  placeholder="กรอกชื่อกลาง (ภาษาไทย)"
                  disabled={isDisabled}
                  rules={[{ pattern: /^[ก-๙\s]*$/, message: 'กรุณากรอกเฉพาะภาษาไทย' }]}
                />
                <TextField
                  label="นามสกุล (ภาษาไทย)"
                  name="lastNameTh"
                  placeholder="กรอกนามสกุล (ภาษาไทย)"
                  required
                  disabled={isDisabled}
                  rules={[
                    { required: true, message: 'กรุณากรอกนามสกุล (ภาษาไทย)' },
                    { pattern: /^[ก-๙\s]+$/, message: 'กรุณากรอกเฉพาะภาษาไทย' },
                  ]}
                />

                <Divider className="!my-4 md:!my-1" />

                <TextField
                  label="ชื่อ (ภาษาอังกฤษ)"
                  name="firstNameEn"
                  placeholder="กรอกชื่อ (ภาษาอังกฤษ)"
                  required
                  disabled={isDisabled}
                  rules={[
                    { required: true, message: 'กรุณากรอกชื่อ (ภาษาอังกฤษ)' },
                    {
                      pattern: /^[a-zA-Z\s]+$/,
                      message: 'กรุณากรอกเฉพาะภาษาอังกฤษ',
                    },
                  ]}
                />
                <TextField
                  label="ชื่อกลาง (ภาษาอังกฤษ)"
                  name="middleNameEn"
                  placeholder="กรอกชื่อกลาง (ภาษาอังกฤษ)"
                  disabled={isDisabled}
                  rules={[
                    {
                      pattern: /^[a-zA-Z\s]*$/,
                      message: 'กรุณากรอกเฉพาะภาษาอังกฤษ',
                    },
                  ]}
                />
                <TextField
                  label="นามสกุล (ภาษาอังกฤษ)"
                  name="lastNameEn"
                  placeholder="กรอกนามสกุล (ภาษาอังกฤษ)"
                  required
                  disabled={isDisabled}
                  rules={[
                    {
                      required: true,
                      message: 'กรุณากรอกนามสกุล (ภาษาอังกฤษ)',
                    },
                    {
                      pattern: /^[a-zA-Z\s]+$/,
                      message: 'กรุณากรอกเฉพาะภาษาอังกฤษ',
                    },
                  ]}
                />

                <Divider className="!my-4 md:!my-1" />

                {/* ID Card with Check Button */}
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue, getFieldError }) => {
                    const isErrorIdCard = getFieldError('idCard').length > 0;
                    return (
                      <div className="flex gap-2 items-end">
                        <div className="w-full">
                          <TextField
                            name="idCard"
                            label="เลขประจำตัวประชาชน"
                            placeholder="กรุณากรอกเลขประจำตัวประชาชน"
                            disabled={isDisabled}
                            maxLength={13}
                            type="numberOnly"
                            onChange={(e) => {
                              if (e.target.value !== userKyc?.idCard) {
                                setIsSuccessCheckIdCard(false);
                              } else {
                                setIsSuccessCheckIdCard(true);
                              }
                            }}
                            rules={[
                              {
                                required: true,
                                message: 'กรุณากรอกเลขประจำตัวประชาชน',
                              },
                              {
                                validator: (_: unknown, value: string) => {
                                  if (!idCardCheck(value) && value) {
                                    return Promise.reject('เลขประจำตัวประชาชนไม่ถูกต้อง');
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          />
                        </div>
                        <div
                          className={isErrorIdCard && !isSuccessCheckIdCard ? 'pb-[22px]' : 'pb-0'}
                        >
                          <CustomButton
                            name="checkIdCard"
                            variant="outlined"
                            onClick={() => {
                              const value = getFieldValue('idCard');
                              if (!idCardCheck(value) || value?.length !== 13) {
                                userKycForm.setFields([
                                  {
                                    name: 'idCard',
                                    errors: ['เลขประจำตัวประชาชนไม่ถูกต้อง'],
                                  },
                                ]);
                                return;
                              }
                              handleCheckIdCard();
                            }}
                            disabled={
                              isErrorIdCard ||
                              isSuccessCheckIdCard ||
                              !getFieldValue('idCard') ||
                              getFieldValue('idCard')?.length !== 13
                            }
                            loading={isLoadingIdCard}
                          >
                            {isSuccessCheckIdCard ? 'ยืนยันแล้ว' : 'ตรวจสอบ'}
                          </CustomButton>
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>

                <Divider className="!my-4 md:!my-1" />

                <RadioGroup
                  label="เพศ"
                  name="gender"
                  disabled={isDisabled}
                  options={[
                    { label: 'ชาย', value: Gender.MALE },
                    { label: 'หญิง', value: Gender.FEMALE },
                    { label: 'ไม่ระบุ', value: Gender.NOT_SPECIFIED },
                  ]}
                  rules={[{ required: true, message: 'กรุณาเลือกเพศ' }]}
                />

                <RadioGroup
                  label="สถานภาพสมรส"
                  name="maritalStatus"
                  disabled={isDisabled}
                  options={[
                    { label: 'โสด', value: MaritalStatus.CELIBATE },
                    { label: 'แต่งงาน', value: MaritalStatus.MARRIED },
                    { label: 'หม้าย', value: MaritalStatus.WIDOWED },
                    { label: 'หย่าร้าง', value: MaritalStatus.DIVORCED },
                  ]}
                  rules={[{ required: true, message: 'กรุณาเลือกสถานภาพสมรส' }]}
                />

                <Divider className="!my-4 md:!my-1" />

                <DatePicker
                  label="วัน / เดือน / ปีเกิด"
                  name="birthDate"
                  required
                  placeholder="เลือกวันเกิด"
                  disabled={isDisabled}
                  inputReadOnly
                  defaultPickerValue={dayjs().subtract(18, 'year')}
                  disabledDate={(current) => {
                    if (!current) return false;
                    const eighteenYearsAgo = dayjs().subtract(18, 'year');
                    return current.isAfter(eighteenYearsAgo);
                  }}
                />
              </div>
            </div>
          </div>

          <Divider className="!my-5 md:!my-6" />

          {/* Contact Info Section */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-3 md:col-span-1">
              <Typography variant="paragraph-medium" className="!text-text-secondary !font-medium">
                ข้อมูลติดต่อ
              </Typography>
              <Typography variant="paragraph-medium" className="!text-text-quarternary">
                คุณสามารถแก้ไขข้อมูลติดต่อได้ที่นี้
              </Typography>
            </div>
            <div className="col-span-3 md:col-span-2">
              <div className="flex flex-col gap-2 md:gap-4">
                {/* Tel with Check Button */}
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue, getFieldError }) => {
                    const isErrorTel = getFieldError('tel').length > 0;
                    return (
                      <div className="flex gap-2 items-end">
                        <div className="w-full">
                          <TextField
                            name="tel"
                            label="เบอร์มือถือ"
                            placeholder="กรุณากรอกเบอร์มือถือ"
                            disabled={isDisabled}
                            maxLength={10}
                            type="tel"
                            onChange={(e) => {
                              const telValue =
                                !userKyc?.tel?.startsWith('0') && userKyc?.tel?.length === 9
                                  ? '0' + userKyc.tel
                                  : userKyc?.tel;
                              if (e.target.value !== telValue) {
                                setIsCheckTelNumber(false);
                              } else {
                                setIsCheckTelNumber(true);
                              }
                            }}
                            rules={[
                              {
                                required: true,
                                message: 'กรุณากรอกเบอร์โทรศัพท์',
                              },
                              {
                                pattern: /^0[689]\d{8}$/,
                                message: 'กรุณากรอกเบอร์มือถือที่ถูกต้อง',
                              },
                            ]}
                          />
                        </div>
                        <div className={isErrorTel && !isCheckTelNumber ? 'pb-[22px]' : 'pb-0'}>
                          <CustomButton
                            name="checkTelNumber"
                            variant="outlined"
                            onClick={() => handleCheckTelNumber()}
                            disabled={
                              isErrorTel ||
                              isCheckTelNumber ||
                              !getFieldValue('tel') ||
                              getFieldValue('tel')?.length !== 10
                            }
                            loading={isLoadingCheckPhone}
                          >
                            {isCheckTelNumber ? 'ยืนยันแล้ว' : 'ตรวจสอบ'}
                          </CustomButton>
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>

                {/* Email with Check Button */}
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue, getFieldError }) => {
                    const isErrorEmail = getFieldError('email').length > 0;
                    return (
                      <div className="flex gap-2 items-end">
                        <div className="w-full">
                          <TextField
                            name="email"
                            label="อีเมล"
                            placeholder="กรุณากรอกอีเมล"
                            disabled={isDisabled}
                            onChange={(e) => {
                              if (e.target.value !== userKyc?.email) {
                                setIsCheckEmail(false);
                              } else {
                                setIsCheckEmail(true);
                              }
                            }}
                            rules={[
                              { required: true, message: 'กรุณากรอกอีเมล' },
                              {
                                type: 'email',
                                message: 'กรุณากรอกอีเมลที่ถูกต้อง',
                              },
                            ]}
                          />
                        </div>
                        <div className={isErrorEmail && !isCheckEmail ? 'pb-[22px]' : 'pb-0'}>
                          <CustomButton
                            name="checkEmail"
                            variant="outlined"
                            onClick={() => handleCheckEmailMutation()}
                            disabled={isErrorEmail || isCheckEmail || !getFieldValue('email')}
                            loading={isLoadingCheckEmailAll}
                          >
                            {isCheckEmail ? 'ยืนยันแล้ว' : 'ตรวจสอบ'}
                          </CustomButton>
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>
              </div>
            </div>
          </div>

          <Divider className="!my-5 md:!my-6" />

          {/* Address Section */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-3 md:col-span-1">
              <Typography variant="paragraph-medium" className="!text-text-secondary !font-medium">
                ข้อมูลที่อยู่
              </Typography>
              <Typography variant="paragraph-medium" className="!text-text-quarternary">
                คุณสามารถแก้ไขข้อมูลที่อยู่ได้ที่นี้
              </Typography>
            </div>
            <div className="col-span-3 md:col-span-2">
              <Form.List name="draftUserAddresses">
                {(fields) => (
                  <>
                    {[...fields]
                      .sort((a, b) => {
                        const formAddresses = userKycForm.getFieldValue('draftUserAddresses') || [];
                        const typeA = formAddresses[a.name]?.addressType;
                        const typeB = formAddresses[b.name]?.addressType;
                        if (typeA === AddressTypeEnum.ID_CARD) return -1;
                        if (typeB === AddressTypeEnum.ID_CARD) return 1;
                        return 0;
                      })
                      .map((field) => {
                        const formAddresses = userKycForm.getFieldValue('draftUserAddresses') || [];
                        const addressType = formAddresses[field.name]?.addressType;
                        const isSameAddress = userKycForm.getFieldValue([
                          'draftUserAddresses',
                          field.name,
                          'isSameAddress',
                        ]);
                        return (
                          <div
                            key={field.key}
                            className="mb-4 p-4 border border-border-secondary rounded-lg"
                          >
                            <div className="flex flex-col gap-4">
                              <Typography
                                variant="paragraph-medium"
                                className="!text-text-secondary"
                              >
                                {addressType === AddressTypeEnum.ID_CARD
                                  ? 'ที่อยู่ตามบัตรประชาชน'
                                  : 'ที่อยู่ปัจจุบัน'}
                              </Typography>
                              {addressType === AddressTypeEnum.CURRENT && (
                                <Form.Item name={[field.name, 'isSameAddress']} className="!mb-0">
                                  <ToggleSwitch
                                    type="text"
                                    isChecked={!!isSameAddress}
                                    showLabel={false}
                                    title="ใช้ที่อยู่ตามบัตรประชาชน"
                                    isDisabled={isDisabled}
                                    onChange={(checked) => {
                                      if (checked) {
                                        const idCardAddressData = userKycForm
                                          .getFieldValue('draftUserAddresses')
                                          ?.find(
                                            (addr: IDraftUserAddress) =>
                                              addr.addressType === AddressTypeEnum.ID_CARD
                                          );

                                        if (idCardAddressData) {
                                          userKycForm.setFieldValue(
                                            ['draftUserAddresses', field.name, 'address'],
                                            idCardAddressData.address
                                          );
                                          userKycForm.setFieldValue(
                                            ['draftUserAddresses', field.name, 'countryId'],
                                            idCardAddressData.countryId
                                          );
                                        }

                                        setCurrentAddress(idCardAddress);
                                        setSearchCurrentAddressText(searchIdCardAddressText);
                                      }

                                      userKycForm.setFieldValue(
                                        ['draftUserAddresses', field.name, 'isSameAddress'],
                                        checked ? AddressTypeEnum.ID_CARD : null
                                      );
                                    }}
                                  />
                                </Form.Item>
                              )}
                              <Form.Item shouldUpdate noStyle>
                                {({ getFieldValue }) => {
                                  const isSameAddr = getFieldValue([
                                    'draftUserAddresses',
                                    field.name,
                                    'isSameAddress',
                                  ]);
                                  if (isSameAddr) return null;
                                  return (
                                    <>
                                      <div className="flex flex-wrap gap-2">
                                        <Select
                                          label="ประเทศ"
                                          name={[field.name, 'countryId']}
                                          placeholder="เลือกประเทศ"
                                          options={countryOptions}
                                          required
                                          disabled={isDisabled}
                                          rules={[
                                            {
                                              required: true,
                                              message: 'กรุณาเลือกประเทศ',
                                            },
                                          ]}
                                          className="scroll-mt-10"
                                        />

                                        <Form.Item
                                          className="!mb-0 w-[calc(100%_-_144px)] !scroll-mt-10"
                                          label={
                                            <div className="flex gap-1 items-center">
                                              <Typography
                                                variant="paragraph-small"
                                                className="!text-text-secondary"
                                              >
                                                ที่อยู่
                                              </Typography>
                                              <span className="text-error">*</span>
                                            </div>
                                          }
                                          help={
                                            addressType === AddressTypeEnum.ID_CARD &&
                                            (errorIdCardAddress ||
                                              (!idCardAddress &&
                                                (wasDirtyIdCardAddress ||
                                                  isFocusedIdCardAddress))) ? (
                                              <div className="text-error">
                                                {searchIdCardAddressText
                                                  ? 'กรุณาเลือกที่อยู่ให้ถูกต้อง'
                                                  : 'กรุณากรอกที่อยู่'}
                                              </div>
                                            ) : addressType === AddressTypeEnum.CURRENT &&
                                              (errorCurrentAddress ||
                                                (!currentAddress &&
                                                  (wasDirtyCurrentAddress ||
                                                    isFocusedCurrentAddress))) ? (
                                              <div className="text-error">
                                                {searchCurrentAddressText
                                                  ? 'กรุณาเลือกที่อยู่ให้ถูกต้อง'
                                                  : 'กรุณากรอกที่อยู่'}
                                              </div>
                                            ) : (
                                              ''
                                            )
                                          }
                                        >
                                          <AutoComplete
                                            data-testid={`user-${
                                              addressType === AddressTypeEnum.ID_CARD
                                                ? 'id-card'
                                                : 'current'
                                            }-address`}
                                            className="w-full"
                                            size="large"
                                            placeholder="ค้นหาจังหวัด, อำเภอ/เขต, แขวง/ตำบล, รหัสไปรษณีย์"
                                            allowClear
                                            disabled={isDisabled}
                                            value={
                                              addressType === AddressTypeEnum.ID_CARD
                                                ? searchIdCardAddressText
                                                : searchCurrentAddressText
                                            }
                                            status={
                                              addressType === AddressTypeEnum.ID_CARD &&
                                              (errorIdCardAddress ||
                                                (!idCardAddress &&
                                                  (wasDirtyIdCardAddress ||
                                                    isFocusedIdCardAddress)))
                                                ? 'error'
                                                : addressType === AddressTypeEnum.CURRENT &&
                                                    (errorCurrentAddress ||
                                                      (!currentAddress &&
                                                        (wasDirtyCurrentAddress ||
                                                          isFocusedCurrentAddress)))
                                                  ? 'error'
                                                  : ''
                                            }
                                            onSearch={(text) => {
                                              if (addressType === AddressTypeEnum.ID_CARD) {
                                                if (!text && searchIdCardAddressText) {
                                                  setWasDirtyIdCardAddress(true);
                                                  setIdCardAddress(null);
                                                }
                                                setSearchIdCardAddressText(text);
                                              } else {
                                                if (!text && searchCurrentAddressText) {
                                                  setWasDirtyCurrentAddress(true);
                                                  setCurrentAddress(null);
                                                }
                                                setSearchCurrentAddressText(text);
                                              }
                                            }}
                                            onClear={() => {
                                              if (addressType === AddressTypeEnum.ID_CARD) {
                                                if (idCardAddress) {
                                                  setWasDirtyIdCardAddress(true);
                                                }
                                                setSearchIdCardAddressText('');
                                                setIdCardAddress(null);
                                              } else {
                                                if (currentAddress) {
                                                  setWasDirtyCurrentAddress(true);
                                                }
                                                setSearchCurrentAddressText('');
                                                setCurrentAddress(null);
                                              }
                                            }}
                                            onFocus={() => {
                                              if (addressType === AddressTypeEnum.ID_CARD) {
                                                setIsFocusedIdCardAddress(true);
                                              } else {
                                                setIsFocusedCurrentAddress(true);
                                              }
                                            }}
                                            onBlur={() => {
                                              handleBlurAddress(addressType as AddressTypeEnum);
                                            }}
                                            onSelect={(_, option) => {
                                              handleSelectAddress(
                                                option as ILocationOption,
                                                addressType as AddressTypeEnum
                                              );
                                            }}
                                            options={
                                              addressType === AddressTypeEnum.ID_CARD
                                                ? idCardAddressOptions
                                                : currentAddressOptions
                                            }
                                            notFoundContent={
                                              (addressType === AddressTypeEnum.ID_CARD &&
                                                searchIdCardAddressText &&
                                                idCardAddressOptions.length === 0) ||
                                              (addressType === AddressTypeEnum.CURRENT &&
                                                searchCurrentAddressText &&
                                                currentAddressOptions.length === 0) ? (
                                                <div className="text-center py-4 text-text-disabled">
                                                  ไม่พบที่อยู่ที่ค้นหา
                                                </div>
                                              ) : null
                                            }
                                          />
                                        </Form.Item>
                                      </div>
                                      <TextField
                                        name={[field.name, 'address']}
                                        label="เลขที่"
                                        placeholder="บ้านเลขที่, ซอย, หมู่, ถนน"
                                        required
                                        disabled={isDisabled}
                                        rules={[
                                          {
                                            required: true,
                                            message: 'กรุณากรอกเลขที่',
                                          },
                                        ]}
                                        className="scroll-mt-10"
                                        maxLength={255}
                                      />
                                    </>
                                  );
                                }}
                              </Form.Item>
                            </div>
                          </div>
                        );
                      })}
                  </>
                )}
              </Form.List>
            </div>
          </div>

          <Divider className="!my-5 md:!my-6" />

          {/* Business Type Section */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-3 md:col-span-1">
              <Typography variant="paragraph-medium" className="!text-text-secondary !font-medium">
                ข้อมูลส่วนบุคคลทั่วไป
              </Typography>
              <Typography variant="paragraph-medium" className="!text-text-quarternary">
                ใช้เพื่อเสนอเนื้อหาเฉพาะสำหรับคุณ
              </Typography>
            </div>
            <div className="col-span-3 md:col-span-2">
              <Form.Item name="businessType" label="ท่านมีส่วนเกี่ยวข้องทำธุรกิจด้านใด?">
                <TreeSelect
                  size="large"
                  placeholder="เลือกประเภทธุรกิจ"
                  treeData={businessTypeOptions}
                  multiple
                  treeCheckable
                  allowClear
                  maxTagCount="responsive"
                  treeDefaultExpandAll
                  disabled={isDisabled}
                />
              </Form.Item>
            </div>
          </div>

          <Divider className="!my-5 md:!my-6" />

          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-3 md:col-span-1">
              <Typography variant="paragraph-medium" className="!text-text-secondary !font-medium">
                เอกสารยืนยันตัวตน
              </Typography>
              <Typography variant="paragraph-medium" className="!text-text-quarternary">
                แนบเอกสารยืนยันตัวตน
              </Typography>
            </div>
            <div className="col-span-3 md:col-span-2">
              <div className="flex flex-col gap-5">
                <Alert
                  message={
                    <div className="flex gap-2">
                      <i className="ri-file-text-line text-xl text-warning"></i>
                      <div className="flex flex-col">
                        <Typography variant="paragraph-medium" className="!font-medium">
                          คำแนะนำ
                        </Typography>
                        <Typography variant="paragraph-small">
                          *เอกสารสำเนาต้องเซ็นรับรองสำเนาถูกต้องเท่านั้น
                        </Typography>
                        <Typography variant="paragraph-small">
                          *รูปถ่ายบัตรประชาชน และลายเซ็นอิเล็กทรอนิกส์ไม่สามารถใช้ได้
                        </Typography>
                        <Typography variant="paragraph-small">
                          *รูปภาพควรเห็นข้อมูลบนบัตรครบถ้วนและชัดเจน
                        </Typography>
                        <Typography variant="paragraph-small">
                          *รูปภาพไม่เบลอ และไม่มีแสงสะท้อนบังข้อมูลสำคัญ
                        </Typography>
                      </div>
                    </div>
                  }
                  type="warning"
                  className="!mt-4"
                />
                <Form.Item
                  name={['files', 'ID_CARD_FRONT']}
                  rules={[
                    {
                      required: true,
                      message: 'กรุณาแนบไฟล์รูปหน้าบัตรประชาชน',
                    },
                  ]}
                  className="!mb-0 !scroll-mt-10"
                >
                  <UploadFileDragger
                    name="idCard"
                    label="รูปหน้าบัตรประชาชน"
                    file={files.ID_CARD_FRONT}
                    setFile={(files) => {
                      setFiles((prev) => ({
                        ...prev,
                        ID_CARD_FRONT: files,
                      }));
                    }}
                    form={{
                      key: ['files', 'ID_CARD_FRONT'],
                      formInstance: userKycForm,
                    }}
                    disabled={isDisabled}
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']}
                    acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                    description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
                    required
                    cisFileType={DocumentType.ID_CARD_FRONT}
                    exampleSrc="/assets/idcard.svg"
                    maxCount={1}
                  />
                </Form.Item>
                <Form.Item
                  name={['files', 'ID_CARD_WITH_PERSON']}
                  rules={[
                    {
                      required: true,
                      message: 'กรุณาแนบไฟล์ภาพของท่านกับบัตรประชาชน',
                    },
                  ]}
                  className="!mb-0 !scroll-mt-10"
                >
                  <UploadFileDragger
                    name="idCardWithPerson"
                    label="ภาพถ่ายของท่านคู่กับบัตรประชาชน"
                    file={files.ID_CARD_WITH_PERSON}
                    setFile={(files) =>
                      setFiles((prev) => ({
                        ...prev,
                        ID_CARD_WITH_PERSON: files,
                      }))
                    }
                    form={{
                      key: ['files', 'ID_CARD_WITH_PERSON'],
                      formInstance: userKycForm,
                    }}
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']}
                    disabled={isDisabled}
                    acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                    description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
                    required
                    cisFileType={DocumentType.ID_CARD_WITH_PERSON}
                    exampleSrc="/assets/idcard-person.svg"
                    maxCount={1}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
          <Divider className="!my-5 md:!my-6" />
        </div>

        {/* Fixed Bottom Actions */}
        <div className="bg-white fixed bottom-0 w-full inset-x-0 py-4 z-10">
          <div className="container mx-auto px-4 md:px-0 gap-2 flex justify-end">
            <CustomButton
              name="saveDraft"
              variant="outlined"
              bold="600"
              loading={isLoadingUpdateDraft || isLoadingUpdateDraftImage}
              onClick={() => onSaveDraft()}
            >
              บันทึกร่าง
            </CustomButton>
            <CustomButton
              name="submit"
              bold="600"
              disabled={!isSuccessCheckIdCard || !isCheckTelNumber || !isCheckEmail || isDisabled}
              onClick={() => {
                userKycForm
                  .validateFields()
                  .then(() => {
                    if (!idCardAddress) {
                      setErrorIdCardAddress(true);
                      return;
                    }
                    if (!currentAddress) {
                      setErrorCurrentAddress(true);
                      return;
                    }

                    showConfirm({
                      type: 'confirm',
                      title: 'ยืนยันการส่งคำขออนุมัติ',
                      detail: 'ระบบจะทำการส่งข้อมูลเพื่อเข้าสู่กระบวนการตรวจสอบ',
                      onConfirm: async () => {
                        try {
                          const payload = buildDraftPayload();
                          await handleUpdateDraftAsync({
                            payload,
                            silent: true,
                          });
                          handleSubmitKyc();
                        } catch {
                          // Draft save failed — error handled by mutation onError
                        }
                      },
                      confirmText: 'ส่งคำขอ',
                    });
                  })
                  .catch(() => {
                    if (!idCardAddress) setErrorIdCardAddress(true);
                    if (!currentAddress) setErrorCurrentAddress(true);
                  });
              }}
              loading={isLoadingSubmitKyc}
            >
              ส่งคำขอยืนยันตัวตน
            </CustomButton>
          </div>
        </div>
      </Form>

      {/* OTP Popups */}
      <PopupOtp
        visible={isOpenOtpPopup}
        onClose={() => setIsOpenOtpPopup(false)}
        otpData={otpData}
        telNumber={otpTelNumber}
        onFinish={handleOtpTelSuccess}
        resendOtp={() => handleResendOtp()}
      />
      <PopupOtp
        visible={isOpenOtpPopupEmail}
        onClose={() => setIsOpenOtpPopupEmail(false)}
        otpData={otpData}
        email={otpEmail}
        onFinish={handleOtpEmailSuccess}
        resendOtp={() => handleResendOtpEmail()}
      />
      <PopupComponent />
      <ResponsivePopup
        visible={isOpenRejectReason}
        onClose={() => {
          setIsOpenRejectReason(false);
        }}
        modalProps={{
          width: '800px',
        }}
        drawerProps={{
          destroyOnClose: true,
          styles: {
            body: {
              padding: '16px',
            },
            header: {
              padding: '16px',
            },
          },
        }}
        drawerTitle={
          <div className={`flex justify-between items-start`}>
            <div>
              <Typography variant="h4" className="!text-text-primary !font-semibold">
                {userKyc?.kycStatus === KycStatus.REJECT
                  ? 'การยืนยันตัวตนของคุณยังไม่ผ่านการอนุมัติ'
                  : 'การยืนยันตัวตนของคุณต้องการข้อมูลเพิ่มเติม'}
              </Typography>
              <Typography variant="paragraph-medium" className="!text-text-tertiary">
                โปรดแก้ไขข้อมูลเพื่อดำเนินการขอยืนยันตัวตนอีกครั้ง
              </Typography>
            </div>
            <CustomButton
              onClick={() => {
                setIsOpenRejectReason(false);
              }}
              variant="outlined"
              className="!px-0"
              color="neutral"
            >
              <i className="ri-close-line"></i>
            </CustomButton>
          </div>
        }
      >
        <div>
          {!isMobile && (
            <>
              <Typography variant="h4" className="!text-text-primary !font-semibold">
                {userKyc?.kycStatus === KycStatus.REJECT
                  ? 'การยืนยันตัวตนของคุณยังไม่ผ่านการอนุมัติ'
                  : 'การยืนยันตัวตนของคุณต้องการข้อมูลเพิ่มเติม'}
              </Typography>
              <Typography variant="paragraph-medium" className="!text-text-tertiary">
                โปรดแก้ไขข้อมูลเพื่อดำเนินการขอยืนยันตัวตนอีกครั้ง
              </Typography>
            </>
          )}
          <div className="mt-0 md:mt-4 px-4 py-6 bg-background-secondary rounded-xl">
            {userProfile?.remarkKyc}
          </div>
        </div>
      </ResponsivePopup>
    </div>
  );
};

export default ProfileKycForm;
