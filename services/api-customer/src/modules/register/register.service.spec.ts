import { Test, TestingModule } from '@nestjs/testing';
import { RegisterService } from './register.service';
import { HttpException, CACHE_MANAGER } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { CisService } from '../cis/cis.service';
import { AuthCenterService } from '../auth-center/auth-center.service';
import { MerchantService } from '../merchant/merchant.service';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { UserConsentService } from '../user-consent/user-consent.service';
import { OrganizationContactService } from '../organization-contact/organization-contact.service';
import { UserMerchantService } from '../user-merchant/user-merchant.service';
import { UserAddressService } from '../user-address/user-address.service';
import { RoleService } from '../role/role.service';
import {
  CreateUserProfileDto,
  phoneNumberDto,
  verifyOtpSmsDto,
  RegisterPhoneNumberDto,
} from './dto/create-register.dto';
import { User } from '../../model/user.entity';
import { Platform } from '@/model/organization-contact.entity';
import { getConnection } from 'typeorm';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    getConnection: jest.fn(),
  };
});

describe('RegisterService', () => {
  let service: RegisterService;
  let mockCisService: any;
  let mockAuthCenterService: any;
  let mockMerchantService: any;
  let mockUserService: any;
  let mockOrganizationService: any;
  let mockUserOrganizationService: any;
  let mockUserConsentService: any;
  let mockOrganizationContactService: any;
  let mockUserMerchantService: any;
  let mockUserAddressService: any;
  let mockRoleService: any;
  let mockConfigService: any;
  let mockCacheManager: any;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockCisService = { updatePersonalProfile: jest.fn() };
    mockAuthCenterService = {
      checkExistValue: jest.fn(),
      sendSmsOtp: jest.fn(),
      verifySmsOtp: jest.fn(),
      registerWithPhoneNumber: jest.fn(),
      getCisNumber: jest.fn(),
      generateNewAccessToken: jest.fn(),
    };
    mockMerchantService = { createMerchant: jest.fn() };
    mockUserService = {
      findByPhoneNumber: jest.fn(),
      createUserWithPhone: jest.fn(),
      delete: jest.fn(),
      findByPhoneAndCountryCode: jest.fn(),
      findUserOrgByCountryAndPhoneNumber: jest.fn(),
      createUserToThirdParty: jest.fn(),
      updateUserToAuthCenter: jest.fn(),
      updateUserById: jest.fn(),
      findDraftUserByUserId: jest.fn(),
      deleteDraftUserAddressByDraftUserId: jest.fn(),
      deleteDraftUserById: jest.fn(),
      findByIdCard: jest.fn(),
    };
    mockOrganizationService = {
      removeOrganization: jest.fn(),
      checkIdCardNumberExists: jest.fn(),
      createPersonalOrganizationProfile: jest.fn(),
      checkTaxIdExists: jest.fn(),
      createJuristicOrganizationProfile: jest.fn(),
      checkRegistrationNumberExists: jest.fn(),
      createRegisterIndividualProfile: jest.fn(),
      deleteOrganizationLeaveLogsByUserId: jest.fn(),
      findByTaxId: jest.fn(),
    };
    mockUserOrganizationService = {
      findUserOrganizationByUserId: jest.fn(),
      removeUserOrganizationById: jest.fn(),
      findOrganizationByUserId: jest.fn(),
      findAllRelatedByUserId: jest.fn(),
      deleteUserOrganizationByIds: jest.fn(),
    };
    mockUserConsentService = {
      findUserConsentByUserId: jest.fn(),
      deleteUserConsentByIds: jest.fn(),
    };
    mockOrganizationContactService = {
      findOrganizationContactByUserId: jest.fn(),
      deleteOrganizationContactByIds: jest.fn(),
    };
    mockUserMerchantService = {
      findUserMerchantByUserId: jest.fn(),
      delete: jest.fn(),
    };
    mockUserAddressService = {
      findByUserId: jest.fn(),
      deleteUserAddressByIds: jest.fn(),
    };
    mockRoleService = {
      createRolePermissionDefault: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn(),
    };
    mockCacheManager = {
      store: {
        keys: jest.fn().mockResolvedValue([]),
      },
      del: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
      },
    };
    (getConnection as jest.Mock).mockReturnValue({
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterService,
        { provide: CisService, useValue: mockCisService },
        { provide: AuthCenterService, useValue: mockAuthCenterService },
        { provide: MerchantService, useValue: mockMerchantService },
        { provide: UserService, useValue: mockUserService },
        { provide: OrganizationService, useValue: mockOrganizationService },
        {
          provide: UserOrganizationService,
          useValue: mockUserOrganizationService,
        },
        { provide: UserConsentService, useValue: mockUserConsentService },
        {
          provide: OrganizationContactService,
          useValue: mockOrganizationContactService,
        },
        { provide: UserMerchantService, useValue: mockUserMerchantService },
        { provide: UserAddressService, useValue: mockUserAddressService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<RegisterService>(RegisterService);
  });

  // ... existing tests ...

  describe('createOrganizationProfile branches', () => {
    const baseDto = {
      countryCode: '66',
      phoneNumber: '0812345678',
      orgType: 'PERSONAL',
      orgPersonalInfo: { idCard: '1', businessType: [] },
      orgJuristicInfo: {
        taxId: '1',
        branchType: 'HEAD_OFFICE',
        branchNumber: '00000',
      },
      orgIndividualInfo: { registrationNumber: '1' },
    };

    const mockUser = { id: 1, cisNumber: 'C1', name: 'N', email: 'E' };

    it('should throw if user not found', async () => {
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue(null);
      await expect(
        service.createOrganizationProfile(baseDto as any, Platform.SELLER),
      ).rejects.toThrow();
    });

    const fullOrgMock = [
      {
        user: { id: 1, tel: '1', email: 'e', countryCode: '66' },
        organization: { id: 1, organizeType: 'JURISTIC' },
      },
    ];

    it('should create juristic profile', async () => {
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue(mockUser);
      mockOrganizationService.checkTaxIdExists.mockResolvedValue({
        exists: false,
      });
      mockUserOrganizationService.findOrganizationByUserId.mockResolvedValue(
        fullOrgMock,
      );
      mockOrganizationService.createJuristicOrganizationProfile.mockResolvedValue(
        {},
      );

      const dto = { ...baseDto, orgType: 'JURISTIC' };
      await service.createOrganizationProfile(dto as any, Platform.SELLER);
      expect(
        mockOrganizationService.createJuristicOrganizationProfile,
      ).toHaveBeenCalled();
    });

    it('should create registered individual profile', async () => {
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue(mockUser);
      mockOrganizationService.checkRegistrationNumberExists.mockResolvedValue({
        exists: false,
      });
      mockUserOrganizationService.findOrganizationByUserId.mockResolvedValue(
        fullOrgMock,
      );
      mockOrganizationService.createRegisterIndividualProfile.mockResolvedValue(
        {},
      );

      const dto = { ...baseDto, orgType: 'REGISTERED_INDIVIDUAL' };
      await service.createOrganizationProfile(dto as any, Platform.SELLER);
      expect(
        mockOrganizationService.createRegisterIndividualProfile,
      ).toHaveBeenCalled();
    });
  });

  describe('createAccount', () => {
    it('should create account', async () => {
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue(null);
      mockAuthCenterService.registerWithPhoneNumber.mockResolvedValue({
        refreshToken: 'RT',
      });

      await service.createAccount({
        phoneNumber: '1',
        countryCode: '66',
        password: 'p',
      } as any);

      expect(mockUserService.createUserWithPhone).toHaveBeenCalled();
    });

    it('should throw if exists', async () => {
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue({});
      await expect(
        service.createAccount({ phoneNumber: '1', countryCode: '66' } as any),
      ).rejects.toThrow();
    });
  });

  describe('getUserProfile', () => {
    it('should return profile', async () => {
      mockUserService.findUserOrgByCountryAndPhoneNumber.mockResolvedValue({
        id: 1,
        countryCode: '66',
        tel: '123456789',
        userOrganizations: [],
      });
      const res = await service.getUserProfile('66', '1');
      expect(res).toBeDefined();
    });

    it('should throw if not found', async () => {
      mockUserService.findUserOrgByCountryAndPhoneNumber.mockResolvedValue(
        null,
      );
      await expect(service.getUserProfile('66', '1')).rejects.toThrow();
    });
  });

  describe('updateUserRegistrationStatus', () => {
    it('should update status', async () => {
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue({ id: 1 });
      const res = await service.updateUserRegistrationStatus({
        phoneNumber: '1',
        countryCode: '66',
        registerStep: 'ORG_INFO',
        registerStatus: 'COMPLETED',
      } as any);
      expect(res.success).toBe(true);
      expect(mockUserService.updateUserById).toHaveBeenCalled();
    });
  });

  describe('clearRegisteredUser', () => {
    it('should clear user data', async () => {
      mockUserService.findByPhoneNumber.mockResolvedValue({ id: 1 });
      mockUserMerchantService.findUserMerchantByUserId.mockResolvedValue([
        { id: 1 },
      ]);
      mockUserAddressService.findByUserId.mockResolvedValue([{ id: 1 }]);
      mockOrganizationContactService.findOrganizationContactByUserId.mockResolvedValue(
        [{ id: 1 }],
      );
      mockUserConsentService.findUserConsentByUserId.mockResolvedValue([
        { id: 1 },
      ]);
      mockUserOrganizationService.findAllRelatedByUserId.mockResolvedValue([
        { id: 1 },
      ]);

      const res = await service.clearRegisteredUser('1');
      expect(res.statusCode).toBe(200);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('checkPhoneNumber', () => {
    const mockPhoneNumberDto: phoneNumberDto = {
      countryCode: '66',
      phoneNumber: '0812345678',
    };

    it('should return isExist true if auth center returns true', async () => {
      mockAuthCenterService.checkExistValue.mockResolvedValue({
        isExist: true,
      });
      mockUserService.findByPhoneNumber.mockResolvedValue(null);

      const result = await service.checkPhoneNumber(mockPhoneNumberDto);
      expect(result).toEqual({ isExist: true, isExistInSystem: false });
    });

    it('should return isExistInSystem true if user exists', async () => {
      mockAuthCenterService.checkExistValue.mockResolvedValue({
        isExist: false,
      });
      mockUserService.findByPhoneNumber.mockResolvedValue({});

      const result = await service.checkPhoneNumber(mockPhoneNumberDto);
      expect(result).toEqual({ isExist: false, isExistInSystem: true });
    });
  });

  describe('sendSmsOtp', () => {
    it('should call authCenterService.sendSmsOtp', async () => {
      const dto: phoneNumberDto = {
        countryCode: '66',
        phoneNumber: '0812345678',
      };
      const expectedResult = { success: true };
      mockAuthCenterService.sendSmsOtp.mockResolvedValue(expectedResult);

      const result = await service.sendSmsOtp(dto);
      expect(result).toEqual(expectedResult);
      expect(mockAuthCenterService.sendSmsOtp).toHaveBeenCalledWith(dto);
    });
  });

  describe('verifySmsOtp', () => {
    it('should call authCenterService.verifySmsOtp', async () => {
      const dto: verifyOtpSmsDto = {
        countryCode: '66',
        phoneNumber: '0812345678',
        otp: '123456',
        token: 'token',
      };
      const expectedResult = { verified: true };
      mockAuthCenterService.verifySmsOtp.mockResolvedValue(expectedResult);

      const result = await service.verifySmsOtp(dto);
      expect(result).toEqual(expectedResult);
      expect(mockAuthCenterService.verifySmsOtp).toHaveBeenCalledWith({
        pin: dto.otp,
        token: dto.token,
        phoneNumber: dto.phoneNumber,
        countryCode: dto.countryCode,
      });
    });
  });

  describe('registerWithPhoneNumber', () => {
    const dto: RegisterPhoneNumberDto = {
      countryCode: '66',
      phoneNumber: '0812345678',
      password: 'password',
      isSeller: true,
    };

    it('should throw error if user already exists', async () => {
      mockUserService.findByPhoneNumber.mockResolvedValue({});

      await expect(service.registerWithPhoneNumber(dto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should register successfully', async () => {
      mockUserService.findByPhoneNumber.mockResolvedValue(null);
      mockAuthCenterService.registerWithPhoneNumber.mockResolvedValue({
        success: true,
      });
      mockUserService.createUserWithPhone.mockResolvedValue({});

      const result = await service.registerWithPhoneNumber(dto);

      expect(result).toEqual({ success: true });
      expect(mockUserService.createUserWithPhone).toHaveBeenCalledWith(
        '0812345678',
        '66',
        'password',
        true,
      );
    });
  });

  describe('createUserProfile', () => {
    const dto: CreateUserProfileDto = {
      countryCode: '66',
      phoneNumber: '0812345678',
      userInfo: {
        firstName: 'First',
        lastName: 'Last',
      },
      platform: Platform.SELLER,
    };
    const authToken = 'token';
    const mockUser = {
      id: 1,
      authRefreshToken: 'refresh-token',
      cisNumber: null,
      tel: '0812345678',
    } as User;

    it('should create user profile successfully', async () => {
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue(mockUser);
      mockAuthCenterService.getCisNumber.mockResolvedValue({ cisNumber: null });
      mockUserService.createUserToThirdParty.mockResolvedValue('CIS123');
      mockUserService.updateUserToAuthCenter.mockResolvedValue({});
      mockUserService.updateUserById.mockResolvedValue({
        ...mockUser,
        cisNumber: 'CIS123',
        name: 'First Last',
        firstNameTh: 'First',
        lastNameTh: 'Last',
      });

      const result = await service.createUserProfile(dto, authToken);

      expect(result.cisNumber).toEqual('CIS123');
      expect(mockUserService.createUserToThirdParty).toHaveBeenCalled();
      expect(mockUserService.updateUserById).toHaveBeenCalled();
    });

    it('should use existing cisNumber if available from AuthCenter', async () => {
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue(mockUser);
      mockAuthCenterService.getCisNumber.mockResolvedValue({
        cisNumber: 'CIS_FROM_AUTH',
      });
      mockUserService.updateUserToAuthCenter.mockResolvedValue({});
      mockUserService.updateUserById.mockResolvedValue({
        ...mockUser,
        cisNumber: 'CIS_FROM_AUTH',
      });

      const result = await service.createUserProfile(dto, authToken);

      expect(mockUserService.createUserToThirdParty).not.toHaveBeenCalled();
      expect(mockCisService.updatePersonalProfile).toHaveBeenCalled();
    });

    it('should throw UserNotFoundByPhoneException if user not found', async () => {
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue(null);

      await expect(service.createUserProfile(dto, authToken)).rejects.toThrow();
    });
  });

  describe('createOrganizationProfile', () => {
    const dto: any = {
      countryCode: '66',
      phoneNumber: '0812345678',
      orgType: 'PERSONAL',
      orgPersonalInfo: {
        idCard: '1234567890123',
        businessType: ['AGENT'],
      },
    };

    it('should create personal organization profile successfully', async () => {
      const mockUser = {
        id: 1,
        cisNumber: 'CIS123',
        name: 'Name',
        email: 'email@test.com',
      };
      mockUserService.findByPhoneAndCountryCode.mockResolvedValue(mockUser);
      mockOrganizationService.checkIdCardNumberExists.mockResolvedValue({
        exists: false,
      });
      mockOrganizationService.createPersonalOrganizationProfile.mockResolvedValue(
        {},
      );
      mockUserService.updateUserById.mockResolvedValue({});
      mockUserOrganizationService.findOrganizationByUserId.mockResolvedValue([
        {
          user: {
            id: mockUser.id,
            countryCode: '66',
            tel: mockUser.email,
            email: mockUser.email,
          },
          organization: {
            id: 1,
            taxId: '1234567890123',
            organizeType: 'PERSONAL',
            organizeName: 'Test Org',
          },
        },
      ]);
      mockRoleService.createRolePermissionDefault.mockResolvedValue({});

      const result = await service.createOrganizationProfile(
        dto,
        Platform.SELLER,
      );

      expect(result).toBeDefined();
      expect(
        mockOrganizationService.createPersonalOrganizationProfile,
      ).toHaveBeenCalled();
    });
  });
});
