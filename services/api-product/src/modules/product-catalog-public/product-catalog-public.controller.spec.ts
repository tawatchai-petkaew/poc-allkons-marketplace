import { Test, TestingModule } from '@nestjs/testing';
import { ProductCatalogPublicController } from './product-catalog-public.controller';
import { CACHE_MANAGER } from '@nestjs/cache-manager/dist/cache.constants';
import { ProductCatalogPublicService } from './product-catalog-public.service';
import { HttpException } from '@nestjs/common';

describe('ProductCatalogPublicController', () => {
  let controller: ProductCatalogPublicController;
  let service: jest.Mocked<ProductCatalogPublicService>;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCatalogPublicController],
      providers: [
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        {
          provide: ProductCatalogPublicService,
          useValue: {
            getAll: jest.fn(),
            primaryProductCatalog: jest.fn(),
            showById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductCatalogPublicController>(
      ProductCatalogPublicController,
    );
    service = module.get(ProductCatalogPublicService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('showAll delegates to service and passes params', async () => {
    const expected = { items: [1, 2], meta: { total: 2 } } as any;
    (service.getAll as jest.Mock).mockResolvedValue(expected);

    const res = await controller.showAll(3, 25, 'true', 'name');
    expect(service.getAll).toHaveBeenCalledWith(
      { page: 3, limit: 25 },
      'true',
      'name',
    );
    expect(res).toBe(expected);
  });

  it('showAll uses default page/limit when undefined', async () => {
    const expected = { items: [], meta: {} } as any;
    (service.getAll as jest.Mock).mockResolvedValue(expected);

    const res = await controller.showAll(
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
    );
    expect(service.getAll).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      undefined,
      undefined,
    );
    expect(res).toBe(expected);
  });

  it('showPrimary success returns service result', async () => {
    (service.primaryProductCatalog as jest.Mock).mockResolvedValue({
      data: [1],
    });
    const res = await controller.showPrimary();
    expect(service.primaryProductCatalog).toHaveBeenCalled();
    expect(res).toEqual({ data: [1] });
  });

  it('showPrimary error path throws HttpException BAD_REQUEST', async () => {
    (service.primaryProductCatalog as jest.Mock).mockRejectedValue(
      new Error('boom'),
    );
    await expect(controller.showPrimary()).rejects.toBeInstanceOf(
      HttpException,
    );
    try {
      await controller.showPrimary();
    } catch (err: any) {
      expect(err.getStatus()).toBe(400);
      expect(err.getResponse()).toEqual({ message: 'boom' });
    }
  });

  it('show success path passes id and params', async () => {
    (service.showById as jest.Mock).mockResolvedValue({ data: { id: 9 } });
    const res = await controller.show('9', 4, 50, 'q', 'true', 'LATEST');
    expect(service.showById).toHaveBeenCalledWith(
      9,
      { page: 4, limit: 50 },
      'true',
      'q',
      'LATEST',
    );
    expect(res).toEqual({ data: { id: 9 } });
  });

  it('show uses default page/limit and converts id to number', async () => {
    (service.showById as jest.Mock).mockResolvedValue({ data: {} });
    const res = await controller.show(
      '12',
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
    );
    expect(service.showById).toHaveBeenCalledWith(
      12,
      { page: 1, limit: 10 },
      undefined,
      undefined,
      undefined,
    );
    expect(res).toEqual({ data: {} });
  });

  it('show error path throws HttpException BAD_REQUEST', async () => {
    (service.showById as jest.Mock).mockRejectedValue(new Error('nope'));
    await expect(
      controller.show('1', 1, 10, '', 'true', 'LASTED'),
    ).rejects.toBeInstanceOf(HttpException);
    try {
      await controller.show('1', 1, 10, '', 'true', 'LASTED');
    } catch (err: any) {
      expect(err.getStatus()).toBe(400);
      expect(err.getResponse()).toEqual({ message: 'nope' });
    }
  });
});
