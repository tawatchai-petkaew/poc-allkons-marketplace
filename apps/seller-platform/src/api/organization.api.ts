import {
  ICreateOrganizationPayload,
  IReqAddPhoneWhitelist,
  IReqCheckTaxId,
  IReqDraftOrganization,
  IReqInviteUser,
  IReqUpdateUser,
  IReqUpdateUserRole,
} from "@/interfaces/organization/organization.request.interface";
export type { IReqUpdateUser, IReqUpdateUserRole, IReqDraftOrganization };
import {
  ICreateExitRequestOragizationResponse,
  ICheckExistResponse,
  ICheckTaxIdResponse,
  IDraftOrganizeInfoResponse,
  IInviteValidatePhoneResponse,
  IOrganizationJuristicTypeMasterDataResponse,
  IOrganizationListResponse,
  IOrganizationResponse,
  IPhoneWhitelist,
  ISendInviteResponse,
  IUpdateOrganizationUserResponse,
  IUserOrganization,
  IGetExitOrganizationRequests,
} from "@/interfaces/organization/organization.response.interface";
import { customerAPI } from "@/libs/axios";
import { ApiResponse, PaginationResponse } from "@/types/common.type";

export const getMyOrganizationList = async (
  userUuid: string,
  params: { page: number; limit: number },
) => {
  const response = await customerAPI.get<
    ApiResponse<IOrganizationListResponse>
  >(`/organization/user/${userUuid}`, {
    params: {
      page: params.page,
      limit: params.limit,
    },
  });

  return response.data;
};

export const getOrganizationJuristicTypeMasterData = async () => {
  const response = await customerAPI.get<
    ApiResponse<IOrganizationJuristicTypeMasterDataResponse[]>
  >(`/organization/juristic-type`);

  return response.data;
};

export const createOrganization = async (
  payload: ICreateOrganizationPayload,
) => {
  const response = await customerAPI.post<ApiResponse<IOrganizationResponse>>(
    `/organization`,
    payload,
  );

  return response.data;
};

export const createOrganizationAddress = async (payload: {
  taxId: string;
  address: string;
  subDistrictId: number | string;
  districtId: number | string;
  provinceId: number | string;
  zipCode: number | string;
  countryId: number;
}) => {
  const response = await customerAPI.post(`/organization/address`, payload);

  return response.data;
};

export const checkTaxId = async (payload: IReqCheckTaxId) => {
  const response = await customerAPI.post<ApiResponse<ICheckTaxIdResponse>>(
    `/organization/tax-id/check`,
    payload,
  );
  return response.data;
};

export const getDraftOrganization = async (organizeId: number) => {
  const response = await customerAPI.get<ApiResponse<IDraftOrganizeInfoResponse>>(
    `/organization/draft-organize-info/${organizeId}`,
  );
  return response.data;
};

export const saveDraftOrganization = async (
  payload: IReqDraftOrganization,
  draftOrganizationId: number,
) => {
  const response = await customerAPI.put<ApiResponse<IDraftOrganizeInfoResponse>>(
    `/organization/draft-organize-info/${draftOrganizationId}`,
    payload,
  );
  return response.data;
};

