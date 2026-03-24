import { customerAPI } from '../../../utils/axios';
import Cookies from 'js-cookie';

const prefix = '/auth';
const prefixV1 = '/v1/auth';

interface LoginRequest {
  countryCode: string;
  phoneNumber: string;
  pin: string;
  token: string;
}

export const getMyUser = async (token: string) => {
  const { data } = await customerAPI.get(`${prefix}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const loginOtp = async (data: LoginRequest) => {
  const { data: responseData } = await customerAPI.post(
    `${prefixV1}/login-phone-otp`,
    data
  );
  return responseData;
};

export const logout = async (refreshToken: string) => {
  const auth = Cookies.get('auth');
  const authData = auth ? JSON.parse(auth) : null;
  const { data } = await customerAPI.post(
    `${prefix}/logoutWithRefreshToken`,
    {
      refreshToken: refreshToken,
    },
    {
      headers: {
        Authorization: `Bearer ${authData?.accessToken}`,
      },
    }
  );
  return data;
};

export const loginWithUsername = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const { data: responseData } = await customerAPI.post(`${prefixV1}/login`, {
    username,
    password,
    countryCode: '66',
  });
  return responseData;
};

export const registerAccountAndUser = async (payload: {
  countryCode: string;
  phoneNumber: string;
  password: string;
  isSeller: boolean;
}) => {
  const { data: responseData } = await customerAPI.post(
    `/v1/auth/register/account-and-user`,
    payload
  );
  return responseData;
};
