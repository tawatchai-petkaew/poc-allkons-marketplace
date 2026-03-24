export interface AuthCenterResponse<T> {
  statusCode: boolean;
  code: string; // 'SUCCESS' | 'ERR001' | ...
  data: T;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  akidAccessToken?: string | null;
  akidRefreshToken?: string | null;
}

export interface AccountInfoResponse {
  id: string;
  username: string;
  keycloakUserId: string;
  akidId: number;
  accountStatus: 'ACTIVE' | 'LOCKED';
  cisNumber: string | null;
  countryCode: string | null;
  phoneNumber: string | null;
  email: string | null;
  prefixName: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: 'M' | 'F' | 'NP' | null; // Male, Female, Not Provided
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerifySmsOtpRequest {
  pin: string;
  token: string;
  countryCode: string;
  phoneNumber: string;
}

export enum LoginType {
  PHONE_NUMBER = 'PHONE_NUMBER',
  EMAIL = 'EMAIL',
}

export interface LoginRequest {
  loginType: LoginType;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
  password: string;
}
