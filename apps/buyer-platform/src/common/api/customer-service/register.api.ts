import { customerAPI } from '../../../utils/axios';
import { OrganizationTypes } from '../../enum/organization.enum';

interface CheckRegisterRequest {
  countryCode: string;
  phoneNumber: string;
}

interface RegisterDraftProfileRequest {
  phoneNumber: string;
  userInfo: {
    firstName: string;
    lastName: string;
    email?: string;
    midName?: string;
  };
}

interface RegisterProfileRequest {
  phoneNumber: string;
  userInfo: {
    firstName: string;
    midName?: string;
    lastName: string;
    email?: string;
  };
  acceptTerms: boolean;
  orgType: 'PERSONAL' | 'JURISTIC';
  orgPersonalInfo?: {
    idCard: string;
  };
  orgJuristicInfo?: {
    juristicName: string;
    taxId: string;
    juristicType: string;
    remarkTypeOther?: string;
  };
}

interface RegisterAccountRequest {
  phoneNumber: string;
  countryCode: string;
  password: string;
  isSeller?: string;
}

interface RegisterUserProfileRequest {
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

export interface RegisterOrganizationProfileRequest {
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
    idCard: string
  };
  orgJuristicInfo?: {
    juristicName: string;
    businessType: string[];
    taxId: string;
    juristicType: string; // TODO(): implement juristicType
    remarkTypeOther: string;
    juristicTypeId: number;
    branchType: string; // BRANCH
    branchNumber: string; // IF HEAD_OFFICE branch code equal 00000 / else can input branch code
    branchName: string; // IF HEAD_OFFICE branch code equal สำนักงานใหญ่ / else can input branch name
    acceptTerms: boolean;
    businessTypeDescription?: string;
  };
}

const prefix = '/v1/register';

export const checkRegister = async (data: CheckRegisterRequest) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/check-phone`,
    data
  );
  return responseData;
};

export const sendToken = async (data: CheckRegisterRequest) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/otp/send-sms`,
    data
  );
  return responseData;
};

export const verifyOtp = async (data: {
  otp: string;
  token: string;
  phoneNumber: string;
}) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/otp/verify-sms`,
    data
  );
  return responseData;
};

export const registerDraftProfile = async (
  data: RegisterDraftProfileRequest,
  token: string
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/profile-draft`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return responseData;
};

export const registerProfile = async (
  data: RegisterProfileRequest,
  token: string
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/profile-buyer`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return responseData;
};

export const checkIdCard = async (payload: { idCard: string }) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/id-card/check`,
    payload
  );
  return responseData;
};

export const checkTaxId = async (payload: { taxId: string }) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/tax-id/check`,
    payload
  );
  return responseData;
};

export const registerAccount = async (payload: RegisterAccountRequest) => {
  const { data: responseData } = await customerAPI.post(
    `/v1/auth/register/account-user`,
    payload
  );
  return responseData;
};

export const registerUserProfile = async (
  payload: RegisterUserProfileRequest,
  token: string
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/user-profile`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return responseData;
};

export const registerOrganizationProfile = async (
  payload: RegisterOrganizationProfileRequest,
  token: string
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/organization-profile`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return responseData;
};

export const getUserProfileByPhone = async (
  countryCode: string,
  phoneNumber?: string,
  email?: string
) => {
  const response = await customerAPI.get(`/v1/register/user-profile`, {
    params: {
      countryCode,
      phoneNumber,
      email,
    },
  });
  return response.data;
};
