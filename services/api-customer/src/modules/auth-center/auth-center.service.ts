import { CallApiErrorHandler } from '../../utils/helpers';
import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import {
  RegisterWithPhoneNumber,
  SendSmsOtp,
  VerifySmsOtp,
} from '../register/interface/register.interface';
import {
  CheckExistRequest,
  GetCisNumber,
  LoginRequest,
  LogoutRequest,
  UpdateProfile,
} from './interfaces/api-request.interface';
import { LoginType } from './enum/auth-center.enum';
import { AutoTrace } from 'allkons-api-helper';
import { ErrorCode } from '@/common/enum/global-error-code.enum';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class AuthCenterService {
  constructor(
    @Inject('AUTH_CENTER_URL') private readonly authCenterUrl: string,
    @Inject('AUTH_CLIENT_ID') private readonly authCenterClientId: string,
    @Inject('AUTH_CLIENT_SECRET')
    private readonly authCenterClientSecret: string,
  ) {}

  private accessToken: string | null = null;
  private authTokenExpiration: Date | null = null;

  private async generateAuthToken(): Promise<void> {
    console.log('ANTIGRAVITY_DEBUG: generateAuthToken executed');
    const url = `${this.authCenterUrl}/api/v1/client/token`;
    const headers = {
      Authorization: `Basic ${Buffer.from(
        `${this.authCenterClientId}:${this.authCenterClientSecret}`,
      ).toString('base64')}`,
      'Accept-Encoding': 'identity',
    };
    try {
      const response = await axios.get(url, { headers, decompress: false });
      this.accessToken = response.data.data.accessToken;
      this.authTokenExpiration = new Date(
        Date.now() + response.data.data.expiresIn * 1000,
      );
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Error generating auth token',
      );
    }
  }

  private async getAuthToken(): Promise<string> {
    if (
      (!this.accessToken && !this.authTokenExpiration) ||
      new Date() >= this.authTokenExpiration
    ) {
      await this.generateAuthToken();
    }
    return this.accessToken!;
  }

  async updateProfile(token: string, data: UpdateProfile) {
    const url = `${this.authCenterUrl}/api/v1/account/update-profile`;
    try {
      const response = await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status !== 200) {
        throw new HttpException(
          {
            statusCode: response.status,
            error: {
              message: 'Failed to update profile to Auth Center',
              code: ErrorCode.AUTH_UPDATE_PROFILE_FAILED,
            },
          },
          response.status,
        );
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update profile to Auth Center:', error);
      throw new HttpException(
        {
          statusCode: error.response?.statusCode || 500,
          data: error.response?.error || 'Unknown error',
          error: {
            message: 'Failed to update profile to Auth Center',
            code: error.response?.code || ErrorCode.AUTH_INTERNAL_ERROR,
          },
        },
        error.response?.statusCode || 500,
      );
    }
  }

  async updateAuthCenterCisNumber(cisNumber: string, authToken: string) {
    const url = `${this.authCenterUrl}/api/v1/account/link-cis`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
      'Accept-Encoding': 'identity',
    };

    const body = {
      cisNumber: cisNumber,
    };

    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      if (response.status !== 200) {
        throw new HttpException(
          {
            statusCode: response.status,
            error: {
              message: 'Failed to update Auth Center CIS number',
              code: ErrorCode.AUTH_UPDATE_CIS_FAILED,
            },
          },
          response.status,
        );
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update Auth Center CIS number:', error);
      throw new HttpException(
        {
          statusCode: error.response?.statusCode || 500,
          data: error.response?.error || 'Unknown error',
          error: {
            message: 'Failed to update Auth Center CIS number',
            code: error.response?.code || ErrorCode.AUTH_INTERNAL_ERROR,
          },
        },
        error.response?.statusCode || 500,
      );
    }
  }

  async updateAuthCenterUsername(username: string, authToken: string) {
    const url = `${this.authCenterUrl}/api/v1/account/update-username`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
      'Accept-Encoding': 'identity',
    };

    const body = {
      username: username,
    };

    try {
      const response = await axios.put(url, body, {
        headers,
        decompress: false,
      });
      if (response.status !== 200) {
        throw new HttpException(
          {
            statusCode: response.status,
            error: {
              message: 'Failed to update Auth Center username',
              code: ErrorCode.AUTH_UPDATE_USERNAME_FAILED,
            },
          },
          response.status,
        );
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update Auth Center username:', error);
      throw new HttpException(
        {
          data: error.response?.error || 'Unknown error',
          error: {
            message: 'Failed to update Auth Center username',
            code: error.response?.code || ErrorCode.AUTH_INTERNAL_ERROR,
          },
        },
        error.response?.statusCode || 500,
      );
    }
  }

  async registerWithPhoneNumber(
    bodyDto: RegisterWithPhoneNumber,
  ): Promise<any> {
    const url = `${this.authCenterUrl}/api/v1/auth/register`;
    await this.getAuthToken();
    const accessToken = this.accessToken;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    const body: RegisterWithPhoneNumber = {
      countryCode: bodyDto.countryCode,
      phoneNumber: bodyDto.phoneNumber,
      password: bodyDto.password,
      isIncludeAKID: true,
    };
    try {
      const response = await axios.post(url, body, { headers });
      if (response.status !== 201) {
        throw new HttpException(
          {
            error: {
              message: 'Failed to register with phone number in Auth Center',
              code: ErrorCode.AUTH_REGISTER_PHONE_FAILED,
            },
          },
          response.status,
        );
      }
      const data = response.data?.data || {};
      const result = {
        isSuccess: response.data?.code ?? null,
        phoneNumber: bodyDto.phoneNumber ?? null,
        accessToken: data.accessToken ?? null,
        refreshToken: data.refreshToken ?? null,
        expiresIn: data.expiresIn ?? null,
        refreshExpiresIn: data.refreshExpiresIn ?? null,
        idToken: data.idToken ?? null,
        sessionState: data.sessionState ?? null,
        scope: data.scope ?? null,
        akidAccessToken: data.akidAccessToken ?? null,
        akidRefreshToken: data.akidRefreshToken ?? null,
      };
      return result;
    } catch (error) {
      console.error('Error registering with phone number:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to register with phone number',
          data: error.response?.error || 'Unknown error',
          error: {
            message: 'Failed to register with phone number',
            code: error.response?.code || ErrorCode.AUTH_INTERNAL_ERROR,
          },
        },
        error.response?.statusCode || 500,
      );
    }
  }

  async generateNewAccessToken(
    refreshToken: string,
  ): Promise<ReturnTokenResponse> {
    const url = `${this.authCenterUrl}/api/v1/auth/refresh-token`;

    try {
      await this.getAuthToken();
      const clientToken = this.accessToken;

      if (!clientToken) {
        throw new UnauthorizedException({
          code: ErrorCode.AUTH_GENERATE_TOKEN_FAILED,
          message: 'Failed to obtain client authentication token',
          data: 'Client token is null or undefined',
        });
      }

      const headers = {
        Authorization: `Bearer ${clientToken}`,
        'Content-Type': 'application/json',
      };

      const body = {
        refreshToken,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorData = {};
        let errorMessage = 'Failed to generate new access token';

        try {
          errorData = await response.json();
          errorMessage = (errorData as any)?.message || errorMessage;
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError);
          errorData = { error: 'Failed to parse error response' };
        }

        throw new HttpException(
          {
            error: {
              message: errorMessage,
            },
            data: errorData,
          },
          response.status,
        );
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new HttpException(
          {
            error: {
              message: 'Failed to parse response from auth center',
            },
            data: 'Invalid JSON response',
          },
          500,
        );
      }

      return {
        isSuccess: responseData?.code ?? null,
        phoneNumber: responseData?.data?.phoneNumber ?? null,
        accessToken: responseData?.data?.accessToken ?? null,
        expiresIn: responseData?.data?.expiresIn ?? null,
        refreshToken: responseData?.data?.refreshToken ?? null,
        refreshExpiresIn: responseData?.data?.refreshExpiresIn ?? null,
        idToken: responseData?.data?.idToken ?? null,
        sessionState: responseData?.data?.sessionState ?? null,
        scope: responseData?.data?.scope ?? null,
      };
    } catch (error) {
      console.error('Error generating new access token:', error);

      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle network errors or other fetch errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new HttpException(
          {
            data: error.message,
            error: {
              message: 'Network error: Unable to connect to auth center',
            },
          },
          503,
        );
      }

      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new HttpException(
          {
            statusCode: 408,
            data: error.message,
            error: {
              code: ErrorCode.REQUEST_TIMEOUT,
              message: 'Request timeout: Auth center did not respond in time',
            },
          },
          408,
        );
      }

      // Generic error fallback
      throw new HttpException(
        {
          data: error?.message || 'Unknown error',
          error: {
            message: 'Unexpected error occurred while generating access token',
          },
        },
        500,
      );
    }
  }

  async loginPhoneOrEmail(loginData: LoginRequest): Promise<LoginResponse> {
    const url = `${this.authCenterUrl}/api/v1/auth/login`;

    try {
      await this.getAuthToken();
      const clientToken = this.accessToken;

      if (!clientToken) {
        throw new HttpException(
          {
            error: {
              message: 'Failed to obtain client authentication token',
              code: ErrorCode.AUTH_GENERATE_TOKEN_FAILED,
            },
            data: 'Client token is null or undefined',
          },
          401,
        );
      }

      const headers = {
        Authorization: `Bearer ${clientToken}`,
        'Content-Type': 'application/json',
      };

      const body: LoginRequest = {
        loginType: loginData.loginType,
        countryCode: loginData.countryCode,
        phoneNumber: loginData.phoneNumber,
        password: loginData.password,
      };

      if (loginData.loginType === LoginType.EMAIL) {
        delete body.countryCode;
        delete body.phoneNumber;
        body.email = loginData.email;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorData = {};
        let errorMessage = 'Failed to login with phone number';

        try {
          errorData = await response.json();
          errorMessage = (errorData as any)?.message || errorMessage;
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError);
          errorData = { error: 'Failed to parse error response' };
        }

        throw new HttpException(
          {
            statusCode: response.status,
            error: {
              code: ErrorCode.AUTH_LOGIN_FAILED,
              message: errorMessage,
            },
          },
          response.status,
        );
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new HttpException(
          {
            statusCode: 500,
            error: {
              message: 'Failed to parse response from auth center',
              code: ErrorCode.AUTH_INTERNAL_ERROR,
            },
            data: 'Invalid JSON response',
          },
          500,
        );
      }
      const data = responseData?.data || {};
      return {
        isSuccess:
          responseData?.code === 'SUCCESS' || responseData?.success === true,
        phoneNumber: data.phoneNumber ?? loginData.phoneNumber,
        accessToken: data.accessToken ?? null,
        refreshToken: data.refreshToken ?? null,
        expiresIn: data.expiresIn ?? null,
        refreshExpiresIn: data.refreshExpiresIn ?? null,
        idToken: data.idToken ?? null,
        sessionState: data.sessionState ?? null,
        scope: data.scope ?? null,
      };
    } catch (error) {
      console.error('Error during login:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle network errors or other fetch errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new HttpException(
          {
            statusCode: 503,
            error: {
              message: 'Network error: Unable to connect to auth center',
            },
            data: error.message,
          },
          503,
        );
      }

      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new HttpException(
          {
            statusCode: 408,
            data: error.message,
            error: {
              message: 'Request timeout: Auth center did not respond in time',
            },
          },
          408,
        );
      }

      // Generic error fallback
      throw new HttpException(
        {
          statusCode: 500,
          data: error?.message || 'Unknown error',
          error: {
            message: 'Unexpected error occurred during login',
            code: error.response?.code || ErrorCode.AUTH_INTERNAL_ERROR,
          },
        },
        500,
      );
    }
  }

  async loginWithOTP(bodyDto: VerifySmsOtp): Promise<any> {
    const url = `${this.authCenterUrl}/api/v1/auth/login-with-otp`;

    await this.getAuthToken();
    const getAuthToken = this.accessToken;
    const headers = {
      Authorization: `Bearer ${getAuthToken}`,
      'Content-Type': 'application/json',
    };
    const body: VerifySmsOtp = {
      countryCode: bodyDto.countryCode,
      pin: bodyDto.pin,
      token: bodyDto.token,
      phoneNumber: bodyDto.phoneNumber,
    };
    try {
      const result = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const response = await result.json();
      if (!result?.ok) {
        let errorData = {};
        let errorMessage = 'Failed to login with OTP';

        try {
          errorData = response;
          errorMessage = (errorData as any)?.message || errorMessage;
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError);
          errorData = { error: 'Failed to parse error response' };
        }

        throw new HttpException(
          {
            statusCode: result.status,
            data: errorData,
            error: {
              code: ErrorCode.AUTH_LOGIN_FAILED,
              message: errorMessage,
            },
          },
          result.status,
        );
      }
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: 500,
          data: error?.message || 'Unknown error',
          error: {
            message: 'Unexpected error occurred while login with OTP',
            code: error.response?.code || ErrorCode.AUTH_INTERNAL_ERROR,
          },
        },
        500,
      );
    }
  }

  async getAccountInformation(
    accessToken: string,
  ): Promise<AccountInformationResponse> {
    const url = `${this.authCenterUrl}/api/v1/account/information`;

    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.get(url, { headers });

      if (response.status !== 200) {
        throw new HttpException(
          {
            statusCode: response.status,
            error: {
              code: ErrorCode.AUTH_GET_ACCOUNT_INFO_FAILED,
              message: 'Failed to get account information',
            },
          },
          response.status,
        );
      }

      const data = response.data?.data || {};

      return {
        id: data.id ?? null,
        keycloakUserId: data.keycloakUserId ?? null,
        akidId: data.akidId ?? null,
        accountStatus: data.accountStatus ?? null,
        cisNumber: data.cisNumber ?? null,
        countryCode: data.countryCode ?? null,
        prefixName: data.prefixName ?? null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        phoneNumber: data.phoneNumber ?? null,
        dateOfBirth: data.dateOfBirth ?? null,
        gender: data.gender ?? null,
        profilePictureUrl: data.profilePictureUrl ?? null,
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
      };
    } catch (error) {
      console.error('Error getting account information:', error);

      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle axios errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const errorMessage =
          error.response?.data?.message || 'Failed to get account information';
        const errorData = error.response?.data || 'Unknown error';

        throw new HttpException(
          {
            statusCode: status,
            data: errorData,
            error: {
              code: ErrorCode.AUTH_GET_ACCOUNT_INFO_FAILED,
              message: errorMessage,
            },
          },
          status,
        );
      }

      // Generic error fallback
      throw new HttpException(
        {
          statusCode: 500,
          message:
            'Unexpected error occurred while getting account information',
          data: error?.message || 'Unknown error',
          error: {
            code: error.response?.data?.code || ErrorCode.AUTH_INTERNAL_ERROR,
            message: error?.name || 'UNKNOWN_ERROR',
          },
        },
        500,
      );
    }
  }

  async verifySmsOtp(bodyDto: VerifySmsOtp): Promise<any> {
    const url = `${this.authCenterUrl}/api/v1/sms/verify-otp`;

    await this.getAuthToken();
    const getAuthToken = this.accessToken;
    const headers = {
      Authorization: `Bearer ${getAuthToken}`,
    };
    const body: VerifySmsOtp = {
      countryCode: bodyDto.countryCode,
      pin: bodyDto.pin,
      token: bodyDto.token,
      phoneNumber: bodyDto.phoneNumber,
    };
    try {
      const response = await axios.post(url, body, { headers });
      if (response.status !== 200) {
        throw new HttpException(
          {
            message: response.data?.message || 'Failed to verify SMS OTP',
            data: response.data?.data,
            error: {
              code: ErrorCode.AUTH_VERIFY_SMS_OTP_FAILED,
              message: response.data?.message || 'Failed to verify SMS OTP',
            },
          },
          response.status,
        );
      }
      return response.data;
    } catch (error) {
      console.error('Error verifying SMS OTP:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const errorMessage =
          error.response?.data?.message || 'Failed to verify SMS OTP';
        const errorData = error.response?.data || 'Unknown error';

        throw new HttpException(
          {
            statusCode: status,
            data: errorData,
            error: {
              code: ErrorCode.AUTH_VERIFY_SMS_OTP_FAILED,
              message: errorMessage,
            },
          },
          status,
        );
      }
      throw new HttpException(
        {
          statusCode: 500,
          data: error?.message || 'Unknown error',
          error: {
            code: error.response?.data?.code || ErrorCode.AUTH_INTERNAL_ERROR,
            message: error?.name || 'UNKNOWN_ERROR',
          },
        },
        500,
      );
    }
  }

  async logoutWithRefreshToken(logoutData: LogoutRequest): Promise<any> {
    const url = `${this.authCenterUrl}/api/v1/auth/logout`;

    try {
      await this.getAuthToken();
      const clientToken = this.accessToken;

      if (!clientToken) {
        throw new HttpException(
          {
            statusCode: 401,
            data: 'Client token is null or undefined',
            error: {
              code: ErrorCode.AUTH_GENERATE_TOKEN_FAILED,
              message: 'Failed to obtain client authentication token',
            },
          },
          401,
        );
      }

      const headers = {
        Authorization: `Bearer ${clientToken}`,
        'Content-Type': 'application/json',
      };

      const body = {
        refreshToken: logoutData.refreshToken,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorData = {};
        let errorMessage = 'Failed to logout with refresh token';

        try {
          errorData = await response.json();
          errorMessage = (errorData as any)?.message || errorMessage;
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError);
          errorData = { error: 'Failed to parse error response' };
        }

        throw new HttpException(
          {
            statusCode: response.status,
            data: errorData,
            error: {
              code: ErrorCode.AUTH_LOGOUT_FAILED,
              message: errorMessage,
            },
          },
          response.status,
        );
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new HttpException(
          {
            statusCode: 500,
            error: {
              code: ErrorCode.AUTH_INTERNAL_ERROR,
              message: 'Failed to parse response from auth center',
            },
            data: 'Invalid JSON response',
          },
          500,
        );
      }
      const data = responseData?.data || {};
      return {
        isSuccess:
          responseData?.code === 'SUCCESS' || responseData?.success === true,
      };
    } catch (error) {
      console.error('Error during logout:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle network errors or other fetch errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new HttpException(
          {
            statusCode: 503,
            error: {
              code: ErrorCode.SERVICE_UNAVAILABLE,
              message: 'Network error: Unable to connect to auth center',
            },
          },
          503,
        );
      }

      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new HttpException(
          {
            statusCode: 408,
            data: error.message,
            error: {
              code: ErrorCode.REQUEST_TIMEOUT,
              message: 'Request timeout: Auth center did not respond in time',
            },
          },
          408,
        );
      }

      // Generic error fallback
      throw new HttpException(
        {
          statusCode: 500,
          data: error?.message || 'Unknown error',
          error: {
            code: error.response?.data?.code || ErrorCode.AUTH_INTERNAL_ERROR,
            message: 'Unexpected error occurred during logout',
          },
        },
        500,
      );
    }
  }

  async sendSmsOtp(payload: SendSmsOtp): Promise<any> {
    const url = `${this.authCenterUrl}/api/v1/sms/send-otp`;

    await this.getAuthToken();
    const accessToken = this.accessToken;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(url, payload, { headers });
      if (response.status !== 200) {
        throw new HttpException(
          {
            statusCode: response.status,
            message: response.data?.message || 'Failed to send SMS OTP',
            data: response.data?.data || {
              code: ErrorCode.AUTH_SEND_SMS_OTP_FAILED,
            },
          },
          response.status,
        );
      }
      return response.data;
    } catch (error) {
      console.error('Error sending SMS OTP:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const errorMessage =
          error.response?.data?.message || 'Failed to send SMS OTP';
        const errorData = error.response?.data || 'Unknown error';

        throw new HttpException(
          {
            statusCode: status,
            data: errorData,
            error: {
              code: ErrorCode.AUTH_SEND_SMS_OTP_FAILED,
              message: errorMessage,
            },
          },
          status,
        );
      }
      throw new HttpException(
        {
          statusCode: 500,
          data: error?.message || 'Unknown error',
          error: {
            code: ErrorCode.AUTH_SEND_SMS_OTP_FAILED,
            message: 'Unexpected error occurred while sending SMS OTP',
          },
        },
        500,
      );
    }
  }

  async sendEmailOtp(payload: {
    email: string;
  }): Promise<{ status: string; refno: string; method: string }> {
    const url = `${this.authCenterUrl}/api/v1/email/send-otp`;

    await this.getAuthToken();
    const accessToken = this.accessToken;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await axios.post(url, payload, { headers });
      if (response.status !== 200) {
        throw new HttpException(
          {
            statusCode: response.status,
            data: response.data?.data || {},
            error: {
              code: ErrorCode.AUTH_SEND_EMAIL_OTP_FAILED,
              message: response.data?.message || 'Failed to send Email OTP',
            },
          },
          response.status,
        );
      }
      return response.data;
    } catch (error) {
      console.error('Error sending Email OTP:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const errorMessage =
          error.response?.data?.message || 'Failed to send Email OTP';
        const errorData = error.response?.data || 'Unknown error';

        throw new HttpException(
          {
            statusCode: status,
            data: errorData,
            error: {
              code: ErrorCode.AUTH_SEND_EMAIL_OTP_FAILED,
              message: errorMessage,
            },
          },
          status,
        );
      }
      throw new HttpException(
        {
          statusCode: 500,
          data: error?.message || 'Unknown error',
          error: {
            code: ErrorCode.AUTH_SEND_EMAIL_OTP_FAILED,
            message: 'Unexpected error occurred while sending Email OTP',
          },
        },
        500,
      );
    }
  }

  async verifyEmailOtp(payload: {
    pin: string;
    refno: string;
    email: string;
  }): Promise<any> {
    const url = `${this.authCenterUrl}/api/v1/email/verify-otp`;

    await this.getAuthToken();
    const accessToken = this.accessToken;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await axios.post(url, payload, { headers });
      if (response.status !== 200) {
        throw new HttpException(
          {
            statusCode: response.status,
            data: response.data?.data,
            error: {
              code: ErrorCode.AUTH_VERIFY_EMAIL_OTP_FAILED,
              message: response.data?.message || 'Failed to verify Email OTP',
            },
          },
          response.status,
        );
      }
      return response.data;
    } catch (error) {
      console.error('Error verifying Email OTP:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const errorMessage =
          error.response?.data?.message || 'Failed to verify Email OTP';
        const errorData = error.response?.data || 'Unknown error';

        throw new HttpException(
          {
            statusCode: status,
            data: errorData,
            error: {
              code: ErrorCode.AUTH_VERIFY_EMAIL_OTP_FAILED,
              message: errorMessage,
            },
          },
          status,
        );
      }
      throw new HttpException(
        {
          statusCode: 500,
          data: error?.message || 'Unknown error',
          error: {
            code: ErrorCode.AUTH_VERIFY_EMAIL_OTP_FAILED,
            message: 'Unexpected error occurred while verifying Email OTP',
          },
        },
        500,
      );
    }
  }

  async checkExistValue(
    payload: CheckExistRequest,
  ): Promise<{ isExist: boolean }> {
    const url = `${this.authCenterUrl}/api/v1/account/check-exist-value`;

    await this.getAuthToken();
    const accessToken = this.accessToken;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    try {
      const response = await axios.post(url, payload, { headers });
      return { isExist: response.data?.data?.isExist ?? false };
    } catch (error) {
      console.error('Error checking exist value:', error);
      throw new HttpException(
        {
          statusCode: error.response?.statusCode || 500,
          data: error.response?.error || 'Unknown error',
          error: {
            message: 'Failed to check exist value',
            code: ErrorCode.AUTH_INTERNAL_ERROR,
          },
        },
        error.response?.statusCode || 500,
      );
    }
  }

  async getCisNumber(
    body: GetCisNumber,
  ): Promise<{ cisNumber: string | null }> {
    const url = `${this.authCenterUrl}/api/v1/account/get-cis-number`;
    await this.getAuthToken();
    const accessToken = this.accessToken;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    try {
      const response = await axios.post(url, body, { headers });
      return { cisNumber: response.data?.data?.cisNumber ?? null };
    } catch (error) {
      console.error('Error getting CIS number:', error);
      throw new HttpException(
        {
          statusCode: error.response?.statusCode || 500,
          data: error.response?.error || 'Unknown error',
          error: {
            message: 'Failed to get CIS number',
            code: ErrorCode.AUTH_INTERNAL_ERROR,
          },
        },
        error.response?.statusCode || 500,
      );
    }
  }

  async upSertEmail(
    email: string,
    authToken: string,
  ): Promise<{ statusCode: number; code: string }> {
    const url = `${this.authCenterUrl}/api/v1/email/upsert-email`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };
    try {
      const response = await axios.post(url, { email }, { headers });
      return { statusCode: response.status, code: response.data?.code };
    } catch (error) {
      console.error('Error upserting email:', error);
      throw new HttpException(
        {
          statusCode: error.response?.statusCode || 500,
          data: error.response?.error || 'Unknown error',
          error: {
            message: 'Failed to upsert email',
            code: ErrorCode.AUTH_INTERNAL_ERROR,
          },
        },
        error.response?.statusCode || 500,
      );
    }
  }
}
