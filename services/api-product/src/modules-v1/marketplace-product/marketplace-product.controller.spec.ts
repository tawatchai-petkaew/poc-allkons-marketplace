import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceProductController } from './marketplace-product.controller';
import { MarketplaceProductService } from './marketplace-product.service';
import { HttpException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('MarketplaceProductController', () => {
  let controller: MarketplaceProductController;
  let service: jest.Mocked<MarketplaceProductService>;

  beforeEach(async () => {
    const mockService: Partial<Record<keyof MarketplaceProductService, any>> = {
      getRelationProduct: jest.fn(),
      getProductMerchants: jest.fn(),
      getAll: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceProductController],
      providers: [
        {
          provide: MarketplaceProductService,
          useValue: mockService,
        },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get(MarketplaceProductController);
    service = module.get(MarketplaceProductService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getRelationProduct delegates to service', async () => {
    (service.getRelationProduct as jest.Mock).mockResolvedValue({ items: [] });
    const res = await controller.getRelationProduct('slug-1');
    expect(service.getRelationProduct).toHaveBeenCalledWith('slug-1');
    expect(res).toEqual({ items: [] });
  });

  it('getProductMerchants passes page/limit and slug', async () => {
    (service.getProductMerchants as jest.Mock).mockResolvedValue({
      data: [],
      meta: {},
    });
    const res = await controller.getProductMerchants('slug-2', 2, 15);
    expect(service.getProductMerchants).toHaveBeenCalledWith('slug-2', 2, 15);
    expect(res).toEqual({ data: [], meta: {} });
  });

  it('getProductMerchants uses default page/limit when not provided', async () => {
    (service.getProductMerchants as jest.Mock).mockResolvedValue({
      data: [],
      meta: {},
    });
    // call with only slug
    const res = await controller.getProductMerchants('slug-3' as any);
    expect(service.getProductMerchants).toHaveBeenCalledWith('slug-3', 1, 10);
    expect(res).toEqual({ data: [], meta: {} });
  });

  it('showAll success path returns service result and passes params correctly', async () => {
    const svcResult = { items: [1, 2], meta: { total: 2 } };
    (service.getAll as jest.Mock).mockResolvedValue(svcResult);
    const res = await controller.showAll(
      3, // page
      25, // limit
      'true', // withPagination
      'search term',
      [10, 11],
      [20],
      [30, 31, 32],
      'LASTED',
    );
    expect(service.getAll).toHaveBeenCalledWith(
      { page: 3, limit: 25 },
      'true',
      'search term',
      [10, 11],
      [20],
      [30, 31, 32],
      'LASTED',
    );
    expect(res).toBe(svcResult);
  });

  it('showAll error path rethrows as HttpException with BAD_REQUEST', async () => {
    (service.getAll as jest.Mock).mockRejectedValue(new Error('boom'));
    try {
      await controller.showAll(1, 10, 'true', '', [], [], [], 'LASTED');
      fail('Expected to throw');
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(400);
      expect(err.getResponse()).toEqual({ message: 'boom' });
    }
  });

  it('showAll uses default page/limit when undefined is passed', async () => {
    const svcResult = { items: [], meta: {} };
    (service.getAll as jest.Mock).mockResolvedValue(svcResult);
    const res = await controller.showAll(
      undefined as any, // page
      undefined as any, // limit
      undefined as any, // withPagination
      undefined as any, // search
      undefined as any, // productCategoryIds
      undefined as any, // productBrandIds
      undefined as any, // productCatalogIds
      undefined as any, // orderBy
    );
    expect(service.getAll).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    expect(res).toBe(svcResult);
  });
});
