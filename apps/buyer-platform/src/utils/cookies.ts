import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const getUserDataFromToken = () => {
  const auth = Cookies.get('auth');
  const authDataToken = auth ? JSON.parse(auth) : null;
  if (authDataToken) {
    const decode = jwtDecode(authDataToken.accessToken);
    return decode;
  }
  return null;
};
