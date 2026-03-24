import { Test, TestingModule } from '@nestjs/testing';
import { UserMerchantService } from './user-merchant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserMerchant } from '../../model/user-merchant.entity';
import { User } from '../../model/user.entity';
import { Merchant } from '../../model/merchant.entity';
import { UserOrganization } from '../../model/user-organization.entity';
import { RoleService } from '../role/role.service';
import { CisService } from '@/modules/cis/cis.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('UserMerchantService', () => {
  let service: UserMerchantService;
  let userMerchantRepo: any;
  let userRepo: any;
  let merchantRepo: any;
  let userOrganizationRepo: any;
  let roleService: any;
  let cisService: any;
  let cacheManager: any;

  beforeEach(async () => {
    userMerchantRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };
    userRepo = { find: jest.fn() };
    merchantRepo = { findOne: jest.fn() };
    userOrganizationRepo = { find: jest.fn() };
    roleService = { getRoleIdAndNameByIds: jest.fn() };
    cisService = { createRelationship: jest.fn() };
    cacheManager = {
      del: jest.fn(),
      store: { keys: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMerchantService,
        {
          provide: getRepositoryToken(UserMerchant),
          useValue: userMerchantRepo,
        },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Merchant), useValue: merchantRepo },
        {
          provide: getRepositoryToken(UserOrganization),
          useValue: userOrganizationRepo,
        },
        { provide: RoleService, useValue: roleService },
        { provide: CisService, useValue: cisService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<UserMerchantService>(UserMerchantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLastAccessedAt', () => {
    it('should update existing record', async () => {
      const userMerchant = { id: 1, userId: 1, merchantId: 1 };
      userMerchantRepo.findOne.mockResolvedValue(userMerchant);
      userMerchantRepo.save.mockResolvedValue({
        ...userMerchant,
        lastAccessedAt: new Date(),
      });

      await service.updateLastAccessedAt(1, 1);
      expect(userMerchantRepo.save).toHaveBeenCalled();
    });

    it('should create new record if not exists', async () => {
      userMerchantRepo.findOne.mockResolvedValue(null);
      userMerchantRepo.create.mockReturnValue({ userId: 1, merchantId: 1 });
      userMerchantRepo.save.mockResolvedValue({ id: 1 });

      await service.updateLastAccessedAt(1, 1);
      expect(userMerchantRepo.create).toHaveBeenCalled();
      expect(userMerchantRepo.save).toHaveBeenCalled();
    });
  });

  describe('getLastAccessedMerchant', () => {
    it('should return last accessed merchant', async () => {
      userMerchantRepo.findOne.mockResolvedValue({ id: 1 });
      expect(await service.getLastAccessedMerchant(1)).toEqual({ id: 1 });
    });
  });

  describe('getUserMerchantHistory', () => {
    it('should return history', async () => {
      userMerchantRepo.find.mockResolvedValue([]);
      expect(await service.getUserMerchantHistory(1)).toEqual([]);
    });
  });

  describe('findUserMerchantByUserId', () => {
    it('should return user merchants', async () => {
      userMerchantRepo.find.mockResolvedValue([]);
      expect(await service.findUserMerchantByUserId(1)).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete user merchant', async () => {
      await service.delete({ id: 1 } as any);
      expect(userMerchantRepo.delete).toHaveBeenCalled();
    });
  });

  describe('addUsersToMerchant', () => {
    it('should add users to merchant', async () => {
      const dto = { merchantId: 1, users: [{ userId: 1, roleId: 1 }] };
      const merchant = { id: 1, organizeId: 123, cisNumber: 'merchCis' };
      const users = [{ id: 1, cisNumber: 'userCis' }];
      const userOrgs = [{ userId: 1, organizeId: 123 }];
      const roles = [{ id: 1, name: 'ADMIN' }];

      merchantRepo.findOne.mockResolvedValue(merchant);
      userRepo.find.mockResolvedValue(users);
      userOrganizationRepo.find.mockResolvedValue(userOrgs);
      roleService.getRoleIdAndNameByIds.mockResolvedValue(roles);
      userMerchantRepo.find.mockResolvedValue([]); // No existing relations

      userMerchantRepo.create.mockReturnValue({});
      userMerchantRepo.save.mockResolvedValue({});

      const res = await service.addUsersToMerchant(dto);
      expect(res.addedCount).toBe(1);
      expect(res.details[0].status).toBe('added');
      expect(cisService.createRelationship).toHaveBeenCalledWith(
        'userCis',
        'merchCis',
        expect.any(String),
        'ADMIN',
        false,
      );
    });

    it('should throw if merchant not found', async () => {
      merchantRepo.findOne.mockResolvedValue(null);
      await expect(
        service.addUsersToMerchant({ merchantId: 1, users: [] }),
      ).rejects.toThrow('Merchant not found');
    });

    it('should throw if users not found', async () => {
      merchantRepo.findOne.mockResolvedValue({ id: 1 });
      userRepo.find.mockResolvedValue([]);
      await expect(
        service.addUsersToMerchant({
          merchantId: 1,
          users: [{ userId: 1, roleId: 1 }],
        }),
      ).rejects.toThrow('Users not found');
    });

    it('should handle existing user in merchant', async () => {
      const dto = { merchantId: 1, users: [{ userId: 1, roleId: 1 }] };
      const merchant = { id: 1, organizeId: 123 };
      const users = [{ id: 1 }];
      const userOrgs = [{ userId: 1, organizeId: 123 }];

      merchantRepo.findOne.mockResolvedValue(merchant);
      userRepo.find.mockResolvedValue(users);
      userOrganizationRepo.find.mockResolvedValue(userOrgs);
      roleService.getRoleIdAndNameByIds.mockResolvedValue([
        { id: 1, name: 'ADMIN' },
      ]);
      userMerchantRepo.find.mockResolvedValue([{ userId: 1, roleId: 1 }]);

      const res = await service.addUsersToMerchant(dto);
      expect(res.addedCount).toBe(0);
      expect(res.details[0].status).toBe('already_exists');
    });
  });

  describe('findMember', () => {
    it('should find member', async () => {
      userMerchantRepo.findOne.mockResolvedValue({});
      expect(await service.findMember(1, 1)).toEqual({});
    });
    it('should throw if member not found', async () => {
      userMerchantRepo.findOne.mockResolvedValue(null);
      await expect(service.findMember(1, 1)).rejects.toThrow(
        'Member not found',
      );
    });
  });

  describe('updateMerchantMember', () => {
    it('should update role', async () => {
      userMerchantRepo.save.mockResolvedValue({});
      expect(await service.updateMerchantMember({} as any, 1)).toBe(
        'Member role updated successfully',
      );
    });
  });

  describe('deleteMerchantMember', () => {
    it('should delete member', async () => {
      userMerchantRepo.delete.mockResolvedValue({});
      expect(await service.deleteMerchantMember(1, 1)).toBe(
        'Delete member successfully',
      );
    });
  });
});
