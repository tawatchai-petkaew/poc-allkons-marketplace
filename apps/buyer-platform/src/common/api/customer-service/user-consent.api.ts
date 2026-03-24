import { customerAPI } from '@/utils/axios';

const prefix = '/v1/user-consent';
const organizationPrefix = '/v1/organization-consent';

export const sendConsentMessage = async (data: {
  phoneNumber: string;
  consentIds: number[];
  akIdConsentIds?: string[];
  tokenAllkonsId?: string;
}) => {
  const { data: responseData } = await customerAPI.post(`${prefix}`, data);
  return responseData;
};

export const sendOrganizationConsentMessage = async (data: {
  organizationId: number;
  consentIds: number[];
  akIdConsentIds?: string[];
  tokenAllkonsId?: string;
}) => {
  const { data: responseData } = await customerAPI.post(
    `${organizationPrefix}`,
    data
  );
  return responseData;
};
