import { Test, TestingModule } from '@nestjs/testing';
import { FlashSalePublicController } from './flash-sale-public.controller';
import { FlashSalePublicService } from './flash-sale-public.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager/dist/cache.constants';

describe('FlashSalePublicController', () => {
  let controller: FlashSalePublicController;
  let service: FlashSalePublicService;

  const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlashSalePublicController],
      providers: [
        {
          provide: FlashSalePublicService,
          useValue: {
            activeFlashSale: jest.fn(),
            showById: jest.fn(),
            getActiveFlashSale: jest.fn(),
          },
        },
        {provide: CACHE_MANAGER, useValue: mockCacheManager}
      ],
    }).compile();

    controller = module.get<FlashSalePublicController>(
      FlashSalePublicController
    );
    service = module.get<FlashSalePublicService>(FlashSalePublicService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showActive', () => {
    it('should return active flash sale from service', async () => {
      const mockFlashSale = {
        id: 1,
        name: 'Active Flash Sale',
        status: 'ACTIVE',
      };

      jest.spyOn(service, 'activeFlashSale').mockResolvedValue(mockFlashSale);

      const result = await controller.showActive();

      expect(result).toEqual(mockFlashSale);
      expect(service.activeFlashSale).toHaveBeenCalled();
    });

    it('should throw HttpException on error', async () => {
      jest.spyOn(service, 'activeFlashSale').mockRejectedValue(new Error('Flash sale error'));

      await expect(controller.showActive()).rejects.toThrow();
    });
  });

  describe('show', () => {
    it('should return flash sale by id', async () => {
      const mockFlashSale = {
        id: 1,
        name: 'Flash Sale 1',
      };

      jest.spyOn(service, 'showById').mockResolvedValue(mockFlashSale);

      const result = await controller.show('1');

      expect(result).toEqual(mockFlashSale);
      expect(service.showById).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException on error', async () => {
      jest.spyOn(service, 'showById').mockRejectedValue(new Error('Not found'));

      await expect(controller.show('999')).rejects.toThrow();
    });
  });
});
