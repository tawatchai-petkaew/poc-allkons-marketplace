import { customerAPI } from '../../../utils/axios';

const prefix = '/organization';

// Whitelist interfaces
export interface IWhitelist {
  id: number;
  organizationId: number;
  phoneNumber: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReqAddWhitelist {
  phoneNumber: string;
  name?: string;
  organizationId: number;
}

export interface IReqUpdateWhitelist {
  phoneNumber?: string;
  name?: string;
  status?: string;
}

// Get whitelist
export const getWhitelist = async (organizationId: number) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizationId}/whitelist`
  );
  return responseData;
};

// Get whitelist detail
export const getWhitelistDetail = async (
  organizationId: number,
  whitelistId: number
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizationId}/whitelist/${whitelistId}`
  );
  return responseData;
};

// Add phone to whitelist
export const addPhoneToWhitelist = async (payload: IReqAddWhitelist) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/${payload.organizationId}/whitelist`,
    payload
  );
  return responseData;
};

// Update whitelist
export const updateWhitelist = async (
  organizationId: number,
  whitelistId: number,
  payload: IReqUpdateWhitelist
) => {
  const { data: responseData } = await customerAPI.put(
    `${prefix}/${organizationId}/whitelist/${whitelistId}`,
    payload
  );
  return responseData;
};

// Remove from whitelist
export const removeFromWhitelist = async (
  organizationId: number,
  whitelistId: number
) => {
  const { data: responseData } = await customerAPI.delete(
    `${prefix}/${organizationId}/whitelist/${whitelistId}`
  );
  return responseData;
};

// Bulk add to whitelist
export const bulkAddToWhitelist = async (
  organizationId: number,
  phoneNumbers: string[]
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/${organizationId}/whitelist/bulk`,
    { phoneNumbers }
  );
  return responseData;
};
