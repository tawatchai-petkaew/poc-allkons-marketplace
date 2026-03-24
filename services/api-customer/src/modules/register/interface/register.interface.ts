import { RegisterTypeAuthAccount } from '../enum/register.enum';

export interface CheckPhoneNumber {
  phoneNumber: string;
  countryCode: string;
  type: RegisterTypeAuthAccount;
}

export interface SendSmsOtp {
  phoneNumber: string;
  countryCode: string;
}

export interface VerifySmsOtp extends SendSmsOtp {
  pin: string;
  token: string;
}

export interface RegisterWithPhoneNumber {
  phoneNumber: string;
  countryCode: string;
  password: string;
  isIncludeAKID?: boolean;
}

export interface UserInfo {
  firstName: string;
  midName?: string;
  lastName: string;
  email?: string;
  refreshToken?: string;
  phoneNumber?: string;
  countryCode?: string;
}
