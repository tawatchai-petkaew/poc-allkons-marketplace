import type { ApiResponse } from "@/types/common.type";
import { customerAPI } from "@/libs/axios";
import {
  IAuthRequestCheckPhoneNumberPayload,
  IAuthRequestLoginWithPhoneOtpPayload,
  IAuthRequestVerifyPhoneOtpPayload,
  IAuthRequestRegisterAccountPayload,
  IAuthRequestRegisterAccountAndUserPayload,
  IAuthRequestRegisterUserProfilePayload,
  IAuthRequestRegisterOrganizationProfilePayload,
} from "@/interfaces/auth/auth.request.interface";
import {
  IAuthResponseCheckPhoneNumber,
  IAuthResponseLoginWithPhoneOtp,
  IAuthResponseSendOtpToPhoneNumber,
  IAuthResponseUserProfile,
  IAuthResponseUserProfileWithMerchants,
  IAuthResponseVerifyOtp,
  IAuthResponseRegisterAccount,
} from "@/interfaces/auth/auth.response.interface";

// ===== Check Phone Number =====
export const checkPhoneNumber = async (
  payload: IAuthRequestCheckPhoneNumberPayload,
) => {
  const response = await customerAPI.post<
    ApiResponse<IAuthResponseCheckPhoneNumber>
  >("/v1/register/check-phone", payload);

  return response.data;
};

// Alias for consistency with buyer
export const checkRegister = checkPhoneNumber;

// ===== Send OTP (Token) =====
export const sendOtpToPhoneNumber = async (
  payload: IAuthRequestCheckPhoneNumberPayload,
) => {
  const response = await customerAPI.post<
    ApiResponse<IAuthResponseSendOtpToPhoneNumber>
  >("/v1/register/otp/send-sms", payload);
  return response.data;
};

// Alias for consistency with buyer
export const sendToken = sendOtpToPhoneNumber;

// ===== Verify OTP =====
export const verifyOtp = async (payload: IAuthRequestVerifyPhoneOtpPayload) => {
  const response = await customerAPI.post<ApiResponse<IAuthResponseVerifyOtp>>(
    "/v1/register/otp/verify-sms",
    payload,
  );
  return response.data;
};

// ===== Login with OTP =====
export const loginWithPhoneOtp = async (
  payload: IAuthRequestLoginWithPhoneOtpPayload,
) => {
  const response = await customerAPI.post<
    ApiResponse<IAuthResponseLoginWithPhoneOtp>
  >("/v1/auth/login-phone-otp", payload);
  return response.data;
};

// Alias for consistency with buyer
export const loginOtp = async (payload: {
  countryCode: string;
  phoneNumber: string;
  pin: string;
  token: string;
}) => {
  return loginWithPhoneOtp({
    countryCode: payload.countryCode,
    phoneNumber: payload.phoneNumber,
    pin: payload.pin,
    token: payload.token,
  });
};

// ===== Login with Username/Password =====
export const loginWithUsername = async (payload: {
  username: string;
  password: string;
}) => {
  const response = await customerAPI.post<
    ApiResponse<IAuthResponseLoginWithPhoneOtp>
  >("/v1/auth/login", {
    username: payload.username,
    password: payload.password,
    countryCode: "66",
  });
  return response.data;
};

// ===== Register Account =====
export const registerAccount = async (
  payload: IAuthRequestRegisterAccountPayload,
) => {
  const response = await customerAPI.post<
    ApiResponse<IAuthResponseRegisterAccount>
  >("/v1/auth/register/account-user", payload);
  return response.data;
};

// ===== Register Account and User =====
export const registerAccountAndUser = async (
  payload: IAuthRequestRegisterAccountAndUserPayload,
) => {
  const response = await customerAPI.post<
    ApiResponse<IAuthResponseRegisterAccount>
  >("/v1/auth/register/account-and-user", payload);
  return response.data;
};

// ===== Register User Profile =====
export const registerUserProfile = async (
  payload: IAuthRequestRegisterUserProfilePayload,
  accessToken: string,
) => {
  const response = await customerAPI.post<
    ApiResponse<IAuthResponseUserProfile>
  >("/v1/register/user-profile", payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

// ===== Register Organization Profile =====
export const registerOrganizationProfile = async (
  payload: IAuthRequestRegisterOrganizationProfilePayload,
  accessToken: string,
) => {
  const response = await customerAPI.post<
    ApiResponse<IAuthResponseUserProfile>
  >("/v1/register/organization-profile", payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

// ===== Get User Profile by Phone =====
export const getUserProfileByPhone = async (
  countryCode: string,
  phoneNumber?: string,
  email?: string,
) => {
  const response = await customerAPI.get<ApiResponse<IAuthResponseUserProfile>>(
    "/v1/register/user-profile",
    {
      params: {
        countryCode,
        phoneNumber,
        email,
      },
    },
  );
  return response.data;
};

// ===== Get Current Profile =====
export const getProfile = async () => {
  const response =
    await customerAPI.get<IAuthResponseUserProfileWithMerchants>("/auth");
  return response.data;
};

// ===== Check ID Card =====
export const checkIdCard = async (payload: { idCard: string }) => {
  const response = await customerAPI.post<ApiResponse<{ exists: boolean }>>(
    "/v1/register/id-card/check",
    payload,
  );
  return response.data;
};

// ===== Check Tax ID =====
export const checkTaxId = async (payload: { taxId: string }) => {
  const response = await customerAPI.post<ApiResponse<{ exists: boolean }>>(
    "/v1/register/tax-id/check",
    payload,
  );
  return response.data;
};

// ===== Get Organization Token =====
export const getOrganizationToken = async (
  organizationId: number,
  userId: number,
) => {
  const response = await customerAPI.post<ApiResponse<{ accessToken: string }>>(
    "/auth/organization-token",
    {
      organizationId,
      userId,
    },
  );
  return response.data;
};
