import { LoginType } from '../enum/auth-center.enum';

export interface LoginRequest {
  loginType: LoginType;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
  password: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface UpdateProfile {
  prefixName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePictureUrl?: string;
}

export interface CheckExistRequest {
  type: 'PHONE_NUMBER' | 'EMAIL';
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
}

export interface GetCisNumber {
  type: 'EMAIL' | 'PHONE_NUMBER';
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
}