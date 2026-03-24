import { customerAPI } from '@/utils/axios';
import Cookies from 'js-cookie';

const prefix = '/locations';

const auth = Cookies.get('auth');
const authData = auth ? JSON.parse(auth) : null;

export const getLocations = async (text: string) => {
  const { data } = await customerAPI.get(`${prefix}/search/${text}`, {
    headers: { Authorization: `Bearer ${authData?.accessToken}` },
  });
  return data;
};