export const uploadFileDraftOrganization = async (
  formData: FormData,
  draftOrganizeId: number,
) => {
  const { data: responseData } = await customerAPI.post<ApiResponse<any>>(
    `/organization/draft-organize-info/${draftOrganizeId}/upload-document-cis`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return responseData;
};

export const deleteFileDraftOrganization = async (
  draftOrganizeId: number,
  documentIds: string[],
) => {
  const { data: responseData } = await customerAPI.delete<ApiResponse<any>>(
    `/organization/draft-organize-info/${draftOrganizeId}/delete-document-cis`,
    {
      data: { documentIds },
    },
  );
  return responseData;
};

export const approveKycOrgnization = async (draftOrganizeId: number) => {
  const response = await customerAPI.get<ApiResponse<IDraftOrganizeInfoResponse>>(
    `/organization/approve/organize-info/${draftOrganizeId}`,
  );
  return response.data;
};

export const getUserByOrganizationId = async (
  organizeUuid: string,
  params: { page: number; limit: number },
) => {
  const response = await customerAPI.get<
    ApiResponse<{ users: IUserOrganization[]; pagination: PaginationResponse }>
  >(`/organization/${organizeUuid}/users`, {
    params: {
      page: params.page,
      limit: params.limit,
    },
  });
  return response.data;
};

export const updateUserByOrganization = async (
  organizeUuid: string,
  userUuid: string,
  payload: IReqUpdateUser,
) => {
  const response = await customerAPI.patch<ApiResponse<IUpdateOrganizationUserResponse>>(
    `/organization/${organizeUuid}/users/${userUuid}`,
    payload,
  );
  return response.data;
};

export const updateUserByOrganizationRole = async (
  organizeId: number,
  userId: number,
  payload: IReqUpdateUserRole,
) => {
  const response = await customerAPI.patch<ApiResponse<{ success: boolean; message: string }>>(
    `/organization/${organizeId}/users/${userId}/role`,
    payload,
  );
  return response.data;
};

export const deleteUserByOrganization = async (
  organizeUuid: string,
  userUuid: string,
) => {
  const response = await customerAPI.delete<ApiResponse<{ success: boolean; message: string }>>(
    `/organization/${organizeUuid}/users/${userUuid}`,
  );
  return response.data;
};

export const getAllPhoneWhitelistByOrganization = async (
  organizeUuid: string,
  params: { page: number; limit: number },
) => {
  const response = await customerAPI.get<
    ApiResponse<{
      phoneLists: IPhoneWhitelist[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    }>
  >(`/organization/${organizeUuid}/phone-white-list`, {
    params: {
      page: params.page,
      limit: params.limit,
    },
  });
  return response.data;
};

export const checkPhoneWhiteList = async (params: {
  countryCode: string;
  phoneNumber: string;
}) => {
  const response = await customerAPI.get<ApiResponse<{ isValid?: boolean; code?: string }>>(
    `/organization/check/${params.countryCode}/${params.phoneNumber}/white-list`,
  );
  return response.data;
};

export const addPhoneWhitelist = async (payload: IReqAddPhoneWhitelist[]) => {
  const response = await customerAPI.post<ApiResponse<boolean>>(
    `/organization/phone-white-list`,
    payload,
  );
  return response.data;
};

export const deletePhoneWhitelist = async (params: {
  organizationUuid: string;
  phoneId: number;
}) => {
  const response = await customerAPI.delete<ApiResponse<{ success: boolean; message: string }>>(
    `/organization/${params.organizationUuid}/phone-white-list/${params.phoneId}`,
  );
  return response.data;
};

export const validateInvitePhoneNumber = async (phoneNumber: string) => {
  const response = await customerAPI.post<ApiResponse<IInviteValidatePhoneResponse>>(
    `/organization/invite/validate-phone/`,
    { phone: phoneNumber, countryCode: "66" },
  );
  return response.data;
};

export const createinviteUserToOrganization = async (
  payload: IReqInviteUser,
) => {
  const response = await customerAPI.post<ApiResponse<ISendInviteResponse>>(
    `/organization/invite`,
    payload,
  );
  return response.data;
};

export const checkDuplicateEmail = async (email: string) => {
  const response = await customerAPI.post<ApiResponse<ICheckExistResponse>>(
    `/organization/check/email/${email}`,
  );
  return response.data;
};

export const checkRegistrationNumberExists = async (
  registrationNumber: string,
) => {
  const response = await customerAPI.post<ApiResponse<ICheckExistResponse>>(
    `/organization/check-registration-number-exists`,
    { registrationNumber },
  );
  return response.data;
};

export const checkTaxIdExists = async (taxId: string) => {
  const response = await customerAPI.post<ApiResponse<ICheckExistResponse>>(
    `/organization/check-tax-id-exists`,
    { taxId },
  );
  return response.data;
};

export const getExitRequests = async (
  organizeUuid: string,
  params: { page: number; pageLimit: number; status?: string },
) => {
  const response = await customerAPI.get<ApiResponse<IGetExitOrganizationRequests>>(
    `/organization/exit-requests`,
    {
      headers: {
        'organization-uuid': organizeUuid,
      },
      params: {
        page: params.page,
        limit: params.pageLimit,
        status: params.status,
      },
    }
  )
  return response.data;
}

export const updateExitRequestStatus = async (
  organizeUuid: string,
  exitRequestId: number,
  status: 'APPROVED' | 'REJECTED',
) => {
  const response = await customerAPI.patch<ApiResponse<{ success: boolean; message: string }>>(
    `/organization/exit-requests/${exitRequestId}`,
    { status },
    {
      headers: {
        'organization-uuid': organizeUuid,
      },
    }
  );
  return response.data;
}

export const createExitOrganizationRequest = async (
  organizeUuid: string,
  userId: number,
) => {
  const response = await customerAPI.post<ApiResponse<ICreateExitRequestOragizationResponse>>(
    `/organization/exit-requests`,
    { userId },
    {
      headers: {
        'organization-uuid': organizeUuid,
      },
    }
  );
  return response.data;
}