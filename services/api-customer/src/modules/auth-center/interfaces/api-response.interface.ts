interface AuthCenterResponse<T> {
  statusCode: boolean;
  code: string; // 'SUCCESS' | 'ERR001' | ...
  data: T;
}

interface ReturnTokenResponse {
  isSuccess: boolean;
  phoneNumber: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  idToken: string;
  sessionState: string;
  scope: string;
}

interface LoginResponse {
  isSuccess: boolean;
  phoneNumber?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
  idToken?: string;
  sessionState?: string;
  scope?: string;
}

interface AccountInformationResponse {
  id?: string;
  username?: string;
  keycloakUserId?: string;
  akidId?: boolean;
  accountStatus?: string;
  cisNumber?: string;
  countryCode?: string;
  prefixName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePictureUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
