import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../model/roles.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { PermissionService } from '../permission/permission.service';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { HttpException, NotFoundException } from '@nestjs/common';

// Mock QB
const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
  getMany: jest.fn(),
  getManyAndCount: jest.fn(),
};

const createMockRepository = <T>() => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
  findAndCount: jest.fn(),
  count: jest.fn(),
});
type MockRepo<T> = ReturnType<typeof createMockRepository<T>>;

const mockPermissionService = {
  createPermissions: jest.fn(),
  updatePermission: jest.fn(),
  deletePermissions: jest.fn(),
  getAllPermissions: jest.fn(),
};

const mockUserOrganizationService = {
  findUserOrganizationByUserIdAndOrgId: jest.fn(),
  findUserUseRole: jest.fn(),
  requestCurrentUserOrganization: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('http://example.com'),
} as any;
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  store: { keys: jest.fn().mockResolvedValue([]) },
} as any;

describe('RoleService', () => {
  let service: RoleService;
  let roleRepo: MockRepo<Role>;
  let userOrgRepo: MockRepo<UserOrganization>;

  beforeEach(async () => {
    // Reset QB
    mockQueryBuilder.getOne.mockReset();
    mockQueryBuilder.getMany.mockReset();
    mockQueryBuilder.getManyAndCount.mockReset();
    mockQueryBuilder.where.mockReturnThis();

    roleRepo = createMockRepository<Role>();
    userOrgRepo = createMockRepository<UserOrganization>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: getRepositoryToken(Role), useValue: roleRepo },
        {
          provide: getRepositoryToken(UserOrganization),
          useValue: userOrgRepo,
        },
        { provide: PermissionService, useValue: mockPermissionService },
        {
          provide: UserOrganizationService,
          useValue: mockUserOrganizationService,
        },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return false if duplicate', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({});
      expect(await service.create('name', 1)).toBe(false);
    });

    it('should create new role', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      roleRepo.findOne.mockResolvedValue({ priority: 1 });
      roleRepo.save.mockResolvedValue({ id: 1 });

      expect(await service.create('name', 1)).toEqual({ id: 1 });
      expect(roleRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return roles', async () => {
      roleRepo.findAndCount.mockResolvedValue([[], 0]);
      await expect(service.findAll()).resolves.toBeDefined();
    });

    it('should return roles with filter', async () => {
      roleRepo.findAndCount.mockResolvedValue([[], 0]);
      await expect(service.findAll({ name: 'test' })).resolves.toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return role', async () => {
      roleRepo.findOne.mockResolvedValue({ id: 1 });
      expect(await service.findOne(1)).toEqual({ id: 1 });
    });

    it('should throw if not found', async () => {
      roleRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should return false if duplicate', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({});
      expect(await service.update('name', 1, 1)).toBe(false);
    });

    it('should update role', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      roleRepo.save.mockResolvedValue({});
      expect(await service.update('name', 1, 1)).toEqual({});
    });
  });

  describe('delete', () => {
    it('should delete role', async () => {
      roleRepo.delete.mockResolvedValue({});
      expect(await service.delete(1)).toEqual({});
    });
  });

  describe('getRolesByOrganization', () => {
    it('should return roles', async () => {
      roleRepo.find.mockResolvedValue([]);
      expect(await service.getRolesByOrganization(1)).toEqual([]);
    });
  });

  describe('getDefaultAndCloneRoles', () => {
    it('should return default roles', async () => {
      roleRepo.find.mockResolvedValue([]);
      expect(await service.getDefaultAndCloneRoles()).toEqual([]);
    });
  });

  describe('findRoleIdInOrganization', () => {
    it('should return role', async () => {
      roleRepo.findOne.mockResolvedValue({});
      expect(await service.findRoleIdInOrganization(1, 1)).toEqual({});
    });
    it('should throw if not found', async () => {
      roleRepo.findOne.mockResolvedValue(null);
      await expect(service.findRoleIdInOrganization(1, 1)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getListRole', () => {
    it('should return paginated list', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      mockQueryBuilder.where.mockReturnThis();
      const res = await service.getListRole(1, { page: 1, limit: 10 } as any);
      expect(res.roles).toEqual([]);
    });
  });

  describe('createRolePermission', () => {
    it('should create role and permissions', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      roleRepo.findOne.mockResolvedValue(null);
      roleRepo.save.mockResolvedValue({ id: 1 });
      mockPermissionService.createPermissions.mockResolvedValue(true);

      expect(
        await service.createRolePermission(1, {
          displayName: 'name',
          permissions: [],
        } as any),
      ).toBe(true);
    });

    it('should throw conflict if duplicate (create returns false)', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({});
      // If create returns false inside createRolePermission
      // But create() logic uses mockQB.getOne
      // We need to simulate create returning false, which happens if duplicate check found one.

      await expect(
        service.createRolePermission(1, { displayName: 'name' } as any),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateRolePermission', () => {
    it('should update and return true', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      roleRepo.save.mockResolvedValue({});
      mockPermissionService.updatePermission.mockResolvedValue(true);

      expect(
        await service.updateRolePermission(1, [
          { roleId: 1, displayName: 'name', permissions: [] },
        ] as any),
      ).toBe(true);
    });
  });

  describe('deleteRolePermission', () => {
    it('should delete if not used', async () => {
      mockUserOrganizationService.findUserUseRole.mockResolvedValue(false);
      roleRepo.findOne.mockResolvedValue({ organizeId: 1 });
      mockPermissionService.deletePermissions.mockResolvedValue(true);
      roleRepo.delete.mockResolvedValue({});

      expect(await service.deleteRolePermission(1)).toBe(true);
    });

    it('should throw if used', async () => {
      mockUserOrganizationService.findUserUseRole.mockResolvedValue(true);
      await expect(service.deleteRolePermission(1)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getRolePermissions', () => {
    it('should return role permissions', async () => {
      roleRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      // First getOne for role check
      mockQueryBuilder.getOne
        .mockResolvedValueOnce({ id: 1, isActive: true, rolePermissions: [] })
        // Second getOne for role with perms
        .mockResolvedValueOnce({ id: 1, rolePermissions: [] });

      mockPermissionService.getAllPermissions.mockResolvedValue([]);

      const res = await service.getRolePermissions(1, 1);
      expect(res.role).toBeDefined();
    });

    it('should throw if not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      await expect(service.getRolePermissions(1, 1)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateUserRoleInOrganization', () => {
    it('should throw if role not found', async () => {
      roleRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateUserRoleInOrganization(1, 1, {
          roleId: 1,
          organizationId: 1,
          isOwner: false,
        } as any),
      ).rejects.toThrow(HttpException);
    });

    it('should update user role', async () => {
      roleRepo.findOne
        .mockResolvedValueOnce({ id: 2, name: 'MEMBER' }) // Target Role
        .mockResolvedValueOnce({ id: 3, name: 'SUPER_ADMIN' }) // System role
        .mockResolvedValueOnce({ id: 4, name: 'OWNER' }); // System role

      mockUserOrganizationService.findUserOrganizationByUserIdAndOrgId.mockResolvedValue(
        { id: 1 },
      );
      userOrgRepo.count.mockResolvedValue(2);
      userOrgRepo.update.mockResolvedValue({});

      await service.updateUserRoleInOrganization(1, 1, {
        roleId: 2,
        organizationId: 1,
        isOwner: false,
      } as any);
      expect(userOrgRepo.update).toHaveBeenCalled();
    });

    it('should promote to owner', async () => {
      // Let's refine the mocks for findRoleByName calls
      const ownerRole = { id: 4, name: 'OWNER' };
      const superAdminRole = { id: 3, name: 'SUPER_ADMIN' };

      // Mock findOne implementation to return based on criteria or sequence
      roleRepo.findOne.mockImplementation((criteria: any) => {
        if (criteria.where && criteria.where.id === 4)
          return Promise.resolve(ownerRole); // target role
        if (criteria.where && criteria.where.name === 'SUPER_ADMIN')
          return Promise.resolve(superAdminRole);
        if (criteria.where && criteria.where.name === 'OWNER')
          return Promise.resolve(ownerRole);
        return Promise.resolve(null);
      });

      mockUserOrganizationService.findUserOrganizationByUserIdAndOrgId.mockResolvedValue(
        { id: 1, userId: 1 },
      );
      userOrgRepo.findOne.mockResolvedValue({
        userId: 99,
        organizeId: 1,
        isOwner: true,
      }); // Current owner

      await service.updateUserRoleInOrganization(1, 1, {
        roleId: 4,
        organizationId: 1,
        isOwner: true,
      } as any);

      // Should demote old owner
      expect(userOrgRepo.update).toHaveBeenCalledWith(
        { userId: 99, organizeId: 1 },
        expect.objectContaining({ isOwner: false }),
      );
      // Should promote new owner
      expect(userOrgRepo.update).toHaveBeenCalledWith(
        { userId: 1, organizeId: 1 },
        expect.objectContaining({ isOwner: true }),
      );
    });
  });
});
