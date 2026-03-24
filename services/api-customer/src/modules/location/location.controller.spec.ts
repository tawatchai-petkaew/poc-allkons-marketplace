import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

describe('LocationController', () => {
  let controller: LocationController;
  let service: any;
  let cacheManager: any;

  beforeEach(async () => {
    const mockService = {
      search: jest.fn(),
      getUserLocations: jest.fn(),
      getUserDefaultLocation: jest.fn(),
      createUserLocation: jest.fn(),
      deleteLocation: jest.fn(),
      setDefaultLocation: jest.fn(),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        { provide: LocationService, useValue: mockService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should return cached result', async () => {
      cacheManager.get.mockResolvedValue([{ id: 1 }]);
      const result = await controller.search('keyword');
      expect(cacheManager.get).toHaveBeenCalled();
      expect(service.search).not.toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });

    it('should call service on cache miss', async () => {
      cacheManager.get.mockResolvedValue(null);
      service.search.mockResolvedValue([{ id: 1 }]);

      const result = await controller.search('keyword');

      expect(service.search).toHaveBeenCalledWith('keyword');
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getUserLocations', () => {
    it('should return locations', async () => {
      service.getUserLocations.mockResolvedValue([]);
      await controller.getUserLocations({ user: { userId: 1 } }, 1, 10);
      expect(service.getUserLocations).toHaveBeenCalledWith(1, 1, 10);
    });
  });

  describe('getUserDefaultLocation', () => {
    it('should return default location', async () => {
      service.getUserDefaultLocation.mockResolvedValue({});
      await controller.getUserDefaultLocation({ user: { userId: 1 } });
      expect(service.getUserDefaultLocation).toHaveBeenCalledWith(1);
    });
  });

  describe('createLocation', () => {
    it('should create location', async () => {
      service.createUserLocation.mockResolvedValue({});
      await controller.createLocation({ user: { userId: 1 } }, {} as any);
      expect(service.createUserLocation).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      );
    });
  });

  describe('deleteLocation', () => {
    it('should delete location', async () => {
      service.deleteLocation.mockResolvedValue({});
      await controller.deleteLocation(1);
      expect(service.deleteLocation).toHaveBeenCalledWith(1);
    });
  });

  describe('setDefaultLocation', () => {
    it('should set default location', async () => {
      service.setDefaultLocation.mockResolvedValue({});
      await controller.setDefaultLocation(1, { user: { userId: 1 } });
      expect(service.setDefaultLocation).toHaveBeenCalledWith(1, 1);
    });
  });
});
