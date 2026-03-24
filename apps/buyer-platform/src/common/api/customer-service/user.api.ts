import { customerAPI } from '../../../utils/axios';

const prefix = '/user';

export const checkIdCard = async (payload: { idCard: string }) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/check-id-card`,
    payload
  );
  return responseData;
};

export const checkRegisNumber = async (payload: {
  registrationNumber: string;
}) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/check-regis-number`,
    payload
  );
  return responseData;
};

export const getDraftUserKyc = async () => {
  const { data: responseData } = await customerAPI.get(`${prefix}/draft/kyc`);
  return responseData;
};

export const updateDraftUserKyc = async (payload: any) => {
  const { data: responseData } = await customerAPI.put(
    `${prefix}/draft/kyc`,
    payload
  );
  return responseData;
};

export const approveUserKyc = async () => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/approve/kyc`
  );
  return responseData;
};

export const uploadFileUserKyc = async (formData: FormData) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/draft/upload-document-cis`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return responseData;
};

export const deleteFileUserKyc = async (documentIds: string[]) => {
  const { data: responseData } = await customerAPI.delete(
    `${prefix}/draft/delete-document-cis`,
    {
      data: { documentIds },
    }
  );
  return responseData;
};

export const checkEmail = async (payload: { email: string }) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/check-email`,
    payload
  );
  return responseData;
};

export const sendOtpEmail = async (payload: { email: string }) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/otp/send-email`,
    payload
  );
  return responseData;
};

export const verifyOtpEmail = async (data: {
  email: string;
  pin: string;
  refno: string;
}) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/otp/verify-email`,
    data
  );
  return responseData;
};

export const checkPlatformByUserUuid = async (
  userUuid: string,
  token: string
) => {
  const response = await customerAPI.get(`/user/${userUuid}/check-platform`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
