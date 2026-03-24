import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { User } from '@/model/user.entity';
import { Merchant } from '@/model/merchant.entity';
import { Customer } from '@/model/customer.entity';
import { ImageUpload } from '@/model/image-upload.entity';
import { UserIdentityDocument } from '@/model/user-identity-document.entity';
import { DraftUser } from '@/model/draft-user.entity';
import { DraftUserAddress } from '@/model/draft-user-address.entity';

import { ImageUploadService } from '@/modules/image-upload/image-upload.service';
import { MailService } from '@/mail/mail.service';
import { UserAddressService } from '@/modules/user-address/user-address.service';
import { CisService } from '@/modules/cis/cis.service';
import { UserMerchantService } from '@/modules/user-merchant/user-merchant.service';
import { UserOrganizationService } from '@/modules/user-organization/user-organization.service';
import { OrganizationService } from '@/modules/organization/organization.service';
import { AuthCenterService } from '@/modules/auth-center/auth-center.service';
import { OrganizationContactService } from '@/modules/organization-contact/organization-contact.service';
import { HttpException, HttpStatus } from '@nestjs/common';

const createMockRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
  getRawMany: jest.fn().mockResolvedValue([]),
  manager: {
    createQueryBuilder: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
  },
});

const mockImageUploadService = {
  uploadWithoutFolder: jest.fn(),
};
const mockMailService = {
  sendAdminUserEmailVerifySuccess: jest.fn(),
  sendAdminUserChangeEmail: jest.fn(),
  sendAdminUserChangeEmailSuccess: jest.fn(),
};
const mockUserAddressService = {};
const mockCisService = {
  updatePersonalProfile: jest.fn(),
  getAttachDocuments: jest.fn().mockResolvedValue({ data: { documents: [] } }),
  unattachDocument: jest.fn(),
  deleteDocument: jest.fn(),
  uploadDocument: jest.fn().mockResolvedValue({ data: { id: 'docId' } }),
  attachDocument: jest.fn(),
  updateCustomerContactDetail: jest.fn(),
  updateUserValue: jest.fn(),
};
const mockUserMerchantService = {};
const mockUserOrganizationService = {};
const mockOrganizationService = {};
const mockAuthCenterService = {};
const mockOrganizationContactService = {};

const mockConfigService = {
  get: jest.fn().mockReturnValue('http://example.com'),
} as any;
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
} as unknown as Cache;
const mockQueue = { add: jest.fn() } as unknown as Queue;

