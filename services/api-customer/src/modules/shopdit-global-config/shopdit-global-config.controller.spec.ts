import { Test, TestingModule } from '@nestjs/testing';
import { ShopditGlobalConfigController } from './shopdit-global-config.controller';
import { ShopditGlobalConfigService } from './shopdit-global-config.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException } from '@nestjs/common';

describe('ShopditGlobalConfigController', () => {
  let controller: ShopditGlobalConfigController;

  const mockService = {
    get: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopditGlobalConfigController],
      providers: [
        {
          provide: ShopditGlobalConfigService,
          useValue: mockService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<ShopditGlobalConfigController>(
      ShopditGlobalConfigController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('show', () => {
    it('should return config', async () => {
      mockService.get.mockResolvedValue({});
      expect(await controller.show()).toEqual({});
      expect(mockService.get).toHaveBeenCalled();
    });
  });

  describe('createOrUpdate', () => {
    it('should create or update config', async () => {
      const dto = {};
      mockService.createOrUpdate.mockResolvedValue({});
      expect(await controller.createOrUpdate(dto)).toEqual({});
      expect(mockService.createOrUpdate).toHaveBeenCalledWith(dto);
    });

    it('should throw http exception on error', async () => {
      mockService.createOrUpdate.mockRejectedValue(new Error('fail'));
      await expect(controller.createOrUpdate({})).rejects.toThrow(
        HttpException,
      );
    });
  });
});
