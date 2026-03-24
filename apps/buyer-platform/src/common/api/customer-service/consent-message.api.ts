import { customerAPI } from '@/utils/axios';

const prefix = '/v1/consent-message';

export const getConsentMessage = async (data: { type: string }) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}?type=${data.type}`
  );
  return responseData;
};

export const getAllConsentMessages = async (data: string[]) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/?types=[${data.join(',')}]`
  );
  return responseData;
};
