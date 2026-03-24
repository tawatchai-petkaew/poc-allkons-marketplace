import { Test, TestingModule } from '@nestjs/testing';
import { ProductPublicController } from './product-public.controller';
import { ProductPublicService } from './product-public.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager/dist/cache.constants';
import { HttpException } from '@nestjs/common';

describe('ProductPublicController', () => {
  let controller: ProductPublicController;
  let service: ProductPublicService;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductPublicController],
      providers: [
        {
          provide: ProductPublicService,
          useValue: {
            getAll: jest.fn(),
            getBestSeller: jest.fn(),
            getNew: jest.fn(),
            getDiscount: jest.fn(),
            getRecommend: jest.fn(),
            showBySlug: jest.fn(),
            getRelationProduct: jest.fn(),
          },
        },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get<ProductPublicController>(ProductPublicController);
    service = module.get<ProductPublicService>(ProductPublicService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showAll', () => {
    it('should return products from service', async () => {
      const mockProducts = {
        items: [
          { id: 1, name: 'Product 1' },
          { id: 2, name: 'Product 2' },
        ],
        meta: { totalItems: 2 },
      };

      jest.spyOn(service, 'getAll').mockResolvedValue(mockProducts);

      const result = await controller.showAll(
        1,
        10,
        'true',
        '',
        [],
        [],
        [],
        'LASTED',
      );

      expect(result).toEqual(mockProducts);
      expect(service.getAll).toHaveBeenCalled();
    });

    it('should wrap errors in HttpException', async () => {
      jest.spyOn(service, 'getAll').mockRejectedValue(new Error('boom'));

      await expect(
        controller.showAll(1, 10, 'true', '', [], [], [], 'LASTED'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('should support default param values', async () => {
      const mockRes = { items: [], meta: {} } as any;
      (service.getAll as jest.Mock).mockResolvedValue(mockRes);
      // Call with undefined to exercise default initializers
      const res = await controller.showAll(
        undefined as any,
        undefined as any,
        undefined as any,
        undefined as any,
        undefined as any,
        undefined as any,
        undefined as any,
        undefined as any,
      );
      expect(res).toEqual(mockRes);
    });
  });

  describe('showAllBestSeller', () => {
    it('returns from service', async () => {
      (service.getBestSeller as jest.Mock).mockResolvedValue({ items: [1] });
      const res = await controller.showAllBestSeller(1, 10, 'true');
      expect(res).toEqual({ items: [1] });
    });

    it('wraps service error', async () => {
      (service.getBestSeller as jest.Mock).mockRejectedValue(new Error('x'));
      await expect(
        controller.showAllBestSeller(1, 10, 'true'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('supports default param values', async () => {
      (service.getBestSeller as jest.Mock).mockResolvedValue({ items: [] });
      const res = await controller.showAllBestSeller(
        undefined as any,
        undefined as any,
        undefined as any,
      );
      expect(res).toEqual({ items: [] });
    });
  });

  describe('showAllNew', () => {
    it('returns from service', async () => {
      (service.getNew as jest.Mock).mockResolvedValue({ items: [2] });
      const res = await controller.showAllNew(1, 10, 'true');
      expect(res).toEqual({ items: [2] });
    });

    it('wraps service error', async () => {
      (service.getNew as jest.Mock).mockRejectedValue(new Error('x'));
      await expect(controller.showAllNew(1, 10, 'true')).rejects.toBeInstanceOf(
        HttpException,
      );
    });

    it('supports default param values', async () => {
      (service.getNew as jest.Mock).mockResolvedValue({ items: [] });
      const res = await controller.showAllNew(
        undefined as any,
        undefined as any,
        undefined as any,
      );
      expect(res).toEqual({ items: [] });
    });
  });

  describe('showAllDiscount', () => {
    it('returns from service', async () => {
      (service.getDiscount as jest.Mock).mockResolvedValue({ items: [3] });
      const res = await controller.showAllDiscount(1, 10, 'true');
      expect(res).toEqual({ items: [3] });
    });

    it('wraps service error', async () => {
      (service.getDiscount as jest.Mock).mockRejectedValue(new Error('x'));
      await expect(
        controller.showAllDiscount(1, 10, 'true'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('supports default param values', async () => {
      (service.getDiscount as jest.Mock).mockResolvedValue({ items: [] });
      const res = await controller.showAllDiscount(
        undefined as any,
        undefined as any,
        undefined as any,
      );
      expect(res).toEqual({ items: [] });
    });
  });

  describe('showAllRecommed', () => {
    it('returns from service', async () => {
      (service.getRecommend as jest.Mock).mockResolvedValue({ items: [4] });
      const res = await controller.showAllRecommed(1, 10, 'true');
      expect(res).toEqual({ items: [4] });
    });

    it('wraps service error', async () => {
      (service.getRecommend as jest.Mock).mockRejectedValue(new Error('x'));
      await expect(
        controller.showAllRecommed(1, 10, 'true'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('supports default param values', async () => {
      (service.getRecommend as jest.Mock).mockResolvedValue({ items: [] });
      const res = await controller.showAllRecommed(
        undefined as any,
        undefined as any,
        undefined as any,
      );
      expect(res).toEqual({ items: [] });
    });
  });

  describe('show', () => {
    it('delegates to service.showBySlug', async () => {
      (service.showBySlug as jest.Mock).mockResolvedValue({ data: { id: 1 } });
      const res = await controller.show('slug');
      expect(service.showBySlug).toHaveBeenCalledWith('slug');
      expect(res).toEqual({ data: { id: 1 } });
    });
  });

  describe('showRelationProducts', () => {
    it('returns from service', async () => {
      (service.getRelationProduct as jest.Mock).mockResolvedValue([1, 2]);
      const res = await controller.showRelationProducts('slug');
      expect(res).toEqual([1, 2]);
    });

    it('wraps service error', async () => {
      (service.getRelationProduct as jest.Mock).mockRejectedValue(
        new Error('x'),
      );
      await expect(
        controller.showRelationProducts('slug'),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });
});