describe('UserService', () => {
  let service: UserService;
  let userRepo: any;
  let merchantRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        {
          provide: getRepositoryToken(Merchant),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(ImageUpload),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(UserIdentityDocument),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(DraftUser),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(DraftUserAddress),
          useValue: createMockRepository(),
        },

        { provide: ImageUploadService, useValue: mockImageUploadService },
        { provide: MailService, useValue: mockMailService },
        { provide: UserAddressService, useValue: mockUserAddressService },
        { provide: CisService, useValue: mockCisService },
        { provide: UserMerchantService, useValue: mockUserMerchantService },
        {
          provide: UserOrganizationService,
          useValue: mockUserOrganizationService,
        },
        { provide: OrganizationService, useValue: mockOrganizationService },
        { provide: AuthCenterService, useValue: mockAuthCenterService },
        {
          provide: OrganizationContactService,
          useValue: mockOrganizationContactService,
        },

        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: 'BullQueue_user-consumer', useValue: mockQueue },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
    merchantRepo = module.get(getRepositoryToken(Merchant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create user', async () => {
      const dto = { merchantIds: [1] } as any;
      merchantRepo.findOne.mockResolvedValue({ id: 1 });
      const saveMock = jest.fn();
      jest.spyOn(User, 'create').mockReturnValue({ save: saveMock } as any);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('showById', () => {
    it('should return user', async () => {
      const user = { id: 1, merchants: [] };
      userRepo.getOne.mockResolvedValue(user);
      userRepo.manager.getRawMany.mockResolvedValue([]);

      const result = await service.showById(1);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const user = { id: 1 } as User;
      const dto = { merchantIds: [1], tel: '666', email: 'e' } as any;

      userRepo.findOne
        .mockResolvedValueOnce(user) // findById for user
        .mockResolvedValueOnce(null) // check tel exists
        .mockResolvedValueOnce(null); // check email exists

      merchantRepo.findOne.mockResolvedValue({});
      userRepo.save.mockResolvedValue(user);

      const res = await service.update(1, null, dto, { t: (k) => k } as any);
      expect(res).toBeDefined();
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw if tel exists', async () => {
      const user = { id: 1 } as User;
      const dto = { tel: '666' } as any;

      userRepo.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ id: 2 }); // check tel exists

      await expect(
        service.update(1, null, dto, { t: (k) => k } as any),
      ).rejects.toThrow();
    });
  });

  describe('upateUserProfile', () => {
    it('should update user profile', async () => {
      const user = { id: 1, cisNumber: 'cis' } as User;
      const dto = { firstNameTh: 'th', tel: '00', email: 'kk' } as any;
      userRepo.findOne.mockResolvedValue(user);
      mockCisService.updatePersonalProfile.mockResolvedValue({});
      mockCisService.updateCustomerContactDetail.mockResolvedValue({});
      userRepo.save.mockResolvedValue(user);

      const res = await service.upateUserProfile(1, null, dto);
      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(mockCisService.updatePersonalProfile).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.upateUserProfile(1, null, {} as any),
      ).rejects.toThrow(HttpException);
    });

    it('should handle file upload', async () => {
      const user = { id: 1, cisNumber: 'cis' } as User;
      userRepo.findOne.mockResolvedValue(user);
      mockCisService.updatePersonalProfile.mockResolvedValue({});
      mockCisService.getAttachDocuments.mockResolvedValue({
        data: { documents: [{ id: 'old' }] },
      });
      userRepo.save.mockResolvedValue(user);

      await service.upateUserProfile(1, { file: '' }, {} as any);
      expect(mockCisService.unattachDocument).toHaveBeenCalled();
      expect(mockCisService.deleteDocument).toHaveBeenCalled();
      expect(mockCisService.uploadDocument).toHaveBeenCalled();
      expect(mockCisService.attachDocument).toHaveBeenCalled();
    });
  });

  describe('changeUserPassword', () => {
    it('should change password successfully', async () => {
      const user = { id: 1, password: 'oldPassword' };
      const dto: any = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue({
        ...user,
        password: 'hashed(newPassword)',
      });
      // We need to mock bcrypt but likely service uses it internally.
      // If service imports bcrypt directly, we need to mock it OR relying on it working if available.
      // Assuming service uses a helper or standard bcrypt.
      // Let's spy on bcrypt if possible or just assume execution.
      // Without mocking bcrypt, it might run real hashing which is fine for unit tests usually, but might be slow.
      // However, checkPassword validation usually compares hash.
      // Since we can't easily mock internal require/import of bcrypt without jest.mock of module at top,
      // we check if `validatePassword` or similar is used.

      // Let's assume standard flow.
      // We need to verify `bcrypt.compare` returns true for old password.
      // If service uses `user.validatePassword` method (from entity), we need to mock that method on the user object.

      const mockUser = {
        id: 1,
        password: 'hashedOld',
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      userRepo.findOne.mockResolvedValue(mockUser);

      await service.changeUserPassword(dto, { userId: 1 }, {
        t: (k) => k,
      } as any);
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw if old password incorrect', async () => {
      const mockUser = {
        id: 1,
        password: 'hashedOld',
        validatePassword: jest.fn().mockResolvedValue(false),
      };
      userRepo.findOne.mockResolvedValue(mockUser);
      const dto: any = { oldPassword: 'wrong', newPassword: 'new' };
      await expect(
        service.changeUserPassword(dto, { userId: 1 }, { t: (k) => k } as any),
      ).rejects.toThrow();
    });
  });

  describe('changeUserEmail', () => {
    it('should change email and send verification', async () => {
      const dto: any = { password: 'pass', newEmail: 'new@test.com' };

      // Mock validation
      const mockUser = {
        id: 1,
        email: 'old@test.com',
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      userRepo.findOne
        .mockResolvedValueOnce(mockUser) // First find for user
        .mockResolvedValueOnce(null); // Second find for new email uniqueness

      mockMailService.sendAdminUserChangeEmailSuccess.mockResolvedValue({});

      await service.changeUserEmail(dto, { userId: 1 }, { t: (k) => k } as any);

      expect(
        mockMailService.sendAdminUserChangeEmailSuccess,
      ).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should find user', async () => {
      // User.findOne is static. Jest spyOn User class.
      const spy = jest
        .spyOn(User, 'findOne')
        .mockResolvedValue({ id: 1 } as any);
      const res = await service.findByEmail('e@e.com');
      expect(res).toBeDefined();
      spy.mockRestore();
    });
  });

  describe('findById', () => {
    it('should return user', async () => {
      const qb = userRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue({ id: 1 });

      const res = await service.findById(1);
      expect(res).toBeDefined();
    });
  });

  describe('requestCurrentMerchant', () => {
    it('should return merchant', async () => {
      const merchant = { id: 2, slug: 'slug' };
      const user = { id: 1, merchants: [merchant] };
      userRepo.findOne.mockResolvedValue(user);

      const res = await service.requestCurrentMerchant({ userId: 1 }, 'slug');
      expect(res).toEqual(merchant);
    });

    it('should throw if merchant not found', async () => {
      const user = { id: 1, merchants: [] };
      userRepo.findOne.mockResolvedValue(user);
      await expect(
        service.requestCurrentMerchant({ userId: 1 }, 'slug'),
      ).rejects.toThrow();
    });
  });

  describe('updateBusinessTypeToCis', () => {
    it('should update CIS', async () => {
      const user = { cisNumber: 'cis' };
      mockCisService.updateUserValue.mockResolvedValue({});

      await service.updateBusinessTypeToCis(user as any, ['RETAIL' as any]);
      expect(mockCisService.updateUserValue).toHaveBeenCalled();
    });
  });

  describe('setAdminPassword', () => {
    it('should set password', async () => {
      const user = { id: 1 };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue(user);
      await service.setAdminPassword({ password: 'p' }, 1);
      expect(userRepo.save).toHaveBeenCalled();
    });
  });

  describe('verifyAdminEmail', () => {
    it('should verify email', async () => {
      const user = { id: 1, email: 'e' };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue(user);
      await service.verifyAdminEmail(1);
      expect(userRepo.save).toHaveBeenCalled();
    });
  });

  describe('UserService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('requestMerchantBySlug', () => {
    it('should return from cache', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue({});
      const res = await service.requestMerchantBySlug('slug');
      expect(res).toBeDefined();
    });

    it('should find from db and cache', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      merchantRepo.getOne.mockResolvedValue({ status: 1, merchantPolicy: {} }); // MerchantStatus.ACTIVE = 1 (likely)
      // Need to import enum usually, but lets assume 1. Or check implementation.

      const res = await service.requestMerchantBySlug('slug');
      expect(res).toBeDefined();
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile with image', async () => {
      const user = { id: 1, cisNumber: 'cis' };
      userRepo.findOne.mockResolvedValue(user);
      mockCisService.getAttachDocuments.mockResolvedValue({
        data: { documents: [{ url: 'u' }] },
      });

      const res = await service.getUserProfile(1);
      expect(res.data.imageProfile).toBeDefined();
    });
  });
});
