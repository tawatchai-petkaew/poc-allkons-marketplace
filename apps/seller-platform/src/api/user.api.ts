import {
  IExists,
  IExistsTaxId,
  IMasterDataBusinessTypeResponse,
  IUserDraftKycResponse,
  IUpdateDraftUserKycPayload,
  ISendOtpEmailResponse,
} from "@/interfaces/user/user.response.interface";
import { customerAPI } from "@/libs/axios";
import { ApiResponse } from "@/types/common.type";

export const checkRegistrationNumberExists = async (
  registrationNumber: string,
) => {
  const response = await customerAPI.post<ApiResponse<IExists>>(
    `/user/check-regis-number`,
    { registrationNumber },
  );

  return response.data;
};

export const checkTaxIdExists = async (payload: {
  taxId: string;
  organizeBranchNumber?: number;
}) => {
  const response = await customerAPI.post<ApiResponse<IExistsTaxId>>(
    `/organization/tax-id/check`,
    {
      taxId: payload.taxId,
      organizeBranchNumber: payload.organizeBranchNumber || "00000",
    },
  );

  return response.data;
};
export const checkIdCardToCis = async (payload: { idCard: string }) => {
  const response = await customerAPI.post<ApiResponse<IExists>>(
    `/user/check-id-card`,
    payload,
  );
  return response.data;
};

export const getDraftUserKyc = async () => {
  const { data: responseData } =
    await customerAPI.get<ApiResponse<IUserDraftKycResponse>>(
      `/user/draft/kyc`,
    );
  return responseData;
};

export const getMasterBusinessType = async () => {
  const response = await customerAPI.post<
    ApiResponse<IMasterDataBusinessTypeResponse>
  >(`/v1/master-data`, {
    masterCode: "ROLE_BUSINESS",
  });
  return response.data;
};

export const updateDraftUserKyc = async (
  payload: IUpdateDraftUserKycPayload,
) => {
  const response = await customerAPI.put<ApiResponse<IUserDraftKycResponse>>(
    `/user/draft/kyc`,
    payload,
  );
  return response.data;
};

export const checkRegisNumber = async (payload: {
  registrationNumber: string;
}) => {
  const response = await customerAPI.post<ApiResponse<any>>(
    `/user/check-regis-number`,
    payload,
  );
  return response.data;
};

export const checkEmail = async (payload: { email: string }) => {
  const response = await customerAPI.post<ApiResponse<{ exists: boolean }>>(
    "/user/check-email",
    payload,
  );
  return response.data;
};

export const checkPlatform = async (userUuid: string) => {
  const response = await customerAPI.get<ApiResponse<{ isSeller: boolean }>>(
    `/user/${userUuid}/check-platform`,
  );
  return response.data;
};

export const sendOtpEmail = async (payload: { email: string }) => {
  const response = await customerAPI.post<ApiResponse<ISendOtpEmailResponse>>(
    "/user/otp/send-email",
    payload,
  );
  return response.data;
};

export const verifyOtpEmail = async (payload: {
  email: string;
  pin: string;
  refno: string;
}) => {
  const response = await customerAPI.post<ApiResponse<{ status: string }>>(
    "/user/otp/verify-email",
    payload,
  );
  return response.data;
};

export const uploadFileUserKyc = async (formData: FormData) => {
  const { data: responseData } = await customerAPI.post<ApiResponse<any>>(
    `/user/draft/upload-document-cis`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return responseData;
};

export const deleteFileUserKyc = async (documentIds: string[]) => {
  const { data: responseData } = await customerAPI.delete<ApiResponse<any>>(
    `/user/draft/delete-document-cis`,
    {
      data: { documentIds },
    },
  );
  return responseData;
};

export const approveUserKyc = async () => {
  const { data: responseData } =
    await customerAPI.post<ApiResponse<string>>(`/user/approve/kyc`);
  return responseData;
};
