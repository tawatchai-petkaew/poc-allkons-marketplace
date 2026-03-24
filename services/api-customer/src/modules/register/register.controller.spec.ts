import { Test, TestingModule } from '@nestjs/testing';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import {
  phoneNumberDto,
  RegisterPhoneNumberDto,
  verifyOtpSmsDto,
  CreateShopDto,
} from './dto/create-register.dto';

describe('RegisterController', () => {
  let controller: RegisterController;
  let service: RegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegisterController],
      providers: [
        {
          provide: RegisterService,
          useValue: {
            checkPhoneNumber: jest.fn(),
            sendSmsOtp: jest.fn(),
            verifySmsOtp: jest.fn(),
            registerWithPhoneNumber: jest.fn(),
            createMerchant: jest.fn(),
            removeUserByTel: jest.fn(),
            clearRegisteredUser: jest.fn(),
            createAccount: jest.fn(),
            createUserProfile: jest.fn(),
            getUserProfile: jest.fn(),
            createOrganizationProfile: jest.fn(),
            updateUserRegistrationStatus: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: OrganizationService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RegisterController>(RegisterController);
    service = module.get<RegisterService>(RegisterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkPhoneNumber', () => {
    it('should call RegisterService.checkPhoneNumber with correct parameters', async () => {
      const dto: phoneNumberDto = {
        countryCode: '66',
        phoneNumber: '886924075',
      };
      const result = {
        statusCode: 200,
        code: 'SUCCESS',
        data: { isExist: true, isExistInSystem: false },
      };
      jest.spyOn(service, 'checkPhoneNumber').mockResolvedValue(result.data);

      expect(await controller.checkPhoneNumber(dto)).toBe(result.data);
      expect(service.checkPhoneNumber).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if RegisterService.checkPhoneNumber fails', async () => {
      const dto: phoneNumberDto = {
        countryCode: '66',
        phoneNumber: '886924075',
      };
      jest
        .spyOn(service, 'checkPhoneNumber')
        .mockRejectedValue(new Error('Service error'));

      await expect(controller.checkPhoneNumber(dto)).rejects.toThrow(
        'Service error',
      );
      expect(service.checkPhoneNumber).toHaveBeenCalledWith(dto);
    });

    it('should handle unexpected errors gracefully', async () => {
      const dto: phoneNumberDto = {
        countryCode: '66',
        phoneNumber: '886924075',
      };
      jest.spyOn(service, 'checkPhoneNumber').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(controller.checkPhoneNumber(dto)).rejects.toThrow(
        'Unexpected error',
      );
      expect(service.checkPhoneNumber).toHaveBeenCalledWith(dto);
    });
  });

  describe('sendSmsOtp', () => {
    it('should call RegisterService.sendSmsOtp with correct parameters', async () => {
      const dto: phoneNumberDto = {
        countryCode: '66',
        phoneNumber: '886924075',
      };
      const result = {
        status: 'success',
        token: 'token-test',
        refno: 'GMLYK',
        method: 'sms',
      };
      jest.spyOn(service, 'sendSmsOtp').mockResolvedValue(result);

      expect(await controller.sendSmsOtp(dto)).toBe(result);
      expect(service.sendSmsOtp).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if RegisterService.sendSmsOtp fails', async () => {
      const dto: phoneNumberDto = {
        countryCode: '66',
        phoneNumber: '886924075',
      };
      jest
        .spyOn(service, 'sendSmsOtp')
        .mockRejectedValue(new Error('Service error'));

      await expect(controller.sendSmsOtp(dto)).rejects.toThrow('Service error');
      expect(service.sendSmsOtp).toHaveBeenCalledWith(dto);
    });

    it('should handle unexpected errors gracefully', async () => {
      const dto: phoneNumberDto = {
        countryCode: '66',
        phoneNumber: '886924075',
      };
      jest.spyOn(service, 'sendSmsOtp').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(controller.sendSmsOtp(dto)).rejects.toThrow(
        'Unexpected error',
      );
      expect(service.sendSmsOtp).toHaveBeenCalledWith(dto);
    });
  });

  describe('verifySmsOtp', () => {
    it('should call RegisterService.verifySmsOtp with correct parameters', async () => {
      const dto: verifyOtpSmsDto = {
        countryCode: '66',
        phoneNumber: '886924075',
        otp: '123456',
        token: 'test-token',
      };
      const result = { status: 'success', message: 'Code is correct.' };
      jest.spyOn(service, 'verifySmsOtp').mockResolvedValue(result);

      expect(await controller.verifySmsOtp(dto)).toBe(result);
      expect(service.verifySmsOtp).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if RegisterService.verifySmsOtp fails', async () => {
      const dto: verifyOtpSmsDto = {
        countryCode: '66',
        phoneNumber: '886924075',
        otp: '123456',
        token: 'test-token',
      };
      jest
        .spyOn(service, 'verifySmsOtp')
        .mockRejectedValue(new Error('Service error'));

      await expect(controller.verifySmsOtp(dto)).rejects.toThrow(
        'Service error',
      );
      expect(service.verifySmsOtp).toHaveBeenCalledWith(dto);
    });

    it('should handle unexpected errors gracefully', async () => {
      const dto: verifyOtpSmsDto = {
        countryCode: '66',
        phoneNumber: '886924075',
        otp: '123456',
        token: 'test-token',
      };
      jest.spyOn(service, 'verifySmsOtp').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(controller.verifySmsOtp(dto)).rejects.toThrow(
        'Unexpected error',
      );
      expect(service.verifySmsOtp).toHaveBeenCalledWith(dto);
    });
  });

  describe('registerWithPhoneNumber', () => {
    it('should call RegisterService.registerWithPhoneNumber with correct parameters', async () => {
      const dto: RegisterPhoneNumberDto = {
        countryCode: '66',
        phoneNumber: '886924075',
        password: 'securePassword123',
        isSeller: true,
      };
      const result = { isSuccess: 'SUCCESS' } as any;
      jest.spyOn(service, 'registerWithPhoneNumber').mockResolvedValue(result);

      expect(await controller.registerWithPhoneNumber(dto)).toBe(result);
      expect(service.registerWithPhoneNumber).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if RegisterService.registerWithPhoneNumber fails', async () => {
      const dto: RegisterPhoneNumberDto = {
        countryCode: '66',
        phoneNumber: '886924075',
        password: 'securePassword123',
        isSeller: true,
      };
      jest
        .spyOn(service, 'registerWithPhoneNumber')
        .mockRejectedValue(new Error('Service error'));

      await expect(controller.registerWithPhoneNumber(dto)).rejects.toThrow(
        'Service error',
      );
      expect(service.registerWithPhoneNumber).toHaveBeenCalledWith(dto);
    });

    it('should handle unexpected errors gracefully', async () => {
      const dto: RegisterPhoneNumberDto = {
        countryCode: '66',
        phoneNumber: '886924075',
        password: 'securePassword123',
        isSeller: true,
      };
      jest.spyOn(service, 'registerWithPhoneNumber').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(controller.registerWithPhoneNumber(dto)).rejects.toThrow(
        'Unexpected error',
      );
      expect(service.registerWithPhoneNumber).toHaveBeenCalledWith(dto);
    });
  });

  describe('createMerchant', () => {
    it('should call service.createMerchant', async () => {
      const dto = {} as CreateShopDto;
      const expected = { success: true };
      (service.createMerchant as jest.Mock).mockResolvedValue(expected);
      expect(await controller.createMerchant(dto)).toBe(expected);
    });
  });

  describe('checkIdCard', () => {
    it('should check id card', async () => {
      (service['userService'] as any) = {
        findByIdCard: jest.fn().mockResolvedValue({ id: 1 }),
      };
      // Note: controller uses userService directly in constructor but in test we mocked providers.
      // Wait, in controller.spec.ts providers mock UserService as `useValue: {}`.
      // I need to update the mock for UserService in the test setup or cast it here.
      // Actually, the test setup:
      // { provide: UserService, useValue: {} }
      // So controller.userService is {}.
      // I need to mock findByIdCard on it.
      (controller['userService'] as any).findByIdCard = jest
        .fn()
        .mockResolvedValue({ id: 1 });
      expect(await controller.checkIdCard({ idCard: '1' })).toEqual({
        isExist: true,
      });
    });
  });

  describe('checkTaxId', () => {
    it('should check tax id', async () => {
      (controller['organizationService'] as any).findByTaxId = jest
        .fn()
        .mockResolvedValue({ id: 1 });
      expect(await controller.checkTaxId({ taxId: '1' })).toEqual({
        isExist: true,
      });
    });
  });

  describe('removeTel', () => {
    it('should remove user', async () => {
      (service.removeUserByTel as jest.Mock).mockResolvedValue({});
      expect(await controller.removeTel({ tel: '1' })).toEqual({});
    });
  });

  describe('clearRegistered', () => {
    it('should clear registered', async () => {
      (service.clearRegisteredUser as jest.Mock).mockResolvedValue({});
      expect(await controller.clearRegistered('1', true)).toEqual({});
    });
  });

  describe('createAccount', () => {
    it('should create account', async () => {
      (service.createAccount as jest.Mock).mockResolvedValue({});
      expect(await controller.createAccount({} as any)).toEqual({});
    });
  });

  describe('createUserProfile', () => {
    it('should create profile', async () => {
      const req = { authToken: 'token', isTokenExpired: false };
      (service.createUserProfile as jest.Mock).mockResolvedValue({});
      expect(await controller.createUserProfile(req, {} as any)).toEqual({});
    });
  });

  describe('getUserProfileByPhone', () => {
    it('should get profile', async () => {
      (service.getUserProfile as jest.Mock).mockResolvedValue({});
      expect(
        await controller.getUserProfileByPhone({
          countryCode: '66',
          phoneNumber: '1',
        }),
      ).toEqual({});
    });
  });

  describe('createOrganizationProfile', () => {
    it('should create org profile', async () => {
      (service.createOrganizationProfile as jest.Mock).mockResolvedValue({});
      const req = { platform: 'SELLER' };
      expect(await controller.createOrganizationProfile(req, {})).toEqual({});
    });
  });

  describe('updateUserRegistrationStatus', () => {
    it('should update status', async () => {
      (service.updateUserRegistrationStatus as jest.Mock).mockResolvedValue({});
      expect(await controller.updateUserRegistrationStatus({} as any)).toEqual(
        {},
      );
    });
  });
});
