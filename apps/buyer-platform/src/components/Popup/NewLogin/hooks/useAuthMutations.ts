import { useMutation } from '@tanstack/react-query';
import {
  checkRegister,
  registerAccount,
  registerOrganizationProfile,
  RegisterOrganizationProfileRequest,
  registerUserProfile,
  sendToken,
  verifyOtp,
} from '@/common/api/customer-service/register.api';
import {
  sendConsentMessage,
  sendOrganizationConsentMessage,
} from '@/common/api/customer-service/user-consent.api';
import {
  loginOtp,
  loginWithUsername,
  registerAccountAndUser,
} from '@/common/api/customer-service/auth.api';
import { getUserProfileByPhone } from '@/common/api/customer-service/register.api';
import {
  PhonePayload,
  OtpPayload,
  LoginOtpPayload,
  RegisterAccountPayload,
  RegisterAccountAndUserPayload,
  UserProfilePayload,
  ConsentPayload,
} from '../types';

// ===== Check Register Mutation =====
export const useCheckRegister = () => {
  return useMutation({
    mutationKey: ['checkRegister'],
    mutationFn: (payload: PhonePayload) => checkRegister(payload),
  });
};

// ===== Send Token (OTP) Mutation =====
export const useSendToken = () => {
  return useMutation({
    mutationKey: ['sendToken'],
    mutationFn: (payload: PhonePayload) => sendToken(payload),
  });
};

// ===== Verify OTP Mutation =====
export const useVerifyOtp = () => {
  return useMutation({
    mutationKey: ['verifyOtp'],
    mutationFn: (payload: OtpPayload) => verifyOtp(payload),
  });
};

// ===== Login OTP Mutation =====
export const useLoginOtp = () => {
  return useMutation({
    mutationKey: ['loginOtp'],
    mutationFn: (payload: LoginOtpPayload) => loginOtp(payload),
  });
};

// ===== Register Account Mutation =====
export const useRegisterAccount = () => {
  return useMutation({
    mutationKey: ['registerAccount'],
    mutationFn: (payload: RegisterAccountPayload) => registerAccount(payload),
  });
};

// ===== Register Account And User Mutation =====
export const useRegisterAccountAndUser = () => {
  return useMutation({
    mutationKey: ['registerAccountAndUser'],
    mutationFn: (payload: RegisterAccountAndUserPayload) =>
      registerAccountAndUser(payload),
  });
};

// ===== Register User Profile Mutation =====
export const useRegisterUserProfile = () => {
  return useMutation({
    mutationKey: ['registerUserProfile'],
    mutationFn: ({
      payload,
      accessToken,
    }: {
      payload: UserProfilePayload;
      accessToken: string;
    }) => registerUserProfile(payload, accessToken),
  });
};

// ===== Register Organization Profile Mutation =====
export const useRegisterOrganizationProfile = () => {
  return useMutation({
    mutationKey: ['registerOrganizationProfile'],
    mutationFn: ({
      payload,
      accessToken,
    }: {
      payload: RegisterOrganizationProfileRequest;
      accessToken: string;
    }) => registerOrganizationProfile(payload, accessToken),
  });
};

// ===== Send Consent Mutation =====
export const useSendConsent = () => {
  return useMutation({
    mutationKey: ['sendConsent'],
    mutationFn: (payload: ConsentPayload) => sendConsentMessage(payload),
  });
};

export const useSendOrganizationConsent = () => {
  return useMutation({
    mutationKey: ['sendOrganizationConsent'],
    mutationFn: (payload: {
      organizationId: number;
      consentIds: number[];
      akIdConsentIds?: string[];
      tokenAllkonsId?: string;
    }) => sendOrganizationConsentMessage(payload),
  });
};

// ===== Get User Profile By Phone Mutation =====
export const useGetUserProfileByPhone = () => {
  return useMutation({
    mutationKey: ['getUserProfileByPhone'],
    mutationFn: (payload: PhonePayload) =>
      getUserProfileByPhone(
        payload.countryCode,
        payload.phoneNumber,
        payload?.email
      ),
  });
};

export const useLoginWithUsername = () => {
  return useMutation({
    mutationKey: ['loginWithUsername'],
    mutationFn: (payload: { username: string; password: string }) =>
      loginWithUsername(payload),
  });
};
