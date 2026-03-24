export interface IAuthRequestCheckPhoneNumberPayload {
  phoneNumber: string;
  countryCode: string;
}

export interface IAuthRequestLoginWithPhoneOtpPayload {
  countryCode: string;
  pin: string;
  token: string;
  phoneNumber: string;
}

export interface IAuthRequestVerifyPhoneOtpPayload {
  otp: string;
  token: string;
  phoneNumber: string;
  countryCode: string;
}

export interface IAuthRequestRegisterAccountPayload {
  phoneNumber: string;
  countryCode: string;
  password: string;
  isSeller?: boolean;
}

export interface IAuthRequestRegisterAccountAndUserPayload {
  phoneNumber: string;
  countryCode: string;
  password: string;
  isSeller: boolean;
}

export interface IAuthRequestRegisterUserProfilePayload {
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

export type OrganizationTypes = "PERSONAL" | "REGISTERED_INDIVIDUAL" | "JURISTIC";

export interface IAuthRequestRegisterOrganizationProfilePayload {
  countryCode: string;
  phoneNumber: string;
  orgType: OrganizationTypes;
  orgPersonalInfo?: {
    idCard: string;
    acceptTerms: boolean;
    businessType: string[];
    businessTypeDescription?: string;
  };
  orgIndividualInfo?: {
    registrationName: string;
    businessType: string[];
    registrationNumber: string;
    acceptTerms: boolean;
    businessTypeDescription?: string;
    idCard: string;
  };
  orgJuristicInfo?: {
    juristicName: string;
    businessType: string[];
    taxId: string;
    juristicType: string;
    remarkTypeOther: string;
    juristicTypeId: number;
    branchType: string;
    branchNumber: string;
    branchName: string;
    acceptTerms: boolean;
    businessTypeDescription?: string;
  };
}
