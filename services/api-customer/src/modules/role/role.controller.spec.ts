import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { FilterRoleDto } from './dto/filter-role.dto';
import { Role } from '../../model/roles.entity';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from '@/model/organization.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { PermissionService } from '@/modules/permission/permission.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;

  const mockRole = {
    id: 1,
    name: 'admin',
    displayName: 'Administrator',
    description: 'Administrator role',
    isActive: true,
    organizeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    userOrganizations: [],
    rolePermissions: [],
    organizations: [],
  } as Role;

  const mockRoleService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getRolesByOrganization: jest.fn(),
    getListRole: jest.fn(),
    getDefaultAndCloneRoles: jest.fn(),
    getAllRolesPermissions: jest.fn(),
    getRolePermissions: jest.fn(),
    createRolePermission: jest.fn(),
    updateRolePermission: jest.fn(),
    deleteRolePermission: jest.fn(),
    updateUserRole: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockPermissionService = {
    getUserPermissionCodes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(() => []),
          },
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserOrganization),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: PermissionService,
          useValue: mockPermissionService,
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
      .overrideGuard(OrganizationPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated roles', async () => {
      const filterDto: FilterRoleDto = { page: 1, limit: 10 };
      const mockResult = {
        data: [mockRole],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockRoleService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('getDefaultAndCloneRoles', () => {
    it('should return default and clone roles', async () => {
      mockRoleService.getDefaultAndCloneRoles.mockResolvedValue([mockRole]);
      expect(await controller.getDefaultAndCloneRoles()).toEqual([mockRole]);
      expect(mockRoleService.getDefaultAndCloneRoles).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      mockRoleService.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockRole);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getRolesByOrganization', () => {
    it('should return roles by organization', async () => {
      const roles = [mockRole];
      mockRoleService.getRolesByOrganization.mockResolvedValue(roles);

      const result = await controller.getRolesByOrganization('1');

      expect(result).toEqual(roles);
      expect(service.getRolesByOrganization).toHaveBeenCalledWith(1);
    });
  });

  describe('getListRole', () => {
    it('should return list role', async () => {
      const org = { id: 1 } as Organization;
      const query = { page: 1, limit: 10 };
      mockRoleService.getListRole.mockResolvedValue({ roles: [], total: 0 });

      expect(await controller.getListRole(org, query as any)).toEqual({
        roles: [],
        total: 0,
      });
      expect(mockRoleService.getListRole).toHaveBeenCalledWith(1, query);
    });
  });

  describe('getListRoleWithoutPermission', () => {
    it('should return list role', async () => {
      const org = { id: 1 } as Organization;
      const query = { page: 1, limit: 10 };
      mockRoleService.getListRole.mockResolvedValue({ roles: [], total: 0 });

      expect(
        await controller.getListRoleWithoutPermission(org, query as any),
      ).toEqual({ roles: [], total: 0 });
      expect(mockRoleService.getListRole).toHaveBeenCalledWith(1, query);
    });
  });

  describe('getAllRolesPermissions', () => {
    it('should get all roles perms', async () => {
      mockRoleService.getAllRolesPermissions.mockResolvedValue({});
      expect(
        await controller.getAllRolesPermissions({} as any, {
          organizationId: 1,
        }),
      ).toEqual({});
      expect(mockRoleService.getAllRolesPermissions).toHaveBeenCalled();
    });
  });

  describe('getRolePermissions', () => {
    it('should get role perms', async () => {
      mockRoleService.getRolePermissions.mockResolvedValue({});
      expect(
        await controller.getRolePermissions(1, { organizationId: 1 }),
      ).toEqual({});
      expect(mockRoleService.getRolePermissions).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('createRolePermission', () => {
    it('should create role perms', async () => {
      mockRoleService.createRolePermission.mockResolvedValue(true);
      expect(await controller.createRolePermission(1, {} as any)).toBe(true);
      expect(mockRoleService.createRolePermission).toHaveBeenCalled();
    });
  });

  describe('updateRolePermission', () => {
    it('should update role perms', async () => {
      mockRoleService.updateRolePermission.mockResolvedValue(true);
      expect(await controller.updateRolePermission(1, {} as any)).toBe(true);
      expect(mockRoleService.updateRolePermission).toHaveBeenCalled();
    });
  });

  describe('deleteRolePermission', () => {
    it('should delete role perms', async () => {
      mockRoleService.deleteRolePermission.mockResolvedValue(true);
      expect(await controller.deleteRolePermission(1)).toBe(true);
      expect(mockRoleService.deleteRolePermission).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      mockRoleService.updateUserRole.mockResolvedValue({});
      expect(
        await controller.updateUserRole(
          { user: { userId: 99 } },
          1,
          1,
          {} as any,
        ),
      ).toEqual({});
      expect(mockRoleService.updateUserRole).toHaveBeenCalledWith(1, 1, {}, 99);
    });
  });
});
