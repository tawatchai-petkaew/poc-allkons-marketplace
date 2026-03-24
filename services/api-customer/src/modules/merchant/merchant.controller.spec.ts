import { Test, TestingModule } from '@nestjs/testing';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OrganizationPermissionGuard } from '../../auth/guards/organization-permission.guard';
import { FlexibleCacheInterceptor } from '../../cache/flexible-cache.interceptor';
import { HttpPersonalCacheInterceptor } from '../../cache/personal-cache.interceptor';
import { ResponseInterceptor } from '../../interceptors/response.interceptors';

jest.mock('../../auth/decorators/organization-permissions.decorator', () => ({
  RequirePermissions: jest.fn(() => jest.fn()),
}));

describe('MerchantController', () => {
  let controller: MerchantController;
  let service: any;
  let cacheManager: any;

  beforeEach(async () => {
    service = {
      getAll: jest.fn(),
      create: jest.fn(),
      getApiKey: jest.fn(),
      showById: jest.fn(),
      showCurrentMerchant: jest.fn(),
      checkSlug: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      startCronJobCreateExpenseBill: jest.fn(),
      manaulCronJobCreateExpenseBill: jest.fn(),
      manaulCreateExpenseBill: jest.fn(),
      migrateMerchantShipmentOnline: jest.fn(),
      getMemberMerchant: jest.fn(),
      getAvailableUsersForMerchant: jest.fn(),
      addUsersToMerchant: jest.fn(),
      updateMerchantInfo: jest.fn(),
      updateMerchantMember: jest.fn(),
      deleteMerchantMember: jest.fn(),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantController],
      providers: [
        { provide: MerchantService, useValue: service },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OrganizationPermissionGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(FlexibleCacheInterceptor)
      .useValue({ intercept: jest.fn() })
      .overrideInterceptor(HttpPersonalCacheInterceptor)
      .useValue({ intercept: jest.fn() })
      .overrideInterceptor(ResponseInterceptor)
      .useValue({ intercept: jest.fn() })
      .compile();

    controller = module.get<MerchantController>(MerchantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showAll', () => {
    it('should return merchants', async () => {
      service.getAll.mockResolvedValue([]);
      await controller.showAll({}, 1, 10, 'true');
      expect(service.getAll).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 },
        'true',
      );
    });
  });

  describe('create', () => {
    it('should create merchant', async () => {
      service.create.mockResolvedValue({});
      await controller.create({ user: { userId: 1 } }, {} as any);
      expect(service.create).toHaveBeenCalledWith({}, 1);
    });
  });

  describe('show', () => {
    it('should show merchant', async () => {
      service.showById.mockResolvedValue({});
      await controller.show('1');
      expect(service.showById).toHaveBeenCalledWith(1);
    });
  });

  describe('showBySlug', () => {
    it('should show merchant by slug', async () => {
      service.showCurrentMerchant.mockResolvedValue({});
      await controller.showBySlug('slug', { user: { userId: 1 } });
      expect(service.showCurrentMerchant).toHaveBeenCalledWith('slug', 1);
    });
  });

  describe('getMemberMerchant', () => {
    it('should return cached value', async () => {
      cacheManager.get.mockResolvedValue({ id: 1 });
      const result = await controller.getMemberMerchant(1, {
        page: 1,
        limit: 10,
      } as any);
      expect(cacheManager.get).toHaveBeenCalled();
      expect(service.getMemberMerchant).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ id: 1 });
    });

    it('should call service on cache miss', async () => {
      cacheManager.get.mockResolvedValue(null);
      service.getMemberMerchant.mockResolvedValue({ id: 1 });

      await controller.getMemberMerchant(1, { page: 1, limit: 10 } as any);

      expect(service.getMemberMerchant).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });
});
