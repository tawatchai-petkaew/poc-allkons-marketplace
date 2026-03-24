import { customerAPI } from '../../../utils/axios';
import { IDefaultQueryPagination } from '../../interfaces/common.interface';

const prefix = '/roles';

export interface UpdatePermissionPayload {
  organizationId: number;
  payload: {
    displayName?: string;
    roleId: number;
    permissions: number[];
  }[];
}

export interface CreateRolePermissionPayload {
  displayName: string;
  permissions: number[];
}

export const getRoleDetail = async (payload: { roleId: string }) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${payload.roleId}`
  );
  return responseData.data;
};

export const getRolePermissionList = async () => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/roles/permissions`
  );
  return responseData;
};

export const updateRolePermission = async ({
  organizationId,
  payload,
}: UpdatePermissionPayload) => {
  const { data: responseData } = await customerAPI.put(
    `${prefix}/${organizationId}/update/role-permission`,
    payload
  );
  return responseData;
};

export const createRolePermission = async (
  organizationId: number,
  payload: CreateRolePermissionPayload
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/${organizationId}/create/role-permission`,
    payload
  );
  return responseData;
};

export const deleteRole = async (roleId: number) => {
  const { data: responseData } = await customerAPI.delete(
    `${prefix}/${roleId}/delete/role-permission`
  );
  return responseData;
};

export const getRoleList = async (params: IDefaultQueryPagination) => {
  const { data: responseData } = await customerAPI.get(`${prefix}/roles`, {
    params: {
      page: params.page,
      limit: params.pageLimit,
    },
  });
  return responseData;
};
