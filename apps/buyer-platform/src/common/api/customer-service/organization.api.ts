import { IUserWithOrganizationsResponseDto } from '../../interfaces/organization/user-with-org.response.interface';
import { customerAPI } from '../../../utils/axios';
import { IDefaultQueryPagination } from '../../interfaces/common.interface';

const prefix = '/organization';

export interface IReqDraftOrganization {
  organizationType: string;
  orgInfo: string;
  contactInfo: string;
  addressInfo: string;
  taxInfo: string;
  fileInfo: string;
  organizeId: number;
}

export interface IReqUpdateUser {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  roleId: number;
}

export const checkTaxId = async (payload: {
  taxId: string;
  organizeBranchNumber: string;
}) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/tax-id/check`,
    payload
  );
  return responseData;
};

export const getJuristicTypeList = async () => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/juristic-type`
  );
  return responseData;
};

export const getDraftOrganization = async (organizeId: number) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/draft-organize-info/${organizeId}`
  );
  return responseData;
};

export const saveDraftOrganization = async (
  payload: IReqDraftOrganization,
  draftOrganizationId: number
) => {
  const { data: responseData } = await customerAPI.put(
    `${prefix}/draft-organize-info/${draftOrganizationId}`,
    payload
  );
  return responseData;
};

export const uploadFileDraftOrganization = async (
  formData: FormData,
  draftOrganizeId: number
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/draft-organize-info/${draftOrganizeId}/upload-document-cis`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return responseData;
};

export const deleteFileDraftOrganization = async (
  draftOrganizeId: number,
  documentIds: string[]
) => {
  const { data: responseData } = await customerAPI.delete(
    `${prefix}/draft-organize-info/${draftOrganizeId}/delete-document-cis`,
    {
      data: { documentIds },
    }
  );
  return responseData;
};

export const approveKycOrgnization = async (draftOrganizeId: number) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/approve/organize-info/${draftOrganizeId}`
  );

  return responseData;
};

export const getUserByOrganizationId = async (
  organizeUuid: string,
  params: IDefaultQueryPagination
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizeUuid}/users`,
    {
      params: {
        page: params.page,
        limit: params.pageLimit,
      },
    }
  );
  return responseData;
};

export const updateUserByOrganization = async (
  organizeUuid: string,
  userUuid: string,
  payload: IReqUpdateUser
) => {
  const { data: responseData } = await customerAPI.patch(
    `${prefix}/${organizeUuid}/users/${userUuid}`,
    payload
  );
  return responseData;
};

export const updateUserByOrganizationRole = async (
  organizeId: number,
  userId: number,
  payload: { roleId: number }
) => {
  const { data: responseData } = await customerAPI.patch(
    `${prefix}/${organizeId}/users/${userId}/role`,
    payload
  );
  return responseData;
};

export const deleteUserByOrganization = async (
  organizeUuid: string,
  userUuid: string
) => {
  const { data: responseData } = await customerAPI.delete(
    `${prefix}/${organizeUuid}/users/${userUuid}`
  );
  return responseData;
};

export const getAllPhoneWhitelistByOrganization = async (
  organizeUuid: string,
  params: IDefaultQueryPagination
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizeUuid}/phone-white-list`,
    {
      params: {
        page: params.page,
        limit: params.pageLimit,
      },
    }
  );
  return responseData;
};

export const checkPhoneWhiteList = async ({
  countryCode,
  phoneNumber,
}: {
  countryCode: string;
  phoneNumber: string;
}) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/check/${countryCode}/${phoneNumber}/white-list`
  );
  return responseData;
};

export const addPhoneWhitelist = async (
  payload: {
    phoneNumber: string;
    countryCode?: string;
    label?: string;
    isActive?: boolean;
  }[]
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/phone-white-list`,
    payload
  );
  return responseData;
};

export const deletePhoneWhitelist = async ({
  organizationUuid,
  phoneId,
}: {
  organizationUuid: string;
  phoneId: number;
}) => {
  const { data: responseData } = await customerAPI.delete(
    `${prefix}/${organizationUuid}/phone-white-list/${phoneId}`
  );
  return responseData;
};

export const validateInvitePhoneNumber = async (phoneNumber: string) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/invite/validate-phone/`,
    { phone: phoneNumber, countryCode: '66' }
  );
  return responseData;
};

export const createinviteUserToOrganization = async (payload: {
  email: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  roleId: number;
  addInWhiteList: boolean;
}) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/invite`,
    payload
  );
  return responseData;
};

export const checkDuplicateEmail = async (email: string) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/check/email/${email}`
  );
  return responseData;
};

export const getUserWithOrganizations = async (
  userUuid: string,
  page?: number,
  limit?: number
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/user/${userUuid}`,
    {
      params: {
        page,
        limit,
      },
    }
  );
  return responseData;
};

export const getExitRequests = async (
  organizeUuid: string,
  params: IDefaultQueryPagination & { status?: string }
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/exit-requests`,
    {
      params: {
        page: params.page,
        limit: params.pageLimit,
        status: params.status,
      },
      headers: {
        'organization-uuid': organizeUuid,
      },
    }
  );
  return responseData;
};

export const updateExitRequestStatus = async (
  organizeUuid: string,
  exitRequestId: number,
  status: 'APPROVED' | 'REJECTED'
) => {
  const { data: responseData } = await customerAPI.patch(
    `${prefix}/exit-requests/${exitRequestId}`,
    { status: status },
    {
      headers: {
        'organization-uuid': organizeUuid,
      },
    }
  );
  return responseData;
};

export const createExitRequest = async (
  organizeUuid: string,
  userId: number
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/exit-requests`,
    { userId },
    {
      headers: {
        'organization-uuid': organizeUuid,
      },
    }
  );
  return responseData;
};

export const getOrganizationJuristicTypeMasterData = async () => {
  const response = await customerAPI.get(`organization/juristic-type`);

  return response.data;
};

export const createOrganization = async (payload: any) => {
  const response = await customerAPI.post(`organization`, payload);

  return response.data;
};

export const getUsersInviteStatusApprove = async (
  organizationUuid: string,
  params: IDefaultQueryPagination & { inviteStatus?: string }
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizationUuid}/users/invite-status-approve`,
    {
      params: {
        page: params.page,
        limit: params.pageLimit,
        inviteStatus: params.inviteStatus,
      },
    }
  );
  return responseData;
};

export const getApprovalRequestHistory = async (
  organizationUuid: string,
  params: IDefaultQueryPagination
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizationUuid}/users/approve-request-history`,
    {
      params: {
        page: params.page,
        limit: params.pageLimit,
      },
    }
  );
  return responseData;
};

export const getUsersInviteStatus = async (
  organizationUuid: string,
  params: IDefaultQueryPagination & { inviteStatus?: string }
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizationUuid}/users/invite-status`,
    {
      params: {
        page: params.page,
        limit: params.pageLimit,
        inviteStatus: params.inviteStatus,
      },
    }
  );
  return responseData;
};

export const getUsersInviteMultipleStatus = async (
  organizationUuid: string,
  params: IDefaultQueryPagination & { inviteMultipleStatus?: string[] }
) => {
  const queryParams: Record<string, any> = {
    page: params.page,
    limit: params.pageLimit,
  };

  if (params.inviteMultipleStatus) {
    params.inviteMultipleStatus.forEach((status, index) => {
      queryParams[`inviteMultipleStatus[${index}]`] = status;
    });
  }

  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizationUuid}/users/invite-multiple-status`,
    { params: queryParams }
  );
  return responseData;
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
  const { data: responseData } = await customerAPI.post(
    `${prefix}/address`,
    payload
  );
  return responseData;
};
