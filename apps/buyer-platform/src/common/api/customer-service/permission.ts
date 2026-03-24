import { customerAPI } from '../../../utils/axios';

const prefix = '/permissions';

export const getMasterPermissionList = async () => {
  const { data: responseData } = await customerAPI.get(`${prefix}`, {
    params: { page: 1, limit: 9999 },
  });
  return responseData;
};

export const getMyPermissionOrganization = async (
  organizationId: number | string
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizationId}/permissions/me`
  );
  return responseData;
};
