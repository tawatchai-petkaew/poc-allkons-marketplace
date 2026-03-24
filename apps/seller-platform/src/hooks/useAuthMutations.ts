import { useMutation } from "@tanstack/react-query";
import {
  checkPhoneNumber,
  sendOtpToPhoneNumber,
  verifyOtp,
  loginWithPhoneOtp,
  loginWithUsername,
  registerAccount,
  registerAccountAndUser,
  registerUserProfile,
  registerOrganizationProfile,
  getUserProfileByPhone,
} from "@/api/auth.api";
import {
  sendConsentMessage,
  sendOrganizationConsentMessage,
} from "@/api/consent.api";
import {
  IAuthRequestRegisterOrganizationProfilePayload,
  IAuthRequestRegisterUserProfilePayload,
} from "@/interfaces/auth/auth.request.interface";

// ===== Payload Types =====
export interface PhonePayload {
  phoneNumber: string;
  email?: string;
  countryCode: string;
}

export interface OtpPayload {
  otp: string;
  token: string;
  phoneNumber: string;
  countryCode: string;
}

export interface LoginOtpPayload {
  countryCode: string;
  phoneNumber: string;
  pin: string;
  token: string;
}

export interface RegisterAccountPayload {
  phoneNumber: string;
  countryCode: string;
  password: string;
}

export interface RegisterAccountAndUserPayload {
  phoneNumber: string;
  countryCode: string;
  password: string;
  isSeller: boolean;
}

export interface ConsentPayload {
  phoneNumber: string;
  consentIds: number[];
  akIdConsentIds?: string[];
  tokenAllkonsId?: string;
}

// ===== Check Register Mutation =====
export const useCheckRegister = () => {
  return useMutation({
    mutationKey: ["checkRegister"],
    mutationFn: (payload: PhonePayload) =>
      checkPhoneNumber({
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
      }),
  });
};

// ===== Send Token (OTP) Mutation =====
export const useSendToken = () => {
  return useMutation({
    mutationKey: ["sendToken"],
    mutationFn: (payload: PhonePayload) =>
      sendOtpToPhoneNumber({
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
      }),
  });
};

// ===== Verify OTP Mutation =====
export const useVerifyOtp = () => {
  return useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: (payload: OtpPayload) =>
      verifyOtp({
        otp: payload.otp,
        token: payload.token,
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
      }),
    retry: false, // Disable retry for OTP verification
  });
};

// ===== Login OTP Mutation =====
export const useLoginOtp = () => {
  return useMutation({
    mutationKey: ["loginOtp"],
    mutationFn: (payload: LoginOtpPayload) =>
      loginWithPhoneOtp({
        countryCode: payload.countryCode,
        phoneNumber: payload.phoneNumber,
        pin: payload.pin,
        token: payload.token,
      }),
    retry: false, // Disable retry for OTP verification
  });
};

// ===== Login with Username Mutation =====
export const useLoginWithUsername = () => {
  return useMutation({
    mutationKey: ["loginWithUsername"],
    mutationFn: (payload: { username: string; password: string }) =>
      loginWithUsername(payload),
  });
};

// ===== Register Account Mutation =====
export const useRegisterAccount = () => {
  return useMutation({
    mutationKey: ["registerAccount"],
    mutationFn: (payload: RegisterAccountPayload) =>
      registerAccount({
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
        password: payload.password,
      }),
  });
};

// ===== Register Account And User Mutation =====
export const useRegisterAccountAndUser = () => {
  return useMutation({
    mutationKey: ["registerAccountAndUser"],
    mutationFn: (payload: RegisterAccountAndUserPayload) =>
      registerAccountAndUser({
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
        password: payload.password,
        isSeller: payload.isSeller,
      }),
  });
};

// ===== Register User Profile Mutation =====
export const useRegisterUserProfile = () => {
  return useMutation({
    mutationKey: ["registerUserProfile"],
    mutationFn: ({
      payload,
      accessToken,
    }: {
      payload: IAuthRequestRegisterUserProfilePayload;
      accessToken: string;
    }) => registerUserProfile(payload, accessToken),
  });
};

// ===== Register Organization Profile Mutation =====
export const useRegisterOrganizationProfile = () => {
  return useMutation({
    mutationKey: ["registerOrganizationProfile"],
    mutationFn: ({
      payload,
      accessToken,
    }: {
      payload: IAuthRequestRegisterOrganizationProfilePayload;
      accessToken: string;
    }) => registerOrganizationProfile(payload, accessToken),
  });
};

// ===== Send Consent Mutation =====
export const useSendConsent = () => {
  return useMutation({
    mutationKey: ["sendConsent"],
    mutationFn: (payload: ConsentPayload) => sendConsentMessage(payload),
  });
};

// ===== Send Organization Consent Mutation =====
export const useSendOrganizationConsent = () => {
  return useMutation({
    mutationKey: ["sendOrganizationConsent"],
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
    mutationKey: ["getUserProfileByPhone"],
    mutationFn: (payload: PhonePayload) =>
      getUserProfileByPhone(
        payload.countryCode,
        payload.phoneNumber,
        payload?.email,
      ),
  });
};
