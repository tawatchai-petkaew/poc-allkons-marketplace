'use client';

import { FC, useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import FormLogin from './components/FormLogin';
import FormOtp from './components/FormOtp';
import FormRegister from './components/FormRegister';
import FormSetPassword from './components/FormSetPassword';
import { SetProfileStep, SetOrganizationStep } from './components/steps';
import SectionIcon from '@/components/Section/SectionIcon';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import PopupConsent from '@/components/Popup/Consent';
import MerchantFormModal from '../(auth)/organizations/create/components/MerchantFormModal';
import usePopup from '@/hooks/usePopup';

import { useAuthFlow } from '@/hooks/useLoginState';
import { useAuth } from '@/hooks/useAuth';
import {
  useCheckRegister,
  useSendToken,
  useVerifyOtp,
  useLoginOtp,
  useLoginWithUsername,
  useRegisterAccountAndUser,
  useRegisterUserProfile,
  useRegisterOrganizationProfile,
  useGetUserProfileByPhone,
  useSendConsent,
  useSendOrganizationConsent,
} from '@/hooks/useAuthMutations';

import {
  Step,
  PhoneFormFields,
  PhoneRegisterFormFields,
  OtpFormFields,
  PasswordFormFields,
  ProfileFormFields,
  OrganizationFormFields,
  ApiErrorResponse,
  ExistingOrganization,
} from './types';
import { DEFAULT_COUNTRY_CODE, ERROR_MESSAGES, SUCCESS_MESSAGES, PLATFORM } from './constants';
import {
  IAuthOrganization,
  ResponseCheckPhoneNumberCode,
} from '@/interfaces/auth/auth.response.interface';
import { OrganizationType } from '../../constants/enum/organization.enum';
import { routes } from '../../constants/routing.constants';
import { useUserStore } from '@/store/user.store';
import { checkEmail, checkPlatform } from '@/api/user.api';
import { getAllConsents } from '@/api/consent.api';
import { createMerchant } from '@/api/merchant.api';
import { createOrganizationAddress } from '@/api/organization.api';
import { useMutation } from '@tanstack/react-query';
import { IConsentResponse } from '@/interfaces/consent/consent.response.interface';

const LoginPage: FC = () => {
  const router = useRouter();
  const { state, forms, actions, utils } = useAuthFlow();
  const { loginForm, registerForm, otpForm, passwordForm, profileForm, organizationForm } = forms;
  const { setUser: setStoreUser } = useUserStore();
  const { setSession, loading: authLoading } = useAuth();
  const { showPopup, PopupComponent } = usePopup();

  // Consent state
  const [isOpenConsent, setIsOpenConsent] = useState(false);
  const [createOrgValue, setCreateOrgValue] = useState<OrganizationFormFields | null>(null);

  // Login error alert state
  const [loginErrorMessage, setLoginErrorMessage] = useState<string>('');

  // Merchant state
  const [isOpenMerchantModal, setIsOpenMerchantModal] = useState(false);
  const [merchantOrgData, setMerchantOrgData] = useState<IAuthOrganization | null>(null);
  const [merchantUserInfo, setMerchantUserInfo] = useState<{
    firstName: string;
    lastName: string;
    username: string;
  } | null>(null);

  // Mutations
  const checkRegisterMutation = useCheckRegister();
  const sendTokenMutation = useSendToken();
  const verifyOtpMutation = useVerifyOtp();
  const loginOtpMutation = useLoginOtp();
  const loginWithUsernameMutation = useLoginWithUsername();
  const registerAccountAndUserMutation = useRegisterAccountAndUser();
  const registerUserProfileMutation = useRegisterUserProfile();
  const registerOrganizationProfileMutation = useRegisterOrganizationProfile();
  const getUserProfileByPhoneMutation = useGetUserProfileByPhone();
  const sendConsentMutation = useSendConsent();
  const sendOrganizationConsentMutation = useSendOrganizationConsent();

  // Merchant mutation
  const createMerchantMutation = useMutation({
    mutationFn: createMerchant,
  });

  const isLoading =
    authLoading ||
    checkRegisterMutation.isPending ||
    sendTokenMutation.isPending ||
    verifyOtpMutation.isPending ||
    loginOtpMutation.isPending ||
    loginWithUsernameMutation.isPending ||
    registerAccountAndUserMutation.isPending ||
    registerUserProfileMutation.isPending ||
    registerOrganizationProfileMutation.isPending ||
    getUserProfileByPhoneMutation.isPending ||
    sendConsentMutation.isPending ||
    sendOrganizationConsentMutation.isPending ||
    createMerchantMutation.isPending;

  // ===== Error Handlers =====
  const handleApiError = useCallback(
    (error: ApiErrorResponse) => {
      const errorData = error.response?.data?.data;
      if (errorData?.blockUntil) {
        const countdownSeconds = utils.calculateBlockTime(errorData.blockUntil);
        actions.goToBlocked(countdownSeconds);
        return true;
      }

      const errorStatusCode = error.response?.status || 500;
      showPopup('error', {
        statusCode: errorStatusCode,
        showConfirm: true,
      });
      return false;
    },
    [utils, actions, showPopup]
  );

  const handleOtpError = useCallback(
    (error: ApiErrorResponse) => {
      const errorData = error.response?.data?.data;

      // Handle remaining attempts (check both nesting levels)
      const remaining = errorData?.remaining || errorData?.data?.remaining;
      if (remaining && remaining > 0) {
        otpForm.setFields([
          {
            name: 'otp',
            errors: [ERROR_MESSAGES.OTP_INVALID(remaining)],
          },
        ]);
        return;
      }

      // Handle block case (check both nesting levels)
      const blockUntil = errorData?.blockUntil || errorData?.data?.blockUntil;
      if (blockUntil) {
        const countdownSeconds = utils.calculateBlockTime(blockUntil);
        actions.goToBlocked(countdownSeconds);
        return;
      }

      // Handle other errors
      handleApiError(error);
    },
    [otpForm, utils, actions, handleApiError]
  );

  const handleSendTokenError = useCallback(
    (error: ApiErrorResponse) => {
      const errorData = error.response?.data?.data;
      // Check for blockUntil at different nesting levels
      const blockUntil = errorData?.blockUntil || errorData?.data?.blockUntil;
      if (blockUntil) {
        const countdownSeconds = utils.calculateBlockTime(blockUntil);
        actions.goToBlocked(countdownSeconds);
      } else {
        handleApiError(error);
      }
    },
    [utils, actions, handleApiError]
  );

  // ===== Step 1: Login Handler ===
  const handleLogin = useCallback(
    async (values: PhoneFormFields) => {
      // Handle phone number login
      if (values.phoneNumber) {
        const formattedPhone = utils.formatPhoneNumber(values.phoneNumber);
        const payload = {
          phoneNumber: formattedPhone,
          countryCode: DEFAULT_COUNTRY_CODE,
        };

        try {
          const response = await checkRegisterMutation.mutateAsync(payload);

          if (response.statusCode === 200) {
            if (response.data?.code !== ResponseCheckPhoneNumberCode.CHECK_PHONE_DOES_NOT_EXISTS) {
              // Phone exists, send OTP for login
              try {
                const tokenResponse = await sendTokenMutation.mutateAsync(payload);

                if (tokenResponse.data?.status === 'success') {
                  actions.setPhoneNumber(values.phoneNumber);
                  actions.setOtpData({
                    token: tokenResponse.data?.token || '',
                    refNo: tokenResponse.data?.refno || '',
                  });
                  actions.goToOtp();
                }
              } catch (error) {
                handleSendTokenError(error as ApiErrorResponse);
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
            showPopup('error', {
              title: 'เกิดข้อผิดพลาด',
              description: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
              showConfirm: true,
            });
          }
        } catch (error) {
          handleApiError(error as ApiErrorResponse);
        }
      }
      // Handle username/password login
      else if (values.username && values.password) {
        setLoginErrorMessage('');
        try {
          const username = values.username.startsWith('0')
            ? utils.formatPhoneNumber(values.username)
            : values.username;
          const response = await loginWithUsernameMutation.mutateAsync({
            username,
            password: values.password,
          });

          if (response?.data?.accessToken) {
            // Get user profile by phone
            const userPayload = values.username.startsWith('0')
              ? { countryCode: DEFAULT_COUNTRY_CODE, phoneNumber: username }
              : {
                  countryCode: DEFAULT_COUNTRY_CODE,
                  email: username,
                  phoneNumber: '',
                };
            const userProfileData = await getUserProfileByPhoneMutation.mutateAsync(userPayload);

            const registerStep = userProfileData.data?.user?.registerStep;
            const registerStatus = userProfileData.data?.user?.registerStatus;

            if (registerStatus === 'IN_PROGRESS' && registerStep === 'REGISTER') {
              // Incomplete profile, start complete-profile flow
              actions.startCompleteProfileFlow({
                accessToken: response.data.accessToken,
                authCenter: response.data.authCenter,
              });
              actions.setPhoneNumber(userProfileData.data?.user?.phoneNumber || '');
              profileForm.setFieldsValue({
                telNumber: userProfileData.data?.user?.phoneNumber || '',
                consentMarketing: true,
              });
            } else if (registerStatus === 'IN_PROGRESS' && registerStep === 'USER_INFO') {
              // User info completed, start organization flow
              actions.startCompleteOrganizationFlow({
                accessToken: response.data.accessToken,
                authCenter: response.data.authCenter,
              });
              actions.setPhoneNumber(userProfileData.data?.user?.phoneNumber || '');
            } else if (registerStatus === 'IN_PROGRESS' && registerStep === 'ORG_INFO') {
              const userUuid = userProfileData.data?.user?.uuid;

              if (userUuid) {
                const platformCheck = await checkPlatform(userUuid);

                // Filter organizations by type
                const registeredIndividualOrgs =
                  userProfileData.data?.organizations.filter(
                    (org) => org.organization.organizationType === 'REGISTERED_INDIVIDUAL'
                  ) || [];

                const juristicOrgs =
                  userProfileData.data?.organizations.filter(
                    (org) => org.organization.organizationType === 'JURISTIC'
                  ) || [];

                // Map to ExistingOrganization format with "สร้างองค์กรใหม่" first
                const registeredIndividualOrgItem = [
                  {
                    organizationId: 0,
                    organizationUuid: '',
                    organizeName: 'สร้างองค์กรใหม่',
                    organizationType: 'REGISTERED_INDIVIDUAL',
                    taxId: null,
                    cisNumber: '',
                    organizeBranchType: '',
                  },
                  ...registeredIndividualOrgs.map((org) => ({
                    organizationId: org.organization.id,
                    organizationUuid: org.organization.uuid,
                    organizeName: org.organization.organizeName,
                    organizationType: org.organization.organizationType,
                    taxId: org.organization.taxId,
                    cisNumber: org.organization.cisNumber,
                    organizeBranchType: org.organization.organizeBranchType,
                    businessType: org.organization.businessType,
                    idCard: org.organization.idCard,
                    registrationNumber: org.organization.registrationNumber,
                    branchNumber: org.organization.branchNumber,
                    remarkTypeOther: org.organization.remarkTypeOther,
                    juristicInfo: org.organization.juristicInfo,
                  })),
                ];

                const juristicOrgItem = [
                  {
                    organizationId: 0,
                    organizationUuid: '',
                    organizeName: 'สร้างองค์กรใหม่',
                    organizationType: 'JURISTIC',
                    taxId: null,
                    cisNumber: '',
                    organizeBranchType: '',
                  },
                  ...juristicOrgs.map((org) => ({
                    organizationId: org.organization.id,
                    organizationUuid: org.organization.uuid,
                    organizeName: org.organization.organizeName,
                    organizationType: org.organization.organizationType,
                    taxId: org.organization.taxId,
                    cisNumber: org.organization.cisNumber,
                    organizeBranchType: org.organization.organizeBranchType,
                    businessType: org.organization.businessType,
                    idCard: org.organization.idCard,
                    registrationNumber: org.organization.registrationNumber,
                    branchNumber: org.organization.branchNumber,
                    remarkTypeOther: org.organization.remarkTypeOther,
                    juristicInfo: org.organization.juristicInfo,
                  })),
                ];

                const hasExistingOrgs =
                  registeredIndividualOrgs.length > 0 || juristicOrgs.length > 0;

                if (platformCheck.data?.isSeller === false || hasExistingOrgs) {
                  // Set existing organizations in state
                  actions.setExistingOrganizations({
                    registeredIndividualOrgs:
                      registeredIndividualOrgItem.length > 0 ? registeredIndividualOrgItem : null,
                    juristicOrgs: juristicOrgItem.length > 0 ? juristicOrgItem : null,
                  });

                  actions.startCompleteOrganizationFlow({
                    accessToken: response.data.accessToken,
                    authCenter: response.data.authCenter,
                  });
                  actions.setPhoneNumber(userProfileData.data?.user?.phoneNumber || '');
                } else {
                  // Organization completed, open merchant modal
                  actions.setAuthData({
                    accessToken: response.data.accessToken,
                    authCenter: response.data.authCenter,
                  });
                  actions.setPhoneNumber(userProfileData.data?.user?.phoneNumber || '');

                  // Get organization data from user profile
                  const organizations = userProfileData.data?.organizations || [];
                  if (organizations.length > 0) {
                    const org = organizations[0];
                    setMerchantOrgData(org);
                    setCreateOrgValue({
                      accountType:
                        org.organization?.organizationType ||
                        OrganizationType.REGISTERED_INDIVIDUAL,
                    } as OrganizationFormFields);
                  }
                  setMerchantUserInfo({
                    firstName: userProfileData.data?.user?.firstNameTh || '',
                    lastName: userProfileData.data?.user?.lastNameTh || '',
                    username: userProfileData.data?.user?.username || '',
                  });
                  setIsOpenMerchantModal(true);
                }
              }
            } else {
              // Set session with auth data and user profile
              await setSession(
                {
                  accessToken: response.data.accessToken,
                  authCenter: response.data.authCenter,
                },
                userProfileData.data
              );
              router.push(routes.home());
            }
          }
        } catch (error: unknown) {
          const apiError = error as ApiErrorResponse & {
            response?: { data?: { code?: string; message?: string } };
          };
          // Handle login errors
          if (
            apiError.response?.data?.code === 'AKM_ERR002' ||
            apiError.response?.data?.code === 'AKM_ERR003'
          ) {
            setLoginErrorMessage('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
          } else {
            handleApiError(apiError as ApiErrorResponse);
          }
        }
      }
    },
    [
      utils,
      checkRegisterMutation,
      sendTokenMutation,
      loginWithUsernameMutation,
      getUserProfileByPhoneMutation,
      actions,
      loginForm,
      profileForm,
      handleApiError,
      handleSendTokenError,
      router,
      setStoreUser,
    ]
  );

  // ===== Step 2: Register Handler =====
  const handleRegister = useCallback(
    async (values: PhoneRegisterFormFields) => {
      const formattedPhone = utils.formatPhoneNumber(values.phoneNumber);
      const payload = {
        phoneNumber: formattedPhone,
        countryCode: DEFAULT_COUNTRY_CODE,
      };

      try {
        const response = await checkRegisterMutation.mutateAsync(payload);

        if (response.statusCode === 200) {
          if (response.data?.code !== ResponseCheckPhoneNumberCode.CHECK_PHONE_DOES_NOT_EXISTS) {
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
              const tokenResponse = await sendTokenMutation.mutateAsync(payload);

              if (tokenResponse.data?.status === 'success') {
                actions.setPhoneNumber(values.phoneNumber);
                actions.setOtpData({
                  token: tokenResponse.data?.token || '',
                  refNo: tokenResponse.data?.refno || '',
                });
                actions.goToOtp();
              }
            } catch (error) {
              handleSendTokenError(error as ApiErrorResponse);
            }
          }
        } else {
          showPopup('error', {
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
            showConfirm: true,
          });
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
      handleApiError,
      handleSendTokenError,
    ]
  );

  // ===== Step 3: OTP Handler =====
  const handleSendOtp = useCallback(
    async (values: OtpFormFields) => {
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
          const response = await loginOtpMutation.mutateAsync(payload);
          if (response?.data?.accessToken) {
            // Get user profile by phone
            const userProfileData = await getUserProfileByPhoneMutation.mutateAsync({
              countryCode: DEFAULT_COUNTRY_CODE,
              phoneNumber: formattedPhone,
            });

            // Check platform
            const userUuid = userProfileData.data?.user?.uuid;

            const registerStep = userProfileData.data?.user?.registerStep;
            const registerStatus = userProfileData.data?.user?.registerStatus;

            if (registerStatus === 'IN_PROGRESS' && registerStep === 'REGISTER') {
              // Incomplete profile, start complete-profile flow
              actions.startCompleteProfileFlow({
                accessToken: response.data.accessToken,
                authCenter: response.data.authCenter,
              });
              profileForm.setFieldsValue({
                telNumber: state.phoneNumber || '',
                consentMarketing: true,
              });
            } else if (registerStatus === 'IN_PROGRESS' && registerStep === 'USER_INFO') {
              // User info completed, start organization flow
              actions.startCompleteOrganizationFlow({
                accessToken: response.data.accessToken,
                authCenter: response.data.authCenter,
              });
            } else if (registerStatus === 'IN_PROGRESS' && registerStep === 'ORG_INFO') {
              if (userUuid) {
                const platformCheck = await checkPlatform(userUuid);

                // Filter non-PERSONAL organizations

                const registeredIndividualOrgs =
                  userProfileData.data?.organizations.filter(
                    (org) => org.organization.organizationType === 'REGISTERED_INDIVIDUAL'
                  ) || [];

                const juristicOrgs =
                  userProfileData.data?.organizations.filter(
                    (org) => org.organization.organizationType === 'JURISTIC'
                  ) || [];

                // Map to ExistingOrganization format with "สร้างองค์กรใหม่" first
                const registeredIndividualOrgItem = [
                  {
                    organizationId: 0,
                    organizationUuid: '',
                    organizeName: 'สร้างองค์กรใหม่',
                    organizationType: 'REGISTERED_INDIVIDUAL',
                    taxId: null,
                    cisNumber: '',
                    organizeBranchType: '',
                  },
                  ...registeredIndividualOrgs.map((org) => ({
                    organizationId: org.organization.id,
                    organizationUuid: org.organization.uuid,
                    organizeName: org.organization.organizeName,
                    organizationType: org.organization.organizationType,
                    taxId: org.organization.taxId,
                    cisNumber: org.organization.cisNumber,
                    organizeBranchType: org.organization.organizeBranchType,
                    businessType: org.organization.businessType,
                    idCard: org.organization.idCard,
                    registrationNumber: org.organization.registrationNumber,
                    branchNumber: org.organization.branchNumber,
                    remarkTypeOther: org.organization.remarkTypeOther,
                    juristicInfo: org.organization.juristicInfo,
                  })),
                ];

                const juristicOrgItem = [
                  {
                    organizationId: 0,
                    organizationUuid: '',
                    organizeName: 'สร้างองค์กรใหม่',
                    organizationType: 'JURISTIC',
                    taxId: null,
                    cisNumber: '',
                    organizeBranchType: '',
                  },
                  ...juristicOrgs.map((org) => ({
                    organizationId: org.organization.id,
                    organizationUuid: org.organization.uuid,
                    organizeName: org.organization.organizeName,
                    organizationType: org.organization.organizationType,
                    taxId: org.organization.taxId,
                    cisNumber: org.organization.cisNumber,
                    organizeBranchType: org.organization.organizeBranchType,
                    businessType: org.organization.businessType,
                    idCard: org.organization.idCard,
                    registrationNumber: org.organization.registrationNumber,
                    branchNumber: org.organization.branchNumber,
                    remarkTypeOther: org.organization.remarkTypeOther,
                    juristicInfo: org.organization.juristicInfo,
                  })),
                ];

                if (platformCheck.data?.isSeller === false) {
                  // Set existing organizations in state
                  actions.setExistingOrganizations({
                    registeredIndividualOrgs:
                      registeredIndividualOrgItem.length > 0 ? registeredIndividualOrgItem : null,
                    juristicOrgs: juristicOrgItem.length > 0 ? juristicOrgItem : null,
                  });

                  actions.startCompleteOrganizationFlow({
                    accessToken: response.data.accessToken,
                    authCenter: response.data.authCenter,
                  });
                } else {
                  // Organization completed, open merchant modal
                  actions.setAuthData({
                    accessToken: response.data.accessToken,
                    authCenter: response.data.authCenter,
                  });
                  actions.setPhoneNumber(formattedPhone);

                  // Get organization data from user profile
                  const organizations = userProfileData.data?.organizations || [];
                  if (organizations.length > 0) {
                    const org = organizations[0];
                    setMerchantOrgData(org);
                    setCreateOrgValue({
                      accountType:
                        org.organization?.organizationType ||
                        OrganizationType.REGISTERED_INDIVIDUAL,
                    } as OrganizationFormFields);
                  }
                  setMerchantUserInfo({
                    firstName: userProfileData.data?.user?.firstNameTh || '',
                    lastName: userProfileData.data?.user?.lastNameTh || '',
                    username: userProfileData.data?.user?.username || '',
                  });
                  setIsOpenMerchantModal(true);
                }
              }
            } else {
              // Set session with auth data and user profile
              await setSession(
                {
                  accessToken: response.data.accessToken,
                  authCenter: response.data.authCenter,
                },
                userProfileData.data
              );
              router.push(routes.home());
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
          const response = await verifyOtpMutation.mutateAsync(payload);

          if (response.data) {
            if (response.data.status !== 'success') {
              if ((response.data as unknown as { blockUntil?: string }).blockUntil) {
                const countdownSeconds = utils.calculateBlockTime(
                  (response.data as unknown as { blockUntil: string }).blockUntil
                );
                actions.goToBlocked(countdownSeconds);
              } else {
                // Show OTP error in form field
                otpForm.setFields([
                  {
                    name: 'otp',
                    errors: ['รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'],
                  },
                ]);
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
      profileForm,
      actions,
      handleOtpError,
      router,
      setSession,
    ]
  );

  // ===== Resend OTP =====
  const handleResendOtp = useCallback(async () => {
    actions.setResendOtpSuccess(false);
    const formattedPhone = utils.formatPhoneNumber(state.phoneNumber || '');
    const payload = {
      phoneNumber: formattedPhone,
      countryCode: DEFAULT_COUNTRY_CODE,
    };

    try {
      const response = await sendTokenMutation.mutateAsync(payload);

      if (response.data) {
        actions.setOtpData({
          token: response.data?.token || '',
          refNo: response.data?.refno || '',
        });
        actions.setResendOtpSuccess(true);
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  }, [utils, state.phoneNumber, sendTokenMutation, actions, handleApiError]);

  // ===== Step 4: Set Password Handler =====
  const handleSetPassword = useCallback(
    async (values: PasswordFormFields) => {
      const formattedPhone = utils.formatPhoneNumber(state.phoneNumber || '');

      try {
        const response = await registerAccountAndUserMutation.mutateAsync({
          phoneNumber: formattedPhone,
          countryCode: DEFAULT_COUNTRY_CODE,
          password: values.password,
          isSeller: true,
        });

        if (response?.data) {
          actions.setAuthData({
            accessToken: response.data.accessToken,
            authCenter: response.data.authCenter,
          });
          actions.setPassword(values.password);
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
    [utils, state.phoneNumber, registerAccountAndUserMutation, actions, profileForm, handleApiError]
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
        const profileResponse = await registerUserProfileMutation.mutateAsync({
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
          accessToken: state.authData?.accessToken || '',
        });

        if (profileResponse.data) {
          // Step 2: Get consent list and send consent
          const consentList = await getAllConsents([
            'terms_of_service',
            'privacy_policy',
            'marketing_consent',
          ]);

          const consentData = consentList.data || [];

          // Filter out marketing_consent if consentMarketing is false
          const filteredConsentList = values.consentMarketing
            ? consentData
            : consentData.filter((consent) => consent.type !== 'marketing_consent');

          const consentIds = filteredConsentList.map((consent) => consent.id);
          const akIdConsentIds = filteredConsentList.map((consent) => consent.akIdConsentId);

          const consentPayload = {
            phoneNumber: formattedPhone,
            countryCode: DEFAULT_COUNTRY_CODE,
            consentIds: consentIds,
            akIdConsentIds: akIdConsentIds,
          };

          const consentResponse = await sendConsentMutation.mutateAsync(consentPayload);
          if (consentResponse.data?.message === 'User consent saved successfully') {
            actions.goToSetOrganization();
          }
        }
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    },
    [
      utils,
      state,
      profileForm,
      registerUserProfileMutation,
      sendConsentMutation,
      actions,
      handleApiError,
    ]
  );

  // ===== Step 6: Set Organization Handler =====
  const handleSetOrganization = useCallback(
    async (values: OrganizationFormFields) => {
      // If user selected an existing organization (id !== 0), skip consent and go to merchant
      if (values.selectedOrganizationId && values.selectedOrganizationId !== 0) {
        // Find the selected organization from state
        const selectedOrg =
          values.accountType === OrganizationType.REGISTERED_INDIVIDUAL
            ? state.existingRegisteredIndividualOrgs?.find(
                (org) => org.organizationId === values.selectedOrganizationId
              )
            : state.existingJuristicOrgs?.find(
                (org) => org.organizationId === values.selectedOrganizationId
              );

        if (selectedOrg) {
          // Set merchant org data from selected organization (convert to IAuthOrganization structure)
          console.log(selectedOrg, values, 'selectedOrg');
          setMerchantOrgData({
            isOwner: false,
            createdAt: '',
            updatedAt: '',
            organization: {
              logo: '',
              id: selectedOrg.organizationId,
              uuid: selectedOrg.organizationUuid,
              taxId: selectedOrg.taxId,
              organizeType:
                values.accountType === OrganizationType.REGISTERED_INDIVIDUAL
                  ? selectedOrg.organizationType
                  : values.juristicType || '',
              organizeName: selectedOrg.organizeName,
              cisNumber: selectedOrg.cisNumber,
              type: selectedOrg.organizationType,
              businessType: selectedOrg.businessType || [],
              remarkTypeOther: selectedOrg.remarkTypeOther || null,
              branchNumber: selectedOrg.branchNumber || null,
              mainPhoneNumber: '',
              otherPhoneNumber: null,
              mainEmail: null,
              highestAuthorityName: null,
              highestAuthorityPosition: null,
              highestAuthorityPhoneNumber: null,
              highestAuthorityEmail: null,
              contactName: null,
              contactPhoneNumber: null,
              contactEmail: null,
              kycStatus: '',
              contactShownHighestAuthority: false,
              organizeBranchType: selectedOrg.organizeBranchType,
              idCard: selectedOrg.idCard || '',
              registrationNumber: selectedOrg.registrationNumber || null,
              organizationType: selectedOrg.organizationType,
              customerStatus: '',
              isDopa: false,
              isDbd: false,
              juristicInfo: selectedOrg.juristicInfo || {
                prefix: '',
                subfix: '',
                juristicName: '',
              },
              createdAt: '',
              updatedAt: '',
              deletedAt: null,
              totalUsers: 0,
            },
            role: {
              id: 0,
              name: '',
              displayName: '',
              description: null,
              createdAt: '',
              updatedAt: '',
            },
          });
          setCreateOrgValue({
            accountType: selectedOrg.organizationType,
            registrationNumber: selectedOrg.registrationNumber || '',
            taxId: selectedOrg.taxId || '',
          } as OrganizationFormFields);

          // Open merchant modal directly (skip consent)
          setMerchantUserInfo({
            firstName: profileForm.getFieldValue('firstName') || '',
            lastName: profileForm.getFieldValue('lastName') || '',
            username: state.phoneNumber || '',
          });
          setIsOpenMerchantModal(true);
          return;
        }
      }

      // Show consent popup for REGISTERED_INDIVIDUAL and JURISTIC types (new org)
      if (
        values.accountType === OrganizationType.REGISTERED_INDIVIDUAL ||
        values.accountType === OrganizationType.JURISTIC
      ) {
        setIsOpenConsent(true);
        setCreateOrgValue(values);
      }
    },
    [state.existingRegisteredIndividualOrgs, state.existingJuristicOrgs]
  );

  // ===== Submit Consent Handler =====
  const handleSubmitConsent = useCallback(
    async (
      consentData: {
        acceptConsent: boolean;
        acceptMarketing: boolean;
        consents: IConsentResponse[];
      },
      values: OrganizationFormFields
    ) => {
      const formattedPhone = utils.formatPhoneNumber(state.phoneNumber || '');

      // Filter consent IDs based on marketing acceptance
      const consentIds = consentData.consents
        .filter((consent) => {
          if (!consentData.acceptMarketing && consent.type === 'marketing_consent') {
            return false;
          }
          return true;
        })
        .map((consent) => consent.id);

      try {
        // Build organization payload based on account type
        const orgPayload = {
          countryCode: DEFAULT_COUNTRY_CODE,
          phoneNumber: formattedPhone,
          orgType:
            (values.accountType as OrganizationType) || OrganizationType.REGISTERED_INDIVIDUAL,
          orgIndividualInfo:
            values.accountType === OrganizationType.REGISTERED_INDIVIDUAL
              ? {
                  registrationName: values.registrationName || '',
                  businessType: values.businessType || [],
                  businessTypeDescription: values.businessTypeDescription || '',
                  registrationNumber: values.registrationNumber || '',
                  acceptTerms: true,
                  idCard: values.idCard || '',
                }
              : undefined,
          orgJuristicInfo:
            values.accountType === OrganizationType.JURISTIC
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
                  acceptTerms: true,
                  businessTypeDescription: values.businessTypeDescription || '',
                }
              : undefined,
        };

        const orgResponse = await registerOrganizationProfileMutation.mutateAsync({
          payload: orgPayload,
          accessToken: state.authData?.accessToken || '',
        });

        if (
          orgResponse.statusCode === 201 &&
          orgResponse.data?.organizations &&
          orgResponse.data?.organizations.length > 0
        ) {
          // Send organization consent
          // Find the organization matching the account type the user just created
          // and pick the most recently created one (in case of duplicates)
          const organizations = orgResponse.data.organizations;
          const matchingOrgs = organizations.filter(
            (org) => org.organization.organizationType === values.accountType
          );
          const orgData =
            matchingOrgs.length > 0
              ? matchingOrgs.reduce((latest, current) =>
                  new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                )
              : organizations[organizations.length - 1];
          const organizationId = orgData?.organization.id;
          if (organizationId) {
            // Get akIdConsentIds from consent data
            const akIdConsentIds = consentData.consents
              .filter((consent) => {
                if (!consentData.acceptMarketing && consent.type === 'marketing_consent') {
                  return false;
                }
                return true;
              })
              .map((consent) => consent.akIdConsentId);

            await sendOrganizationConsentMutation.mutateAsync({
              organizationId: organizationId as number,
              consentIds: consentIds as number[],
              ...(akIdConsentIds.length > 0 &&
                akIdConsentIds.every((id) => typeof id === 'string') && {
                  akIdConsentIds: akIdConsentIds as string[],
                }),
            });

            // Create Organization Address for JURISTIC (if DBD data exists)
            // Only create address for new registrations, not when user has existing organizations
            const hasExistingOrgs =
              state.existingRegisteredIndividualOrgs || state.existingJuristicOrgs;

            if (
              !hasExistingOrgs &&
              values.accountType === OrganizationType.JURISTIC &&
              values.dbdAddress &&
              values.taxId
            ) {
              try {
                await createOrganizationAddress({
                  taxId: values.taxId,
                  address: values.dbdAddress.address,
                  subDistrictId: values.dbdAddress.subDistrictId,
                  districtId: values.dbdAddress.districtId,
                  provinceId: values.dbdAddress.provinceId,
                  zipCode: Number(values.dbdAddress.zipCode),
                  countryId: 1, // Thailand
                });
              } catch (error) {
                console.error('Failed to create organization address:', error);
                // Continue even if address creation fails
              }
            }

            // Store org data for merchant creation (use full org object)
            setMerchantOrgData(orgData);
          }

          // Close consent popup and open merchant modal
          setIsOpenConsent(false);
          setMerchantUserInfo({
            firstName: profileForm.getFieldValue('firstName') || '',
            lastName: profileForm.getFieldValue('lastName') || '',
            username: state.phoneNumber || '',
          });
          setIsOpenMerchantModal(true);
        }
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    },
    [
      utils,
      state,
      registerOrganizationProfileMutation,
      sendOrganizationConsentMutation,
      actions,
      handleApiError,
    ]
  );

  // ===== Handle Create Merchant =====
  const handleCreateMerchant = useCallback(
    async (values: { shopName: string }) => {
      const formattedPhone = utils.formatPhoneNumber(state.phoneNumber || '');

      const orgType = createOrgValue?.accountType || OrganizationType.REGISTERED_INDIVIDUAL;

      const slug = `merchant${Date.now()}`;
      console.log(merchantOrgData, 'merchantOrgData');
      try {
        const merchantPayload = {
          phoneNumber: formattedPhone,
          shopName: values.shopName,
          type: orgType,
          slug,
          skipRegisterStep: false,
          merchantName: values.shopName,
          organizeInfo: {
            cisNumber: merchantOrgData?.organization?.cisNumber || '',
            id: merchantOrgData?.organization?.id || 0,
            taxId:
              orgType === OrganizationType.JURISTIC
                ? merchantOrgData?.organization?.taxId || ''
                : createOrgValue?.registrationNumber ||
                  merchantOrgData?.organization?.registrationNumber ||
                  '',
            juristicType:
              orgType === OrganizationType.JURISTIC
                ? merchantOrgData?.organization?.organizeType || ''
                : orgType,
            organizeName: merchantOrgData?.organization?.organizeName || '',
            organizeBranchType: merchantOrgData?.organization?.organizeBranchType || 'HEAD_OFFICE',
          },
        };

        const response = await createMerchantMutation.mutateAsync(merchantPayload);

        if (response.data?.status === 'success') {
          // Get user profile and set session
          const userProfileData = await getUserProfileByPhoneMutation.mutateAsync({
            countryCode: DEFAULT_COUNTRY_CODE,
            phoneNumber: formattedPhone,
          });

          // Set session with existing auth data and fresh user profile
          if (state.authData) {
            await setSession(state.authData, userProfileData.data);
            setIsOpenMerchantModal(false);
            actions.resetAllForms();
            router.push(routes.home());
          } else {
            console.log('No auth data available to set session');
          }
        }
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    },
    [
      utils,
      state.phoneNumber,
      state.authData,
      createOrgValue,
      merchantOrgData,
      createMerchantMutation,
      getUserProfileByPhoneMutation,
      setSession,
      actions,
      handleApiError,
      router,
    ]
  );

  // ===== Handle Back =====
  const handleBack = useCallback(() => {
    actions.goBack();
  }, [actions]);

  const canGoBack = utils.canGoBack();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen" data-testid="modal--auth">
      <div
        style={{
          background: 'linear-gradient(180deg, #E5F7EC 0%, #BDF5D2 100%)',
        }}
        className="flex-col justify-center items-center hidden lg:flex"
      >
        <Image
          src="/home/landing.png"
          alt="Allkons Seller Center"
          width={500}
          height={500}
          priority
          data-testid="img--auth-logo"
        />
      </div>
      <div className="flex flex-col justify-center items-center p-8 relative overflow-hidden bg-white">
        {/* Back button */}
        {(canGoBack || state.blockInfo.isBlocked) && (
          <div className="absolute top-4 left-4 z-50">
            <Button variant="outlined" color="neutral" onClick={handleBack}>
              <i className="ri-arrow-left-s-line text-xl"></i>
            </Button>
          </div>
        )}

        {/* Login Flow - Step 1: Login Form */}
        <div
          className={`absolute w-full h-full flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(Step.LOGIN)}`}
        >
          <FormLogin
            onFinish={handleLogin}
            loading={isLoading}
            onRegisterClick={() => {
              setLoginErrorMessage('');
              actions.startRegisterFlow();
            }}
            loginForm={loginForm}
            errorMessage={loginErrorMessage}
            onClearError={() => setLoginErrorMessage('')}
          />
        </div>

        {/* Register Flow - Step 1: Register Form */}
        <div
          className={`absolute w-full h-full flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(Step.REGISTER)}`}
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
          className={`absolute w-full h-full flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(Step.OTP)}`}
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
          className={`absolute w-full h-full flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(Step.SET_PASSWORD)}`}
        >
          <FormSetPassword
            passwordForm={passwordForm}
            onFinish={handleSetPassword}
            loading={isLoading}
          />
        </div>

        {/* Register Flow - Step 4: Set Profile */}
        <div
          className={`absolute w-full h-full flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(Step.SET_PROFILE)}`}
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
          className={`absolute w-full h-full flex justify-center items-start overflow-auto transition-transform duration-500 ease-in-out ${utils.getTransformClass(Step.SET_ORGANIZATION)}`}
        >
          <div className="py-8">
            <SetOrganizationStep
              organizationForm={organizationForm}
              onFinish={handleSetOrganization}
              loading={isLoading}
              existingRegisteredIndividualOrgs={state.existingRegisteredIndividualOrgs}
              existingJuristicOrgs={state.existingJuristicOrgs}
            />
          </div>
        </div>

        {/* Blocked State */}
        <div
          className={`absolute w-full h-full flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(Step.BLOCKED)}`}
        >
          <div
            className="flex flex-col h-full w-full gap-6 items-center justify-center"
            data-testid="screen--otp-locked"
          >
            <SectionIcon iconClass="ri-lock-password-fill" type="error" />
            <div className="text-center">
              <Typography
                variant="h5"
                className="!text-text-secondary"
                data-testid="txt--otp-locked-title"
              >
                {ERROR_MESSAGES.OTP_BLOCKED_TITLE}
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary"
                data-testid="txt--otp-locked-timer"
              >
                กรุณารอ{' '}
                <span className="!text-error mr-1">
                  ({utils.formatCountdownTime(state.blockInfo.countdownTime)} นาที)
                </span>
                {ERROR_MESSAGES.OTP_BLOCKED_MESSAGE(state.flow)}
              </Typography>
            </div>
          </div>
        </div>

        {/* Success State */}
        <div
          className={`absolute w-full h-full flex justify-center items-center transition-transform duration-500 ease-in-out ${utils.getTransformClass(Step.SUCCESS)}`}
        >
          <div
            className="flex flex-col h-full w-full items-center justify-center"
            data-testid="screen--register-success"
          >
            <SectionIcon type="success" />
            <div className="text-center mt-5">
              <Typography
                variant="h2"
                className="!text-text-primary"
                data-testid="txt--register-success-title"
              >
                {SUCCESS_MESSAGES.REGISTER_SUCCESS_TITLE}
              </Typography>
              <Typography variant="paragraph-big" className="!text-gray-light !mt-2 !font-normal">
                {SUCCESS_MESSAGES.REGISTER_SUCCESS_MESSAGE}
              </Typography>
            </div>
            <div className="flex flex-col-reverse md:flex-row justify-center items-center gap-3 mt-5 pt-8 w-full">
              <Button
                dataTestId="btn--go-home"
                variant="outlined"
                color="neutral"
                icon={<i className="ri-home-6-line"></i>}
                onClick={() => router.push(routes.home())}
              >
                กลับหน้าหลัก
              </Button>
              <Button
                dataTestId="btn--go-login-after-success"
                variant="solid"
                color="primary"
                onClick={() => actions.startLoginFlow()}
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </div>
        </div>
      </div>
      <PopupConsent
        visible={isOpenConsent}
        onClose={() => setIsOpenConsent(false)}
        onSubmitConsent={(dataVal) => {
          if (createOrgValue) {
            handleSubmitConsent(dataVal, createOrgValue);
          }
        }}
      />
      <MerchantFormModal
        visible={isOpenMerchantModal}
        onClose={() => setIsOpenMerchantModal(false)}
        onSubmit={handleCreateMerchant}
        loading={createMerchantMutation.isPending}
        firstName={merchantUserInfo?.firstName}
        lastName={merchantUserInfo?.lastName}
        username={merchantUserInfo?.username}
      />
      <PopupComponent />
    </div>
  );
};

export default LoginPage;
