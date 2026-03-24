import { FormInstance } from "antd";

// ===== Flow Types =====
/**
 * AuthFlow defines the current authentication flow:
 * - 'login': User is logging in (phone → OTP → done)
 * - 'register': User is registering (phone → OTP → password → profile → organization → done)
 * - 'complete-profile': User logged in but profile incomplete (profile → organization → done)
 */
export type AuthFlow = "login" | "register" | "complete-profile";

// ===== Step Types =====
export enum Step {
  // Entry points
  LOGIN = "login",
  REGISTER = "register",
  // Shared
  OTP = "otp",
  // Register only
  SET_PASSWORD = "setPassword",
  SET_PROFILE = "setProfile",
  SET_ORGANIZATION = "setOrganization",
  // Special states
  BLOCKED = "blocked",
  SUCCESS = "success",
}

// ===== Form Field Types =====
export interface PhoneFormFields {
  phoneNumber?: string;
  username?: string;
  password?: string;
}

export interface PhoneRegisterFormFields {
  phoneNumber: string;
}

export interface OtpFormFields {
  otp: string;
}

export interface PasswordFormFields {
  password: string;
  confirmPassword: string;
}

export interface ProfileFormFields {
  firstName: string;
  midName?: string;
  lastName: string;
  telNumber: string;
  email?: string;
  consent: boolean;
  consentMarketing?: boolean;
}

export interface OrganizationFormFields {
  accountType: string;
  consent: boolean;
  // Selected existing organization id (0 = create new)
  selectedOrganizationId?: number;
  // Personal
  idCard?: string;
  // Registered Individual
  registrationName?: string;
  registrationNumber?: string;
  // Juristic
  juristicName?: string;
  taxId?: string;
  juristicType?: string;
  remarkTypeOther?: string;
  juristicTypeId?: number;
  branchType?: string;
  branchNumber?: string;
  branchName?: string;
  businessType?: string[];
  businessTypeDescription?: string;
  // DBD Address data for JURISTIC type
  dbdAddress?: {
    address: string;
    subDistrictId: number | string;
    districtId: number | string;
    provinceId: number | string;
    zipCode: number | string;
  };
}

// ===== OTP Data =====
export interface OtpData {
  token: string;
  refNo: string;
}

// ===== Block Info =====
export interface BlockInfo {
  isBlocked: boolean;
  countdownTime: number;
}

// ===== Auth State =====
export interface AuthState {
  flow: AuthFlow;
  currentStep: Step;
  phoneNumber: string | null;
  otpData: OtpData;
  password: string;
  blockInfo: BlockInfo;
  isSuccessResendOtp: boolean;
  isRegisterSuccess: boolean;
  // For complete-profile flow (when login finds incomplete profile)
  authData: {
    accessToken: string;
    authCenter: {
      accessToken: string;
      expiresIn: string;
      refreshExpiresIn: number;
      refreshToken: string;
    };
  } | null;
  // Existing organizations from user profile by type
  existingRegisteredIndividualOrgs: ExistingOrganization[] | null;
  existingJuristicOrgs: ExistingOrganization[] | null;
}

// ===== Existing Organization Type =====
export interface ExistingOrganization {
  organizationId: number;
  organizationUuid: string;
  organizeName: string;
  organizationType: string;
  taxId: string | null;
  cisNumber: string;
  organizeBranchType: string;
  // Additional fields for form prefilling
  businessType?: string[];
  idCard?: string;
  registrationNumber?: string | null;
  branchNumber?: string | null;
  remarkTypeOther?: string | null;
  juristicInfo?: {
    prefix: string;
    subfix: string;
    juristicName: string;
  };
}

// ===== Form Instances =====
export interface AuthForms {
  loginForm: FormInstance<PhoneFormFields>;
  registerForm: FormInstance<PhoneRegisterFormFields>;
  otpForm: FormInstance<OtpFormFields>;
  passwordForm: FormInstance<PasswordFormFields>;
  profileForm: FormInstance<ProfileFormFields>;
  organizationForm: FormInstance<OrganizationFormFields>;
}

// ===== Action Types =====
export type AuthAction =
  | { type: "SET_FLOW"; payload: AuthFlow }
  | { type: "SET_STEP"; payload: Step }
  | { type: "SET_PHONE_NUMBER"; payload: string | null }
  | { type: "SET_OTP_DATA"; payload: OtpData }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_BLOCK_INFO"; payload: BlockInfo }
  | { type: "SET_RESEND_OTP_SUCCESS"; payload: boolean }
  | { type: "SET_REGISTER_SUCCESS"; payload: boolean }
  | { type: "SET_AUTH_DATA"; payload: { accessToken: string; authCenter: { accessToken: string; expiresIn: string; refreshExpiresIn: number; refreshToken: string } } | null }
  | { type: "SET_EXISTING_ORGANIZATIONS"; payload: { registeredIndividualOrgs: ExistingOrganization[] | null; juristicOrgs: ExistingOrganization[] | null } }
  | { type: "RESET_STATE" };

// ===== API Error Types =====
export interface ApiErrorData {
  remaining?: number;
  blockUntil?: string;
  status?: string;
  data?: {
    blockUntil?: string;
    remaining?: number;
  };
}

export interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      data?: ApiErrorData;
      code?: string;
    };
  };
}

// ===== API Payload Types =====
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

export interface UserProfilePayload {
  phoneNumber: string;
  countryCode: string;
  userInfo: {
    firstName: string;
    midName?: string;
    lastName: string;
    email?: string;
  };
  platform: string;
}

export interface ConsentPayload {
  phoneNumber: string;
  consentIds: number[];
}

export interface CheckPlatformPayload {
  userUuid: string;
  token: string;
}
