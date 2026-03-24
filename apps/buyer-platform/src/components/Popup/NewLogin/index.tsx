'use client';

import React, { useCallback } from 'react';
import { Grid } from 'antd';
import Cookies from 'js-cookie';

// Components
import Button from '../../Button';
import FormLogin from '../../Form/Login';
import FormOtp from '../../Form/Otp';
import FormRegister from '../../Form/Register';
import FormSetPassword from '../../Form/SetPassword';
import SectionIcon from '../../Sections/SectionIcon';
import Typography from '../../Typography';
import ErrorPopup from '../Error';
import ResponsivePopup from '../index';
import PopupConsent from '../Consent';

// Step Components
import { SetProfileStep, SetOrganizationStep } from './steps';

// Hooks
import { useNotification } from '@/hooks/notification.hook';
import { useAuthFlow } from './hooks/useLoginState';
import {
  useCheckRegister,
  useSendToken,
  useVerifyOtp,
  useLoginOtp,
  useLoginWithUsername,
  useRegisterAccount,
  useRegisterAccountAndUser,
  useRegisterUserProfile,
  useRegisterOrganizationProfile,
  useSendConsent,
  useSendOrganizationConsent,
  useGetUserProfileByPhone,
} from './hooks/useAuthMutations';

// Types & Constants
import {
  PopupNewLoginProps,
  Step,
  ApiErrorResponse,
  ProfileFormFields,
  OrganizationFormFields,
} from './types';
import {
  DEFAULT_COUNTRY_CODE,
  PLATFORM,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './constants';
import { RegisterOrganizationProfileRequest } from '@/common/api/customer-service/register.api';
import { OrganizationTypes } from '@/common/enum/organization.enum';
import { getAllConsentMessages } from '@/common/api/customer-service/consent-message.api';
import { checkEmail } from '@/common/api/customer-service/user.api';
import { createOrganizationAddress } from '@/common/api/customer-service/organization.api';
import { redirectToIntendedPath } from '@/utils/auth';
import { RegisterCode } from '@/common/enum/register.enum';

const PopupNewLogin: React.FC<PopupNewLoginProps> = ({ visible, onClose }) => {
  const { notification } = useNotification();
  const { useBreakpoint } = Grid;
  const screen = useBreakpoint();
  const isMobile = !screen.sm;

  // ===== State Management =====
  const { state, forms, actions, utils } = useAuthFlow();
  const {
    loginForm,
    registerForm,
    otpForm,
    passwordForm,
    profileForm,
    organizationForm,
  } = forms;

  // ===== Error State =====
  const [isErrorVisible, setIsErrorVisible] = React.useState(false);
  const [statusCode, setStatusCode] = React.useState<number | null>(null);

  // ===== Consent State =====
  const [isOpenConsent, setIsOpenConsent] = React.useState(false);
  const [createOrgValue, setCreateOrgValue] =
    React.useState<OrganizationFormFields | null>(null);

  // ===== Mutations =====
  const checkRegisterMutation = useCheckRegister();
  const sendTokenMutation = useSendToken();
  const verifyOtpMutation = useVerifyOtp();
  const loginOtpMutation = useLoginOtp();
  const loginWithUsernameMutation = useLoginWithUsername();
  const registerAccountMutation = useRegisterAccount();
  const registerAccountAndUserMutation = useRegisterAccountAndUser();
  const registerUserProfileMutation = useRegisterUserProfile();
  const registerOrganizationProfileMutation = useRegisterOrganizationProfile();
  const sendConsentMutation = useSendConsent();
  const sendOrganizationConsentMutation = useSendOrganizationConsent();
  const getUserProfileByPhoneMutation = useGetUserProfileByPhone();

  // ===== Loading State =====
  const isLoading =
    checkRegisterMutation.isPending ||
    sendTokenMutation.isPending ||
    verifyOtpMutation.isPending ||
    loginOtpMutation.isPending ||
    loginWithUsernameMutation.isPending ||
    registerAccountMutation.isPending ||
    registerAccountAndUserMutation.isPending ||
    registerUserProfileMutation.isPending ||
    registerOrganizationProfileMutation.isPending ||
    sendConsentMutation.isPending ||
    sendOrganizationConsentMutation.isPending ||
    getUserProfileByPhoneMutation.isPending;

  // ===== Error Handlers =====
  const handleBlockUntil = useCallback(
    (blockUntil: string) => {
      const countdownSeconds = utils.calculateBlockTime(blockUntil);
      actions.setBlockInfo({
        isBlocked: true,
        countdownTime: countdownSeconds,
      });
    },
    [utils, actions]
  );

  const handleApiError = useCallback(
    (error: ApiErrorResponse) => {
      const errorData = error.response?.data?.data;
      if (errorData?.blockUntil) {
        handleBlockUntil(errorData.blockUntil);
        return true;
      }

      const errorStatusCode = error.response?.status || 500;
      setStatusCode(errorStatusCode);
      setIsErrorVisible(true);
      return false;
    },
    [handleBlockUntil]
  );

  const handleOtpError = useCallback(
    (error: ApiErrorResponse) => {
      const errorData = error.response?.data?.data;
      // Handle remaining attempts
      if (errorData?.remaining && errorData.remaining > 0) {
        otpForm.setFields([
          {
            name: 'otp',
            errors: [ERROR_MESSAGES.OTP_INVALID(errorData.remaining)],
          },
        ]);
        return;
      }
      if (errorData?.data?.remaining && errorData.data?.remaining > 0) {
        otpForm.setFields([
          {
            name: 'otp',
            errors: [ERROR_MESSAGES.OTP_INVALID(errorData.data.remaining)],
          },
        ]);
        return;
      }

      // Handle block case - similar to b2c
      if (errorData?.blockUntil || errorData?.data?.blockUntil) {
        const countdownSeconds = utils.calculateBlockTime(
          errorData?.blockUntil || '' || errorData?.data?.blockUntil || ''
        );
        actions.goToBlocked(countdownSeconds);
        return;
      }

      // Handle other errors
      handleApiError(error);
    },
    [otpForm, utils, actions, handleApiError]
  );

  // ===== Step 1: Login Handler =====
  const handleLogin = useCallback(
    async (values: {
      phoneNumber?: string;
      username?: string;
      password?: string;
    }) => {
      // Handle phone number login
      if (values.phoneNumber) {
        const formattedPhone = utils.formatPhoneNumber(values.phoneNumber);
        const payload = {
          phoneNumber: formattedPhone,
          countryCode: DEFAULT_COUNTRY_CODE,
        };

        try {
          const { data, statusCode } =
            await checkRegisterMutation.mutateAsync(payload);

          if (statusCode === 200) {
            if (data.code !== RegisterCode.CHECK_PHONE_DOES_NOT_EXISTS) {
              // Phone exists, send OTP for login
              try {
                const { data: tokenData } =
                  await sendTokenMutation.mutateAsync(payload);

                if (tokenData.status === 'success') {
                  actions.setPhoneNumber(values.phoneNumber);
                  actions.setOtpData({
                    token: tokenData?.token || '',
                    refNo: tokenData?.refno || '',
                  });
                  actions.goToOtp();
                }
              } catch (error) {
                handleOtpError(error as ApiErrorResponse);
              }
            } else {
              // Phone not registered
              loginForm.setFields([
                {
                  name: 'phoneNumber',
                  errors: [ERROR_MESSAGES.PHONE_NOT_REGISTERED],
                },
              ]);
            }
          } else {
            setStatusCode(statusCode);
            setIsErrorVisible(true);
          }
        } catch (error) {
          handleApiError(error as ApiErrorResponse);
        }
      }
      // Handle username/password login
      else if (values.username && values.password) {
        try {
          const username = values.username.startsWith('0')
            ? utils.formatPhoneNumber(values.username)
            : values.username;
          const data = await loginWithUsernameMutation.mutateAsync({
            username,
            password: values.password,
          });

          if (data?.data?.accessToken) {
            // Get user profile by phone
            const payload = values.username.startsWith('0')
              ? { countryCode: DEFAULT_COUNTRY_CODE, phoneNumber: username }
              : {
                  countryCode: DEFAULT_COUNTRY_CODE,
                  email: username,
                  phoneNumber: '',
                };
            const userProfileData =
              await getUserProfileByPhoneMutation.mutateAsync(payload);

            const registerStep = userProfileData.data.user.registerStep;
            const registerStatus = userProfileData.data.user.registerStatus;

            if (
              registerStatus === 'IN_PROGRESS' &&
              registerStep === 'REGISTER'
            ) {
              // Incomplete profile, start complete-profile flow
              actions.startCompleteProfileFlow(data.data.accessToken);
              actions.setPhoneNumber(data.data.phoneNumber);
              profileForm.setFieldsValue({
                telNumber: data.data.phoneNumber,
                consentMarketing: true,
              });
            } else if (
              registerStatus === 'IN_PROGRESS' &&
              registerStep === 'USER_INFO'
            ) {
              // User info completed, start organization flow
              actions.startCompleteOrganizationFlow(data.data.accessToken);
              actions.setPhoneNumber(data.data.phoneNumber);
            } else {
              // Login success
              notification.success({
                message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
                duration: 3,
                icon: <i className="ri-information-line text-primary"></i>,
              });
              Cookies.set('auth', JSON.stringify(data.data));
              handleClose();
              redirectToIntendedPath();
            }
          }
        } catch (error: any) {
          // Handle login errors
          if (error.response?.data?.code === 'AKM_ERR002') {
            if (
              error.response?.data?.message.includes('Invalid username format')
            ) {
              loginForm.setFields([
                {
                  name: 'username',
                  errors: [
                    'ชื่อผู้ใช้ต้องเป็นอีเมลหรือหมายเลขโทรศัพท์ที่เริ่มต้นด้วย 0',
                  ],
                },
                {
                  name: 'password',
                  errors: [''],
                },
              ]);
            } else if (
              error.response?.data?.message.includes('password must contain')
            ) {
              loginForm.setFields([
                {
                  name: 'password',
                  errors: ['ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'],
                },
              ]);
            }
          } else if (error.response?.data?.code === 'AKM_ERR003') {
            loginForm.setFields([
              {
                name: 'username',
                errors: ['ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'],
              },
              {
                name: 'password',
                errors: [''],
              },
            ]);
          } else {
            handleApiError(error as ApiErrorResponse);
          }
        }
      }
    },
    [
      utils,
      checkRegisterMutation,
      sendTokenMutation,
      actions,
      loginForm,
      handleApiError,
      notification,
    ]
  );

  // ===== Step 2: Register Handler =====
  const handleSendTokenError = useCallback(
    (error: ApiErrorResponse) => {
      const errorData = error.response?.data?.data;
      if (errorData?.blockUntil || errorData?.data?.blockUntil) {
        const countdownSeconds = utils.calculateBlockTime(
          errorData?.blockUntil || '' || errorData?.data?.blockUntil || ''
        );
        actions.goToBlocked(countdownSeconds);
      } else {
        handleApiError(error);
      }
    },
    [handleBlockUntil, handleApiError]
  );

  const handleRegister = useCallback(
    async (values: { phoneNumber: string }) => {
      const formattedPhone = utils.formatPhoneNumber(values.phoneNumber);
      const payload = {
        phoneNumber: formattedPhone,
        countryCode: DEFAULT_COUNTRY_CODE,
      };

      try {
        const { data, statusCode } =
          await checkRegisterMutation.mutateAsync(payload);

        if (statusCode === 200) {
          if (data.code !== RegisterCode.CHECK_PHONE_DOES_NOT_EXISTS) {
            // Phone already registered
            registerForm.setFields([
              {
                name: 'phoneNumber',
                errors: [ERROR_MESSAGES.PHONE_ALREADY_REGISTERED],
              },
            ]);
          } else {
            // Phone not registered, send OTP
            try {
              const { data: tokenData } =
                await sendTokenMutation.mutateAsync(payload);
              if (tokenData.status === 'success') {
                actions.setPhoneNumber(values.phoneNumber);
                actions.setOtpData({
                  token: tokenData?.token || '',
                  refNo: tokenData?.refno || '',
                });
                actions.goToOtp();
              } else if (tokenData?.blockUntil) {
                handleBlockUntil(tokenData.blockUntil);
              }
            } catch (error) {
              handleSendTokenError(error as ApiErrorResponse);
            }
          }
        } else {
          setStatusCode(statusCode);
          setIsErrorVisible(true);
        }
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    },
    [
      utils,
      checkRegisterMutation,
      sendTokenMutation,
      actions,
      registerForm,
      handleBlockUntil,
      handleSendTokenError,
      handleApiError,
    ]
  );

  // ===== Step 3: OTP Handler =====
  const handleSendOtp = useCallback(
    async (values: { otp: string }) => {
      const formattedPhone = utils.formatPhoneNumber(state.phoneNumber || '');

      if (utils.isLoginFlow()) {
        // Login OTP verification
        const payload = {
          countryCode: DEFAULT_COUNTRY_CODE,
          phoneNumber: formattedPhone,
          pin: values.otp,
          token: state.otpData.token,
        };

        try {
          const data = await loginOtpMutation.mutateAsync(payload);
          if (data?.data?.accessToken) {
            // Get user profile by phone
            const userProfileData =
              await getUserProfileByPhoneMutation.mutateAsync({
                countryCode: DEFAULT_COUNTRY_CODE,
                phoneNumber: formattedPhone,
              });

            const registerStep = userProfileData.data.user.registerStep;
            const registerStatus = userProfileData.data.user.registerStatus;
            if (
              registerStatus === 'IN_PROGRESS' &&
              registerStep === 'REGISTER'
            ) {
              // Incomplete profile, start complete-profile flow
              actions.startCompleteProfileFlow(data.data.accessToken);
              profileForm.setFieldsValue({
                telNumber: state.phoneNumber || '',
                consentMarketing: true,
              });
            } else if (
              registerStatus === 'IN_PROGRESS' &&
              registerStep === 'USER_INFO'
            ) {
              // User info completed, start organization flow
              actions.startCompleteOrganizationFlow(data.data.accessToken);
            } else {
              notification.success({
                message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
                duration: 3,
                icon: <i className="ri-information-line text-primary"></i>,
              });
              Cookies.set('auth', JSON.stringify(data.data));
              handleClose();
              redirectToIntendedPath();
            }
          }
        } catch (error) {
          handleOtpError(error as ApiErrorResponse);
        }
      } else {
        // Register OTP verification
        const payload = {
          otp: values.otp,
          token: state.otpData.token,
          phoneNumber: formattedPhone,
          countryCode: DEFAULT_COUNTRY_CODE,
        };

        try {
          const { data } = await verifyOtpMutation.mutateAsync(payload);

          if (data) {
            if (data?.remaining > 0) {
              otpForm.setFields([
                {
                  name: 'otp',
                  errors: [ERROR_MESSAGES.OTP_INVALID(data.remaining)],
                },
              ]);
            } else if (data.status !== 'success') {
              if (data.blockUntil) {
                const countdownSeconds = utils.calculateBlockTime(
                  data.blockUntil
                );
                actions.goToBlocked(countdownSeconds);
              } else {
                setStatusCode(500);
                setIsErrorVisible(true);
              }
            } else {
              actions.goToSetPassword();
            }
          }
        } catch (error) {
          handleOtpError(error as ApiErrorResponse);
        }
      }
    },
    [
      utils,
      state,
      loginOtpMutation,
      getUserProfileByPhoneMutation,
      verifyOtpMutation,
      notification,
      otpForm,
      actions,
      handleOtpError,
      handleApiError,
    ]
  );

  // ===== Resend OTP =====
  const handleResendOtp = useCallback(async () => {
    actions.setResendOtpSuccess(false);
    otpForm.resetFields();
    const formattedPhone = utils.formatPhoneNumber(state.phoneNumber || '');
    const payload = {
      phoneNumber: formattedPhone,
      countryCode: DEFAULT_COUNTRY_CODE,
    };

    try {
      const { data } = await sendTokenMutation.mutateAsync(payload);

      if (!data.statusCode) {
        actions.setOtpData({
          token: data?.token || '',
          refNo: data?.refno || '',
        });
        actions.setResendOtpSuccess(true);
      } else {
        setStatusCode(data?.statusCode);
        setIsErrorVisible(true);
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  }, [
    utils,
    state.phoneNumber,
    sendTokenMutation,
    actions,
    otpForm,
    handleApiError,
  ]);

  // ===== Step 4: Set Password Handler =====
  const handleSetPassword = useCallback(
    async (values: { password: string; confirmPassword: string }) => {
      const formattedPhone = utils.formatPhoneNumber(state.phoneNumber || '');

      try {
        const response = await registerAccountAndUserMutation.mutateAsync({
          phoneNumber: formattedPhone,
          countryCode: DEFAULT_COUNTRY_CODE,
          password: values.password,
          isSeller: false,
        });

        if (response?.data) {
          actions.setAccessToken(response.data.accessToken);
          profileForm.setFieldsValue({
            telNumber: state.phoneNumber || '',
            consentMarketing: true,
          });
          actions.goToSetProfile();
        }
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    },
    [
      utils,
      state.phoneNumber,
      registerAccountAndUserMutation,
      actions,
      handleApiError,
    ]
  );

  // ===== Step 5: Set Profile Handler =====
  const handleSetProfile = useCallback(
    async (values: ProfileFormFields) => {
      const formattedPhone = utils.formatPhoneNumber(state.phoneNumber || '');

      try {
        // Step 0: Check if email already exists
        if (values.email) {
          const emailCheckResult = await checkEmail({ email: values.email });
          if (emailCheckResult?.data?.exists === true) {
            profileForm.setFields([
              {
                name: 'email',
                errors: ['อีเมลนี้ถูกใช้งานแล้ว'],
              },
            ]);
            return;
          }
        }

        // Step 1: Register User Profile
        const { data: profileData } =
          await registerUserProfileMutation.mutateAsync({
            payload: {
              phoneNumber: formattedPhone,
              countryCode: DEFAULT_COUNTRY_CODE,
              userInfo: {
                firstName: values.firstName || '',
                midName: values.midName || '',
                lastName: values.lastName || '',
                email: values.email || '',
              },
              platform: PLATFORM,
            },
            accessToken: state.accessToken || '',
          });

        if (profileData?.cisNumber) {
          // Step 2: Get consent list and send consent
          const consentList = await getAllConsentMessages([
            'terms_of_service',
            'privacy_policy',
            'marketing_consent',
          ]);

          // Filter out marketing_consent if consentMarketing is false
          const filteredConsentList = values.consentMarketing
            ? consentList.data
            : consentList.data.filter(
                (consent: any) => consent.type !== 'marketing_consent'
              );

          const consentIds = filteredConsentList.map(
            (consent: any) => consent.id
          );
          const akIdConsentIds = filteredConsentList.map(
            (consent: any) => consent.akIdConsentId
          );

          const consentPayload = {
            phoneNumber: formattedPhone,
            countryCode: DEFAULT_COUNTRY_CODE,
            consentIds: consentIds as number[],
            akIdConsentIds: akIdConsentIds as string[],
          };

          const { data: consentResponseData } =
            await sendConsentMutation.mutateAsync(consentPayload);
          if (
            consentResponseData?.message === 'User consent saved successfully'
          ) {
            organizationForm.setFieldsValue({
              accountType: 'PERSONAL',
            });
            actions.goToSetOrganization();
          }
        } else {
          throw new Error('User profile registration failed');
        }
      } catch (error) {
        // console.log(error.response.data.code)
        handleApiError(error as ApiErrorResponse);
      }
    },
    [
      utils,
      state,
      registerUserProfileMutation,
      sendConsentMutation,
      actions,
      handleApiError,
    ]
  );

  // ===== Step 6: Set Organization Handler =====
  const handleSetOrganization = useCallback(
    async (values: OrganizationFormFields) => {
      // Check if need to show consent popup
      if (
        values.accountType === OrganizationTypes.REGISTERED_INDIVIDUAL ||
        values.accountType === OrganizationTypes.JURISTIC
      ) {
        setIsOpenConsent(true);
        setCreateOrgValue(values);
      } else {
        // Personal account type - submit directly without consent
        try {
          await handleSubmitConsent(
            {
              acceptConsent: false,
              acceptMarketing: false,
              consents: [],
            },
            values
          );
        } catch (error) {
          handleApiError(error as ApiErrorResponse);
        }
      }
    },
    [handleApiError]
  );

  // ===== Submit Consent Handler =====
  const handleSubmitConsent = useCallback(
    async (
      consentData: {
        acceptConsent: boolean;
        acceptMarketing: boolean;
        consents: any[];
      },
      values: OrganizationFormFields
    ) => {
      const formattedPhone = utils.formatPhoneNumber(state.phoneNumber || '');

      const consentIds = consentData.consents
        .filter((consent) => {
          if (
            !consentData.acceptMarketing &&
            consent.type === 'marketing_consent'
          ) {
            return false;
          }
          return true;
        })
        .map((consent) => consent.id);
      try {
        // Use accessToken from state if in complete-profile flow
        let accessToken: string = state.accessToken || '';
        let dataRegisterAccount: any = null;

        // If not in complete-profile flow, register account first
        if (!accessToken) {
          // Step 1: Register Account
          const { data: accountData } =
            await registerAccountMutation.mutateAsync({
              phoneNumber: formattedPhone,
              countryCode: DEFAULT_COUNTRY_CODE,
              password: state.password,
            });

          if (accountData.isSuccess !== 'SUCCESS') {
            throw new Error('Account registration failed');
          }

          accessToken = accountData?.accessToken || '';
          dataRegisterAccount = accountData;

          // Step 2: Register User Profile
          const profileValues = profileForm.getFieldsValue();
          const { data: profileData } =
            await registerUserProfileMutation.mutateAsync({
              payload: {
                phoneNumber: accountData.phoneNumber,
                countryCode: DEFAULT_COUNTRY_CODE,
                userInfo: {
                  firstName: profileValues.firstName || '',
                  lastName: profileValues.lastName || '',
                },
                platform: PLATFORM,
              },
              accessToken,
            });

          if (!profileData?.cisNumber) {
            throw new Error('User profile registration failed');
          }
        }

        // Step 3: Register Organization Profile
        const orgPayload: RegisterOrganizationProfileRequest = {
          countryCode: DEFAULT_COUNTRY_CODE,
          phoneNumber: formattedPhone,
          orgType:
            (values.accountType as OrganizationTypes) ||
            OrganizationTypes.PERSONAL,
          orgPersonalInfo:
            values.accountType === OrganizationTypes.PERSONAL
              ? {
                  idCard: values.idCard || '',
                  acceptTerms: values.consent ? true : false,
                  businessType: [],
                }
              : undefined,
          orgIndividualInfo:
            values.accountType === OrganizationTypes.REGISTERED_INDIVIDUAL
              ? {
                  registrationName: values.registrationName || '',
                  businessType: values.businessType || [],
                  businessTypeDescription: values.businessTypeDescription || '',
                  registrationNumber: values.registrationNumber || '',
                  acceptTerms: values.consent ? true : false,
                  idCard: values.idCard || '',
                }
              : undefined,
          orgJuristicInfo:
            values.accountType === OrganizationTypes.JURISTIC
              ? {
                  juristicName: values.juristicName || '',
                  businessType: values.businessType || [],
                  taxId: values.taxId || '',
                  juristicType: (values.juristicType as string) || '',
                  remarkTypeOther: values.remarkTypeOther || '',
                  juristicTypeId: values.juristicTypeId || 0,
                  branchType: (values.branchType as string) || '',
                  branchNumber: values.branchNumber || '',
                  branchName: values.branchName || '',
                  acceptTerms: values.consent ? true : false,
                  businessTypeDescription: values.businessTypeDescription || '',
                }
              : undefined,
        };

        const orgResponse =
          await registerOrganizationProfileMutation.mutateAsync({
            payload: orgPayload,
            accessToken: accessToken || '',
          });

        if (orgResponse.statusCode !== 201) {
          throw new Error('Organization profile registration failed');
        }

        // Step 3.5: Create Organization Address for JURISTIC (if DBD data exists)
        if (
          values.accountType === OrganizationTypes.JURISTIC &&
          values.dbdAddress &&
          values.taxId
        ) {
          try {
            const addressPayload = {
              taxId: values.taxId,
              address: values.dbdAddress.address || '',
              subDistrictId: Number(values.dbdAddress.subDistrictId || ''),
              districtId: Number(values.dbdAddress.districtId || ''),
              provinceId: Number(values.dbdAddress.provinceId || ''),
              zipCode: values.dbdAddress.zipCode
                ? Number(values.dbdAddress.zipCode) || ''
                : '',
              countryId: 1,
            };
            await createOrganizationAddress(addressPayload);
          } catch (error) {
            handleApiError(error as ApiErrorResponse);
            return;
          }
        }

        const organizationId =
          values.accountType === OrganizationTypes.REGISTERED_INDIVIDUAL
            ? orgResponse.data.organizations.find(
                (org: any) =>
                  org.organization.registrationNumber ===
                  values.registrationNumber
              )?.organizeId
            : values.accountType === OrganizationTypes.PERSONAL
              ? orgResponse.data.organizations.find(
                  (org: any) => org.organization.idCard === values.idCard
                )?.organizeId
              : orgResponse.data.organizations.find(
                  (org: any) => org.organization.taxId === values.taxId
                )?.organizeId;
        if (!organizationId) {
          throw new Error('Organization ID not returned');
        }

        // Step 4: Send Organization Consent (skip for PERSONAL accounts)
        if (values.accountType !== OrganizationTypes.PERSONAL) {
          const akIdConsentIds = consentData.consents
            .filter((consent) => {
              if (
                !consentData.acceptMarketing &&
                consent.type === 'marketing_consent'
              ) {
                return false;
              }
              return true;
            })
            .map((consent) => consent.akIdConsentId);

          const { data: consentResponseData } =
            await sendOrganizationConsentMutation.mutateAsync({
              organizationId: organizationId as number,
              consentIds: consentIds as number[],
              ...(akIdConsentIds.length > 0 &&
                akIdConsentIds.every((id) => typeof id === 'string') && {
                  akIdConsentIds: akIdConsentIds as string[],
                  tokenAllkonsId:
                    dataRegisterAccount?.akidAccessToken as string,
                }),
            });

          if (consentResponseData?.status === 'success') {
            setIsOpenConsent(false);
            // Reset all forms before going to success
            loginForm.resetFields();
            registerForm.resetFields();
            otpForm.resetFields();
            passwordForm.resetFields();
            profileForm.resetFields();
            organizationForm.resetFields();
            actions.goToSuccess();
          }
        } else {
          // For PERSONAL accounts, skip consent API and go directly to success
          setIsOpenConsent(false);
          // Reset all forms before going to success
          loginForm.resetFields();
          registerForm.resetFields();
          otpForm.resetFields();
          passwordForm.resetFields();
          profileForm.resetFields();
          organizationForm.resetFields();
          actions.goToSuccess();
        }
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    },
    [
      utils,
      state,
      profileForm,
      registerAccountMutation,
      registerUserProfileMutation,
      registerOrganizationProfileMutation,
      sendConsentMutation,
      sendOrganizationConsentMutation,
      actions,
      handleApiError,
    ]
  );

  // ===== Close Handler =====
  const handleClose = useCallback(() => {
    actions.resetState();
    onClose();
  }, [actions, onClose]);

  // ===== Can Go Back =====
  const canGoBack = utils.canGoBack();

  // ===== Back Navigation Handler =====
  const handleBack = useCallback(() => {
    actions.goBack();
  }, [actions]);

  return (
    <>
      <ErrorPopup
        visible={isErrorVisible}
        onClose={() => setIsErrorVisible(false)}
        statusCode={statusCode}
      />
      <ResponsivePopup
        visible={visible}
        onClose={handleClose}
        modalTitle={
          <>
            {(canGoBack || state.blockInfo.isBlocked) && (
              <Button
                variant="outlined"
                color="neutral"
                onClick={handleBack}
                icon={<i className="ri-arrow-left-s-line text-xl"></i>}
              />
            )}
          </>
        }
        drawerTitle={
          <div
            className={`flex ${canGoBack || state.blockInfo.isBlocked ? 'justify-between' : 'justify-end'}`}
          >
            {(canGoBack || state.blockInfo.isBlocked) && (
              <Button
                variant="outlined"
                color="neutral"
                onClick={handleBack}
                icon={<i className="ri-arrow-left-s-line text-xl"></i>}
              />
            )}
            <Button
              onClick={handleClose}
              variant="outlined"
              className="!px-0"
              color="neutral"
            >
              <i className="ri-close-line"></i>
            </Button>
          </div>
        }
        modalProps={{
          width: 960,
          centered: true,
          destroyOnHidden: true,
        }}
        drawerProps={{
          height: '90%',
          destroyOnClose: true,
        }}
      >
        <div className="h-full sm:h-[600px] flex justify-center items-center w-full overflow-hidden">
          <div className="relative w-full h-full md:mt-0 block sm:flex justify-center items-center overflow-hidden">
            {/* Login Flow - Step 1: Login Form */}
            <div
              className={`absolute w-full h-full block sm:flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(
                Step.LOGIN
              )}`}
            >
              <FormLogin
                onFinish={handleLogin}
                loading={isLoading}
                onRegisterClick={actions.startRegisterFlow}
                loginForm={loginForm}
              />
            </div>

            {/* Register Flow - Step 1: Register Form */}
            <div
              className={`absolute w-full h-full block md:flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(
                Step.REGISTER
              )}`}
            >
              <FormRegister
                onFinish={handleRegister}
                loading={isLoading}
                onLoginClick={actions.startLoginFlow}
                registerForm={registerForm}
              />
            </div>

            {/* Both Flows - OTP Verification */}
            <div
              className={`absolute w-full h-full block md:flex overflow-auto justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(
                Step.OTP
              )}`}
            >
              <FormOtp
                otpForm={otpForm}
                otpData={state.otpData}
                onFinish={handleSendOtp}
                telNumber={state.phoneNumber}
                loading={isLoading}
                resendOtp={handleResendOtp}
                isSuccessResendOtp={state.isSuccessResendOtp}
              />
            </div>

            {/* Register Flow - Step 3: Set Password */}
            <div
              className={`absolute w-full h-full block md:flex justify-center items-start transition-transform duration-500 ease-in-out ${utils.getTransformClass(
                Step.SET_PASSWORD
              )}`}
            >
              <FormSetPassword
                passwordForm={passwordForm}
                onFinish={handleSetPassword}
                loading={isLoading}
              />
            </div>

            {/* Register Flow - Step 4: Set Profile */}
            <div
              className={`absolute w-full h-full block md:flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(
                Step.SET_PROFILE
              )}`}
            >
              <SetProfileStep
                profileForm={profileForm}
                onFinish={handleSetProfile}
                loading={isLoading}
                telNumber={state.phoneNumber || ''}
              />
            </div>

            {/* Register Flow - Step 5: Set Organization */}
            <div
              className={`absolute w-full h-full block md:flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(
                Step.SET_ORGANIZATION
              )}`}
            >
              <SetOrganizationStep
                organizationForm={organizationForm}
                onFinish={handleSetOrganization}
                loading={isLoading}
              />
            </div>

            {/* Blocked State */}
            <div
              className={`absolute w-full h-full block md:flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(
                Step.BLOCKED
              )}`}
            >
              <div className="flex flex-col h-full w-full gap-6 items-center justify-center">
                <SectionIcon iconClass="ri-lock-password-fill" type="error" />
                <div className="text-center">
                  <Typography variant="h5" className="!text-text-secondary">
                    {ERROR_MESSAGES.OTP_BLOCKED_TITLE}
                  </Typography>
                  <Typography
                    variant="paragraph-medium"
                    className="!text-text-secondary"
                  >
                    กรุณารอ{' '}
                    <span className="!text-error mr-1">
                      (
                      {utils.formatCountdownTime(state.blockInfo.countdownTime)}{' '}
                      นาที)
                    </span>
                    {ERROR_MESSAGES.OTP_BLOCKED_MESSAGE}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Success State */}
            <div
              className={`absolute w-full h-full block md:flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(
                Step.SUCCESS
              )}`}
            >
              <div className="flex flex-col h-full w-full items-center justify-center">
                <SectionIcon type="success" />
                <div className="text-center mt-5">
                  <Typography variant="h2" className="!text-text-primary">
                    {SUCCESS_MESSAGES.REGISTER_SUCCESS_TITLE}
                  </Typography>
                  <Typography
                    variant="paragraph-big"
                    className="!text-gray-light !mt-2 !font-normal"
                  >
                    {SUCCESS_MESSAGES.REGISTER_SUCCESS_MESSAGE}
                  </Typography>
                </div>
                <div className="flex flex-col-reverse md:flex-row justify-center items-center gap-3 mt-5 pt-8 w-full">
                  <Button
                    variant="outlined"
                    color="neutral"
                    icon={<i className="ri-home-6-line"></i>}
                    onClick={handleClose}
                    fullWidth={isMobile}
                  >
                    กลับหน้าหลัก
                  </Button>
                  <Button
                    variant="solid"
                    color="primary"
                    onClick={() => {
                      actions.startLoginFlow();
                    }}
                    fullWidth={isMobile}
                  >
                    เข้าสู่ระบบ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePopup>
      <PopupConsent
        visible={isOpenConsent}
        onClose={() => setIsOpenConsent(false)}
        onSubmitConsent={(dataVal) => {
          if (createOrgValue) {
            handleSubmitConsent(dataVal, createOrgValue);
          }
        }}
      />
    </>
  );
};

export default PopupNewLogin;
