import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from '@/model/permissions.entity';
import { RolePermissions } from '@/model/role_permissions.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import {
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionRepo: any;
  let rolePermissionsRepo: any;
  let userOrganizationRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findByIds: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RolePermissions),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserOrganization),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    permissionRepo = module.get(getRepositoryToken(Permission));
    rolePermissionsRepo = module.get(getRepositoryToken(RolePermissions));
    userOrganizationRepo = module.get(getRepositoryToken(UserOrganization));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated permissions', async () => {
      const mockData = [{ id: 1, code: 'TEST' }];
      permissionRepo.findAndCount.mockResolvedValue([mockData, 1]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
    });

    it('should handle errors', async () => {
      permissionRepo.findAndCount.mockRejectedValue(new Error('DB Error'));
      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return permission if found', async () => {
      const mockPermission = { id: 1 };
      permissionRepo.findOne.mockResolvedValue(mockPermission);
      const result = await service.findOne(1);
      expect(result).toEqual(mockPermission);
    });

    it('should throw NotFoundException if not found', async () => {
      permissionRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return permission if found', async () => {
      const mockPermission = { id: 1, code: 'TEST' };
      permissionRepo.findOne.mockResolvedValue(mockPermission);
      const result = await service.findByCode('TEST');
      expect(result).toEqual(mockPermission);
    });

    it('should throw NotFoundException if not found', async () => {
      permissionRepo.findOne.mockResolvedValue(null);
      await expect(service.findByCode('TEST')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [{ id: 1 }];
      permissionRepo.find.mockResolvedValue(mockPermissions);
      const result = await service.getAllPermissions();
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('getPermissionsByGroup', () => {
    it('should group permissions', async () => {
      const permissions = [
        { id: 1, group: 'A', code: 'A1' },
        { id: 2, group: 'A', code: 'A2' },
        { id: 3, group: 'B', code: 'B1' },
      ];
      permissionRepo.find.mockResolvedValue(permissions);
      const result = await service.getPermissionsByGroup();
      expect(result.length).toBe(2);
      expect(result.find((g) => g.group === 'A').permissions.length).toBe(2);
    });
  });

  describe('checkUserPermission', () => {
    it('should return hasPermission=true if user has permission', async () => {
      // Mocking internal calls? No, better to mock repositories.
      // getUserPermissionCodes calls getUserPermissions calls userOrganizationRepo.findOne
      const userOrg = {
        role: {
          rolePermissions: [{ permissions: { code: 'TEST_PERM' } }],
        },
      };
      userOrganizationRepo.findOne.mockResolvedValue(userOrg);

      const result = await service.checkUserPermission(1, 1, 'TEST_PERM');
      expect(result.hasPermission).toBe(true);
    });
  });

  describe('checkUserPermissions', () => {
    it('should return check results for multiple permissions', async () => {
      const userOrg = {
        role: {
          rolePermissions: [{ permissions: { code: 'PERM_A' } }],
        },
      };
      userOrganizationRepo.findOne.mockResolvedValue(userOrg);

      const results = await service.checkUserPermissions(1, 1, [
        'PERM_A',
        'PERM_B',
      ]);

      expect(results).toHaveLength(2);
      expect(
        results.find((r) => r.permissionCode === 'PERM_A').hasPermission,
      ).toBe(true);
      expect(
        results.find((r) => r.permissionCode === 'PERM_B').hasPermission,
      ).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const userOrg = {
        role: {
          rolePermissions: [{ permissions: { code: 'PERM' } }],
        },
      };
      userOrganizationRepo.findOne.mockResolvedValue(userOrg);
      expect(await service.hasPermission(1, 1, 'PERM')).toBe(true);
    });
  });

  describe('deletePermissions', () => {
    it('should delete specific permissions', async () => {
      rolePermissionsRepo.delete.mockResolvedValue({});
      const result = await service.deletePermissions(1, [1, 2]);
      expect(result).toBe(true);
      expect(rolePermissionsRepo.delete).toHaveBeenCalledWith({
        roleId: 1,
        permissionId: expect.anything(),
      });
    });

    it('should delete all permissions if no list provided', async () => {
      rolePermissionsRepo.delete.mockResolvedValue({});
      const result = await service.deletePermissions(1);
      expect(result).toBe(true);
      expect(rolePermissionsRepo.delete).toHaveBeenCalledWith({ roleId: 1 });
    });

    it('should return error on failure', async () => {
      rolePermissionsRepo.delete.mockRejectedValue(new Error('DB Error'));
      const result = await service.deletePermissions(1);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('createPermissions', () => {
    it('should create permissions', async () => {
      permissionRepo.findByIds.mockResolvedValue([{ id: 1 }]);
      rolePermissionsRepo.save.mockResolvedValue({});
      const result = await service.createPermissions(1, [1]);
      expect(result).toBe(true);
    });

    it('should throw error if permission count mismatch', async () => {
      permissionRepo.findByIds.mockResolvedValue([]);
      await expect(service.createPermissions(1, [1])).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updatePermission', () => {
    it('should add and delete permissions', async () => {
      // existing: [1], target: [2] -> delete 1, add 2
      rolePermissionsRepo.find.mockResolvedValue([{ permissionId: 1 }]);
      const mockDelete = jest
        .spyOn(service, 'deletePermissions')
        .mockResolvedValue(true);
      const mockCreate = jest
        .spyOn(service, 'createPermissions')
        .mockResolvedValue(true);

      await service.updatePermission(1, [2]);

      expect(mockDelete).toHaveBeenCalled(); // with 1
      expect(mockCreate).toHaveBeenCalled(); // with 2
    });

    it('should handle errors', async () => {
      rolePermissionsRepo.find.mockRejectedValue(new Error('DB Error'));
      await expect(service.updatePermission(1, [1])).rejects.toThrow(
        'DB Error',
      );
    });
  });

  describe('getUserRoleAndPermissions', () => {
    it('should return empty if user not found', async () => {
      userOrganizationRepo.findOne.mockResolvedValue(null);
      const result = await service.getUserRoleAndPermissions(1, 1);
      expect(result.permissions).toEqual([]);
    });

    it('should return empty if user has no role', async () => {
      userOrganizationRepo.findOne.mockResolvedValue({ role: null });
      const result = await service.getUserRoleAndPermissions(1, 1);
      expect(result.permissions).toEqual([]);
    });
  });

  describe('getUserPermissions', () => {
    it('should return empty if user not found', async () => {
      userOrganizationRepo.findOne.mockResolvedValue(null);
      const result = await service.getUserPermissions(1, 1);
      expect(result).toEqual([]);
    });
  });

  describe('getUserPermissionsInOrganization', () => {
    it('should return user permissions details', async () => {
      const userOrg = {
        organization: { organizeName: 'Test Org' },
        isOwner: true,
        role: {
          id: 1,
          name: 'Admin',
          rolePermissions: [{ permissions: { id: 1, code: 'PERM' } }],
        },
      };
      userOrganizationRepo.findOne.mockResolvedValue(userOrg);

      const result = await service.getUserPermissionsInOrganization(1, 1);

      expect(result.role.name).toBe('Admin');
      expect(result.permissionCodes).toContain('PERM');
    });

    it('should throw ForbiddenException if user not in org', async () => {
      userOrganizationRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getUserPermissionsInOrganization(1, 1),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
