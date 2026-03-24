import { Test, TestingModule } from '@nestjs/testing';
import { BannerMerchantPublicController } from './banner-merchant-public.controller';
import { BannerMerchantPublicService } from './banner-merchant-public.service';
import { HttpException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('BannerMerchantPublicController', () => {
  let controller: BannerMerchantPublicController;
  let service: any;

  const mockService = {
    getAll: jest.fn(),
    showById: jest.fn(),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerMerchantPublicController],
      providers: [
        {
          provide: BannerMerchantPublicService,
          useValue: mockService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCache,
        },
      ],
    }).compile();

    controller = module.get<BannerMerchantPublicController>(
      BannerMerchantPublicController,
    );
    service = module.get<BannerMerchantPublicService>(
      BannerMerchantPublicService,
    );
  });

  describe('showAll', () => {
    it('should return all banners', async () => {
      mockService.getAll.mockResolvedValue([]);
      const result = await controller.showAll();
      expect(result).toEqual([]);
      expect(service.getAll).toHaveBeenCalled();
    });
  });

  describe('show', () => {
    it('should return banner by id', async () => {
      mockService.showById.mockResolvedValue({ id: 1 });
      const result = await controller.show('1');
      expect(result.id).toBe(1);
      expect(service.showById).toHaveBeenCalledWith(1);
    });

    it('should handle errors', async () => {
      mockService.showById.mockRejectedValue(new Error('Fail'));
      await expect(controller.show('1')).rejects.toThrow(HttpException);
    });
  });
});
