import {
  IOrganizationConsentPayload,
  IUserConsentPayload,
} from "@/interfaces/consent/consent.request.interface";
import { IConsentResponse } from "@/interfaces/consent/consent.response.interface";
import { customerAPI } from "@/libs/axios";
import type { ApiResponse } from "@/types/common.type";

export const sendConsentMessage = async (payload: IUserConsentPayload) => {
  const response = await customerAPI.post<ApiResponse<{ message: string }>>(
    `/v1/user-consent`,
    payload,
  );
  return response.data;
};

export const sendOrganizationConsentMessage = async (
  payload: IOrganizationConsentPayload,
) => {
  const response = await customerAPI.post<ApiResponse<{ message: string }>>(
    `/v1/organization-consent`,
    payload,
  );
  return response.data;
};

export const getAllConsents = async (data: string[]) => {
  const response = await customerAPI.get<ApiResponse<IConsentResponse[]>>(
    `/v1/consent-message/?types=[${data.join(",")}]`,
  );
  return response.data;
};

export const getConsentMessage = async (data: { type: string }) => {
  const { data: responseData } = await customerAPI.get<
    ApiResponse<IConsentResponse>
  >(`/v1/consent-message?type=${data.type}`);
  return responseData;
};
