import { ICreateMerchantPayload } from '@/interfaces/merchant/merchant.request.interface';
import {
  IMerchantListResponse,
  IMerchantMembersResponse,
  IAvailableMerchantMembersResponse,
  IAddMerchantMembersResponse,
} from '@/interfaces/merchant/merchant.response.interface';
import { customerAPI } from '@/libs/axios';
import { ApiResponse } from '@/types/common.type';

export const createMerchant = async (payload: ICreateMerchantPayload) => {
  const response = await customerAPI.post<
    ApiResponse<{
      status: string;
      message: string;
      accessToken: string;
    }>
  >(`/v1/register/merchant`, payload);

  return response.data;
};

export const checkMerchantSlugExists = async (slug: string) => {
  const response = await customerAPI.get<ApiResponse<{ exists: boolean }>>(
    `/merchant/checkSlug/${slug}`
  );

  return response.data;
};

export const getMerchantByOrganization = async (organizationUuid: string) => {
  const response = await customerAPI.get<IMerchantListResponse>(
    '/merchant/organization/merchant-list',
    {
      headers: {
        'organization-uuid': organizationUuid,
      },
    }
  );

  return response.data;
};

export const setMerchantLastAccessed = async (slug: string) => {
  const response = await customerAPI.get<ApiResponse<{ success: boolean }>>(
    `/v1/merchant/current-merchant`,
    {
      headers: {
        CurrentMerchantSlug: slug,
      },
    }
  );

  return response.data;
};

export const getMerchantMembers = async (
  merchantUuid: string,
  page: number = 1,
  limit: number = 10
) => {
  const response = await customerAPI.get<ApiResponse<IMerchantMembersResponse>>(
    `/merchant/${merchantUuid}/members`,
    { params: { page, limit } }
  );

  return response.data;
};

export const getAvailableUsersForMerchant = async (
  merchantUuid: string,
  page: number = 1,
  limit: number = 100,
  search: string = ''
) => {
  const response = await customerAPI.get<ApiResponse<IAvailableMerchantMembersResponse>>(
    `/merchant/${merchantUuid}/users/available`,
    { params: { page, limit, search } }
  );

  return response.data;
};

export const addMerchantMembers = async (
  merchantId: number,
  members: { userId: number; roleId: number }[]
) => {
  const response = await customerAPI.post<ApiResponse<IAddMerchantMembersResponse>>(
    `/merchant/users`,
    {
      merchantId,
      users: members,
    }
  );

  return response.data;
};

export const updateMerchantMemberRole = async (
  merchantUuid: string,
  user: {
    userUuid: string;
    roleId: number;
  }
) => {
  const response = await customerAPI.put<ApiResponse<{ data: string }>>(
    `/merchant/${merchantUuid}/member`,
    { userUuid: user.userUuid, roleId: user.roleId }
  );

  return response.data;
};

export const removeMerchantMember = async (merchantUuid: string, userUuid: string) => {
  const response = await customerAPI.delete<ApiResponse<{ data: string }>>(
    `/merchant/${merchantUuid}/${userUuid}/member`
  );

  return response.data;
};
