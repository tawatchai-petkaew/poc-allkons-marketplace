import { IRole, IReqRoleListParams } from "@/interfaces/role.interface";
import { customerAPI } from "@/libs/axios";
import { ApiResponse } from "@/types/common.type";

const prefix = "/roles";

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
  const response = await customerAPI.get<ApiResponse<IRole>>(
    `${prefix}/${payload.roleId}`
  );
  return response.data?.data;
};

export const getRolePermissionList = async () => {
  const response = await customerAPI.get<ApiResponse<any>>(
    `${prefix}/roles/permissions`
  );
  return response.data;
};

export const updateRolePermission = async ({
  organizationId,
  payload,
}: UpdatePermissionPayload) => {
  const response = await customerAPI.put<ApiResponse<any>>(
    `${prefix}/${organizationId}/update/role-permission`,
    payload
  );
  return response.data;
};

export const createRolePermission = async (
  organizationId: number,
  payload: CreateRolePermissionPayload
) => {
  const response = await customerAPI.post<ApiResponse<any>>(
    `${prefix}/${organizationId}/create/role-permission`,
    payload
  );
  return response.data;
};

export const deleteRole = async (roleId: number) => {
  const response = await customerAPI.delete<ApiResponse<any>>(
    `${prefix}/${roleId}/delete/role-permission`
  );
  return response.data;
};

export const getRoleList = async (params: IReqRoleListParams) => {
  const response = await customerAPI.get<ApiResponse<{ roles: IRole[] }>>(
    `${prefix}/roles`,
    {
      params: {
        page: params.page,
        limit: params.pageLimit,
      },
    }
  );
  return response.data;
};
