import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import {
  AccountInfoResponse,
  AuthCenterResponse,
  TokenResponse,
  VerifySmsOtpRequest,
} from './types/auth-center.type';

@Injectable()
export class AuthCenterService {
  private readonly authCenterUrl = process.env.AUTH_CENTER_URL;
  private readonly authCenterClientId = process.env.AUTH_CLIENT_ID;
  private readonly authCenterClientSecret = process.env.AUTH_CLIENT_SECRET;
  constructor() {}

  // api get cert
  // https://keycloak-dev.allkons.com/realms/allkons/protocol/openid-connect/certs

  async getClientTokenFromAuthCenter(): Promise<{
    clientToken: string;
    expiresIn: number;
  }> {
    const url = `${this.authCenterUrl}/api/v1/client/token`;
    const headers = {
      Authorization: `Basic ${Buffer.from(
        `${this.authCenterClientId}:${this.authCenterClientSecret}`,
      ).toString('base64')}`,
    };
    try {
      const response = await axios.get(url, { headers });
      const clientToken = response.data.data.accessToken;
      const expiresIn = response.data.data.expiresIn; // number as seconds
      return { clientToken, expiresIn };
    } catch (error) {
      this.handleAxiosError(error, 'Get Client Token from Auth Center');
    }
  }

  async login(input: {
    loginType: string;
    countryCode?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
  }) {
    const url = `${this.authCenterUrl}/api/v1/auth/login`;
    const { clientToken } = await this.getClientTokenFromAuthCenter();
    const headers = {
      Authorization: `Bearer ${clientToken}`,
    };
    try {
      const response = await axios.post<AuthCenterResponse<TokenResponse>>(
        url,
        input,
        { headers },
      );
      return response.data.data;
    } catch (error) {
      this.handleAxiosError(error, 'Auth Center Login');
    }
  }

  async refreshToken(input: { refreshToken: string }) {
    const url = `${this.authCenterUrl}/api/v1/auth/refresh-token`;
    const { clientToken } = await this.getClientTokenFromAuthCenter();
    const headers = {
      Authorization: `Bearer ${clientToken}`,
    };
    try {
      const response = await axios.post<AuthCenterResponse<TokenResponse>>(
        url,
        input,
        { headers },
      );
      return response.data.data;
    } catch (error) {
      this.handleAxiosError(error, 'Auth Center Refresh Token');
    }
  }

  async loginWithOtpVerify(input: {
    pin: string;
    token: string;
    countryCode: string;
    phoneNumber: string;
  }) {
    // const url = `${this.authCenterUrl}/api/v1/auth/login-with-otp`;
    // const { clientToken } = await this.getClientTokenFromAuthCenter();
    // const headers = {
    //   Authorization: `Bearer ${clientToken}`,
    // };
    // try {
    //   const response = await axios.post(url, input, { headers });
    //   return response.data;
    // } catch (error) {
    //   this.handleAxiosError(error, 'Auth Center Login with OTP Verify');
    // }
  }

  async getAccountDetail(input: {
    accessToken: string;
  }): Promise<AccountInfoResponse> {
    const url = `${this.authCenterUrl}/api/v1/account/information`;
    const headers = {
      Authorization: `Bearer ${input.accessToken}`,
    };
    try {
      const response = await axios.get<AuthCenterResponse<AccountInfoResponse>>(
        url,
        {
          headers,
        },
      );
      return response.data.data;
    } catch (error) {
      this.handleAxiosError(error, 'Auth Center Get Account Detail');
    }
  }

  async register(input: {
    countryCode: string;
    phoneNumber: string;
    email?: string;
    password?: string;
  }) {
    const url = `${this.authCenterUrl}/api/v1/auth/register`;
    const { clientToken } = await this.getClientTokenFromAuthCenter();
    const headers = {
      Authorization: `Bearer ${clientToken}`,
    };
    try {
      const response = await axios.post<AuthCenterResponse<TokenResponse>>(
        url,
        {
          ...input,
          isIncludeAKID: true,
        },
        { headers },
      );
      return response.data.data;
    } catch (error) {
      this.handleAxiosError(error, 'Auth Center Register');
    }
  }

  async loginWithPhoneOTP(input: VerifySmsOtpRequest) {
    const url = `${this.authCenterUrl}/api/v1/auth/login-with-otp`;
    const { clientToken } = await this.getClientTokenFromAuthCenter();
    const headers = {
      Authorization: `Bearer ${clientToken}`,
    };
    try {
      const response = await axios.post<AuthCenterResponse<TokenResponse>>(
        url,
        input,
        { headers },
      );
      return response.data.data;
    } catch (error) {
      this.handleAxiosError(error, 'Auth Center Login OTP');
    }
  }

  private handleAxiosError(error: unknown, context: string): never {
    // Type guard for Axios error
    if (error instanceof AxiosError) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.message || error.message;

      // Log full error for debugging (server-side only)
      console.error(`[${context}]`, {
        status,
        message,
        url: error.config?.url,
        data: error.response?.data,
      });

      // Throw sanitized error to client
      throw new HttpException(
        {
          message: `${context}: ${message}`,
          code: error.response?.data?.code || 'EXTERNAL_SERVICE_ERROR',
          data: error.response?.data?.data || null,
        },
        status,
      );
    }

    // Unknown error
    console.error(`[${context}] Unknown error:`, error);
    throw new HttpException(
      {
        message: `${context}: Unknown error`,
        code: 'UNKNOWN_ERROR',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
