import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('PermissionController', () => {
  let controller: PermissionController;
  let service: PermissionService;

  const mockService = {
    findAll: jest.fn(),
    getAllPermissions: jest.fn(),
    getPermissionsByGroup: jest.fn(),
    findOne: jest.fn(),
    findByCode: jest.fn(),
    checkUserPermission: jest.fn(),
    checkUserPermissions: jest.fn(),
    getUserPermissionsInOrganization: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: mockService,
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

    controller = module.get<PermissionController>(PermissionController);
    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 10 };
      mockService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll({});
      expect(result).toEqual(expected);
    });
  });

  describe('getAllPermissions', () => {
    it('should return list', async () => {
      mockService.getAllPermissions.mockResolvedValue([]);
      expect(await controller.getAllPermissions()).toEqual([]);
    });
  });

  describe('getPermissionsByGroup', () => {
    it('should return grouped', async () => {
      mockService.getPermissionsByGroup.mockResolvedValue([]);
      expect(await controller.getPermissionsByGroup()).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return one', async () => {
      const expected = { id: 1 };
      mockService.findOne.mockResolvedValue(expected);
      expect(await controller.findOne(1)).toEqual(expected);
    });
  });

  describe('findByCode', () => {
    it('should return one by code', async () => {
      const expected = { code: 'TEST' };
      mockService.findByCode.mockResolvedValue(expected);
      expect(await controller.findByCode('TEST')).toEqual(expected);
    });
  });

  describe('checkCurrentUserPermission', () => {
    it('should check permission', async () => {
      const expected = { hasPermission: true };
      mockService.checkUserPermission.mockResolvedValue(expected);
      const user = { userId: 1 };
      const body = { permissionCode: 'TEST' };
      const result = await controller.checkCurrentUserPermission(1, body, user);
      expect(result).toEqual(expected);
      expect(mockService.checkUserPermission).toHaveBeenCalledWith(
        1,
        1,
        'TEST',
      );
    });
  });

  describe('checkCurrentUserPermissions', () => {
    it('should check permissions', async () => {
      const expected = [{ hasPermission: true }];
      mockService.checkUserPermissions.mockResolvedValue(expected);
      const user = { userId: 1 };
      const body = { permissionCodes: ['TEST'] };
      const result = await controller.checkCurrentUserPermissions(
        1,
        body,
        user,
      );
      expect(result).toEqual(expected);
      expect(mockService.checkUserPermissions).toHaveBeenCalledWith(1, 1, [
        'TEST',
      ]);
    });
  });

  describe('checkPermissionWithOrgToken', () => {
    it('should check permission', async () => {
      const expected = { hasPermission: true };
      mockService.checkUserPermission.mockResolvedValue(expected);
      const user = { userId: 1, organizationId: 2 };
      const body = { permissionCode: 'TEST' };
      const result = await controller.checkPermissionWithOrgToken(body, user);
      expect(result).toEqual(expected);
      expect(mockService.checkUserPermission).toHaveBeenCalledWith(
        1,
        2,
        'TEST',
      );
    });
  });

  describe('getCurrentUserPermissions', () => {
    it('should get perms', async () => {
      const expected = { permissions: [] };
      mockService.getUserPermissionsInOrganization.mockResolvedValue(expected);
      const user = { userId: 1 };
      const result = await controller.getCurrentUserPermissions(2, user);
      expect(result).toEqual(expected);
      expect(mockService.getUserPermissionsInOrganization).toHaveBeenCalledWith(
        1,
        2,
      );
    });
  });

  describe('getCurrentUserPermissionsWithOrgToken', () => {
    it('should get perms using token org id', async () => {
      const expected = { permissions: [] };
      mockService.getUserPermissionsInOrganization.mockResolvedValue(expected);
      const user = { userId: 1, organizationId: 99 };
      const req = {};
      const result = await controller.getCurrentUserPermissionsWithOrgToken(
        user,
        req,
      );
      expect(result).toEqual(expected);
      expect(mockService.getUserPermissionsInOrganization).toHaveBeenCalledWith(
        1,
        99,
      );
    });
  });

  describe('getUserPermissions', () => {
    it('should get perms for user', async () => {
      const expected = { permissions: [] };
      mockService.getUserPermissionsInOrganization.mockResolvedValue(expected);
      const result = await controller.getUserPermissions(2, 1);
      expect(result).toEqual(expected);
      expect(mockService.getUserPermissionsInOrganization).toHaveBeenCalledWith(
        1,
        2,
      );
    });
  });
});
