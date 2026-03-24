import { Test, TestingModule } from '@nestjs/testing';
import { AuthCenterService } from './auth-center.service';
import axios from 'axios';
import { HttpException } from '@nestjs/common';
import { LoginType } from './enum/auth-center.enum';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthCenterService', () => {
  let service: AuthCenterService;
  const mockAuthUrl = 'http://test-url.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthCenterService,
        { provide: 'AUTH_CENTER_URL', useValue: mockAuthUrl },
        { provide: 'AUTH_CLIENT_ID', useValue: 'client-id' },
        { provide: 'AUTH_CLIENT_SECRET', useValue: 'client-secret' },
      ],
    }).compile();

    service = module.get<AuthCenterService>(AuthCenterService);

    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAuthToken', () => {
    it('should generate token successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            accessToken: 'token123',
            expiresIn: 3600,
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await (service as any).generateAuthToken();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/client/token'),
        expect.any(Object),
      );
      expect((service as any).accessToken).toBe('token123');
    });

    it('should handle errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect((service as any).generateAuthToken()).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getAuthToken', () => {
    it('should return existing token if valid', async () => {
      (service as any).accessToken = 'existing';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      const generateSpy = jest.spyOn(service as any, 'generateAuthToken');

      const token = await (service as any).getAuthToken();
      expect(token).toBe('existing');
      expect(generateSpy).not.toHaveBeenCalled();
    });

    it('should generate new token if expired', async () => {
      (service as any).accessToken = 'expired';
      (service as any).authTokenExpiration = new Date(Date.now() - 1000);
      const generateSpy = jest
        .spyOn(service as any, 'generateAuthToken')
        .mockResolvedValue(undefined);

      await (service as any).getAuthToken();
      expect(generateSpy).toHaveBeenCalled();
    });

    it('should generate new token if not exists', async () => {
      (service as any).accessToken = null;
      const generateSpy = jest
        .spyOn(service as any, 'generateAuthToken')
        .mockResolvedValue(undefined);

      await (service as any).getAuthToken();
      expect(generateSpy).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      mockedAxios.put.mockResolvedValue({
        status: 200,
        data: { success: true },
      });

      const result = await service.updateProfile('token', {
        firstName: 'Test',
      } as any);
      expect(result).toEqual({ success: true });
    });

    it('should throw exception on non-200 status', async () => {
      mockedAxios.put.mockResolvedValue({ status: 400, data: 'Error' });
      await expect(service.updateProfile('token', {} as any)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw exception on axios error', async () => {
      mockedAxios.put.mockRejectedValue({
        response: { statusCode: 500, error: 'Fail' },
      });
      await expect(service.updateProfile('token', {} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateAuthCenterCisNumber', () => {
    it('should update CIS successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { success: true },
      });
      const result = await service.updateAuthCenterCisNumber('cis123', 'token');
      expect(result).toEqual({ success: true });
    });

    it('should throw exception on error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Fail'));
      await expect(
        service.updateAuthCenterCisNumber('cis123', 'token'),
      ).rejects.toThrow(HttpException);
    });

    it('should throw exception on non-200 response', async () => {
      mockedAxios.post.mockResolvedValue({ status: 400, data: 'Fail' });
      await expect(
        service.updateAuthCenterCisNumber('cis123', 'token'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateAuthCenterUsername', () => {
    it('should update username successfully', async () => {
      mockedAxios.put.mockResolvedValue({
        status: 200,
        data: { success: true },
      });
      const result = await service.updateAuthCenterUsername('user1', 'token');
      expect(result).toEqual({ success: true });
    });

    it('should throw exception on non-200 response', async () => {
      mockedAxios.put.mockResolvedValue({ status: 400, data: 'Fail' });
      await expect(
        service.updateAuthCenterUsername('user1', 'token'),
      ).rejects.toThrow(HttpException);
    });

    it('should throw exception on error', async () => {
      mockedAxios.put.mockRejectedValue(new Error('Fail'));
      await expect(
        service.updateAuthCenterUsername('user1', 'token'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('registerWithPhoneNumber', () => {
    it('should register successfully', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);

      const mockResponse = {
        status: 201,
        data: {
          code: 'SUCCESS',
          data: { accessToken: 'user-token' },
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.registerWithPhoneNumber({
        countryCode: '66',
        phoneNumber: '123456789',
        password: 'pass',
      });

      expect(result.isSuccess).toBe('SUCCESS');
    });

    it('should throw if status is not 201', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      mockedAxios.post.mockResolvedValue({ status: 400, data: {} });

      await expect(service.registerWithPhoneNumber({} as any)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw on error', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      mockedAxios.post.mockRejectedValue(new Error('Fail'));
      await expect(service.registerWithPhoneNumber({} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('generateNewAccessToken', () => {
    it('should refresh token successfully', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          code: 'SUCCESS',
          data: { accessToken: 'new-token' },
        }),
      });

      const result = await service.generateNewAccessToken('refresh-token');
      expect(result.accessToken).toBe('new-token');
    });

    it('should throw on fetch error', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Fail' }),
      });

      await expect(
        service.generateNewAccessToken('refresh-token'),
      ).rejects.toThrow(HttpException);
    });

    it('should handle json parse error on failure', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockRejectedValue(new Error('Parse error')),
      });

      await expect(service.generateNewAccessToken('ref')).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle json parse error on success but bad body', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Parse error')),
      });

      await expect(service.generateNewAccessToken('ref')).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle fetch throwing error', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network'));
      await expect(service.generateNewAccessToken('ref')).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if client token missing', async () => {
      (service as any).accessToken = null;
      // Mock getAuthToken to NOT set token for some reason, or failed
      jest.spyOn(service as any, 'getAuthToken').mockResolvedValue(null);
      await expect(service.generateNewAccessToken('ref')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('loginPhoneOrEmail', () => {
    it('should login successfully', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          code: 'SUCCESS',
          data: { accessToken: 'login-token' },
        }),
      });

      const result = await service.loginPhoneOrEmail({
        loginType: LoginType.PHONE_NUMBER,
        countryCode: '66',
        phoneNumber: '123456789',
        password: 'pass',
      });

      expect(result.accessToken).toBe('login-token');
    });

    it('should handle email login', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          code: 'SUCCESS',
          data: { accessToken: 'login-token' },
        }),
      });

      const result = await service.loginPhoneOrEmail({
        loginType: LoginType.EMAIL,
        email: 'test@example.com',
        password: 'pass',
      });

      expect(result.accessToken).toBe('login-token');
    });

    it('should throw on error response', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Fail' }),
      });
      await expect(service.loginPhoneOrEmail({} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('loginWithOTP', () => {
    it('should login with OTP successfully', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      const result = await service.loginWithOTP({} as any);
      expect(result).toEqual({ success: true });
    });

    it('should throw on error', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Fail' }),
      });
      await expect(service.loginWithOTP({} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getAccountInformation', () => {
    it('should get account info successfully', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { data: { id: 123 } },
      });

      const result = await service.getAccountInformation('token');
      expect(result.id).toBe(123);
    });

    it('should throw on non-200', async () => {
      mockedAxios.get.mockResolvedValue({ status: 400, data: 'Error' });
      await expect(service.getAccountInformation('token')).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw on axios error', async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 500 },
      });
      // Wait, mockedAxios is mock. isAxiosError needs to check handling.
      // The code uses axios.isAxiosError(error)
      // We need to mock that behavior or ensure the error object satisfies it.
      // Standard jest mock of axios might not have isAxiosError implemented on the object itself unless we mock the module method.
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      await expect(service.getAccountInformation('token')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('verifySmsOtp', () => {
    it('should verify OTP successfully', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { success: true },
      });
      const result = await service.verifySmsOtp({} as any);
      expect(result).toEqual({ success: true });
    });

    it('should throw on non-200', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      mockedAxios.post.mockResolvedValue({
        status: 400,
        data: { message: 'Fail' },
      });
      await expect(service.verifySmsOtp({} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('logoutWithRefreshToken', () => {
    it('should logout successfully', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ code: 'SUCCESS' }),
      });

      const result = await service.logoutWithRefreshToken({
        refreshToken: 'ref',
      });
      expect(result.isSuccess).toBe(true);
    });

    it('should throw on error', async () => {
      (service as any).accessToken = 'valid-token';
      (service as any).authTokenExpiration = new Date(Date.now() + 10000);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Fail' }),
      });
      await expect(
        service.logoutWithRefreshToken({ refreshToken: 'ref' }),
      ).rejects.toThrow(HttpException);
    });
  });
});
