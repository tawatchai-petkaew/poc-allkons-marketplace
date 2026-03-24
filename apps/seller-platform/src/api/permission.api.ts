import { customerAPI } from '@/libs/axios';
import { ApiResponse } from '@/types/common.type';
import { IPermission } from '@/interfaces/role.interface';

const prefix = '/permissions';

export const getMasterPermissionList = async () => {
  const response = await customerAPI.get<ApiResponse<IPermission[]>>(`${prefix}`, {
    params: { page: 1, limit: 9999 },
  });
  return response.data;
};

export const getMyPermissionOrganization = async (
  organizationId: number | string
) => {
  const response = await customerAPI.get<ApiResponse<any>>(
    `${prefix}/${organizationId}/permissions/me`
  );
  return response.data;
};
