import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException } from '@nestjs/common';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    create: jest.fn(),
    update: jest.fn(),
    updateLastAccessed: jest.fn(),
    checkIdCardRegistration: jest.fn(),
    checkRegisNumberExists: jest.fn(),
    showById: jest.fn(),
    getUserProfile: jest.fn(),
    sendAdminChangeEmail: jest.fn(),
    changeUserPassword: jest.fn(),
    changeUserEmail: jest.fn(),
    changeCustomerPassword: jest.fn(),
    setCustomerPassword: jest.fn(),
    setAdminPassword: jest.fn(),
    verifyAdminEmail: jest.fn(),
    setOnboardingStep: jest.fn(),
    upateUserProfile: jest.fn(),
    updateIdentityVerification: jest.fn(),
    getIdentityVerification: jest.fn(),
    uploadIdentityFile: jest.fn(),
    getIdentityVerifyDocuments: jest.fn(),
    getFileDocument: jest.fn(),
    deleteIdentityDocument: jest.fn(),
    createOrganization: jest.fn(),
    checkPlatform: jest.fn(),
    checkPlatformWithPhoneNumber: jest.fn(),
    verifyEmailOtp: jest.fn(),
    sendEmailOtp: jest.fn(),
    verifyEmailOtpAuthCenter: jest.fn(),
    checkEmailExists: jest.fn(),
    delete: jest.fn(),
    getDraftUser: jest.fn(),
    updateDraftUser: jest.fn(),
    approveKyc: jest.fn(),
    uploadDocumentToCis: jest.fn(),
    deleteDocumentCis: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return result', async () => {
      mockUserService.create.mockResolvedValue({});
      expect(await controller.create({} as any)).toEqual({});
    });
  });

  describe('updateLastAccessed', () => {
    it('should return result', async () => {
      mockUserService.updateLastAccessed.mockResolvedValue({
        success: true,
        message: 'Updated',
      });
      expect(await controller.updateLastAccessed({} as any)).toEqual({
        success: true,
        message: 'Updated',
      });
    });
  });

  describe('checkIdCard', () => {
    it('should return exists', async () => {
      mockUserService.checkIdCardRegistration.mockResolvedValue({
        exists: true,
      });
      expect(await controller.checkIdCard({ idCard: '123' } as any)).toEqual({
        exists: true,
      });
    });
  });

  describe('show', () => {
    it('should return user', async () => {
      mockUserService.showById.mockResolvedValue({});
      expect(await controller.show('1')).toEqual({});
    });
    it('should throw http exception', async () => {
      mockUserService.showById.mockRejectedValue(new Error('fail'));
      await expect(controller.show('1')).rejects.toThrow(HttpException);
    });
  });

  describe('getUserProfile', () => {
    it('should return profile', async () => {
      mockUserService.getUserProfile.mockResolvedValue({});
      expect(await controller.getUserProfile('1')).toEqual({});
    });
    it('should throw http exception', async () => {
      mockUserService.getUserProfile.mockRejectedValue(new Error('fail'));
      await expect(controller.getUserProfile('1')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('sendChangeEmail', () => {
    it('should call service', async () => {
      mockUserService.sendAdminChangeEmail.mockResolvedValue({});
      const req = { user: {}, headers: { authorization: 'Bearer token' } };
      expect(
        await controller.sendChangeEmail(req, {} as any, {} as any),
      ).toEqual({});
      expect(mockUserService.sendAdminChangeEmail).toHaveBeenCalled();
    });
    it('should throw http exception', async () => {
      mockUserService.sendAdminChangeEmail.mockRejectedValue(new Error('fail'));
      const req = { user: {}, headers: { authorization: 'Bearer token' } };
      await expect(
        controller.sendChangeEmail(req, {} as any, {} as any),
      ).rejects.toThrow(HttpException);
    });
  });

  // Adding more critical endpoint tests

  describe('update', () => {
    it('should update user', async () => {
      mockUserService.update.mockResolvedValue({});
      expect(await controller.update('1', {} as any, null, {} as any)).toEqual(
        {},
      );
    });
    it('should throw http exception', async () => {
      mockUserService.update.mockRejectedValue(new Error('fail'));
      await expect(
        controller.update('1', {} as any, null, {} as any),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      mockUserService.upateUserProfile.mockResolvedValue({});
      expect(await controller.updateUserProfile('1', {} as any, null)).toEqual(
        {},
      );
    });
  });
});
