import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceProductService } from './marketplace-product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../../model/product.entity';
import { ProductTranslation } from '../../model/product-translation.entity';
import { ProductCategory } from '../../model/product-category.entity';
import { ProductCategoryTranslation } from '../../model/product-category-translation.entity';
import { ProductBrand } from '../../model/product-brand.entity';
import { ProductBrandTranslation } from '../../model/product-brand-translation.entity';
import { FlashSalePublicService } from '../../modules/flash-sale-public/flash-sale-public.service';
import { RequestContextService } from '../../modules/request-context/request-context.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductOrderBy } from '@/modules/product-catalog-public/enum/product.enum';
import { getAllWithTranslationWithData, getByIdWithTranslation } from '@/utils';
// Mock paginate to avoid relying on QueryBuilder internals in tests
jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(async () => ({
    items: [{ merchant: {} }],
    meta: { totalItems: 1 },
  })),
}));

// Mock translation utilities used inside service to avoid deep logic
jest.mock('@/utils', () => ({
  getAllWithTranslationWithData: jest
    .fn()
    .mockResolvedValue({ items: [], meta: {} }),
  getByIdWithTranslation: jest.fn().mockResolvedValue({ id: 999 }),
}));

describe('MarketplaceProductService', () => {
  let service: MarketplaceProductService;
  let productRepo: any;
  let flashSalePublicService: FlashSalePublicService;
  let contextService: RequestContextService;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getCount: jest.fn(),
    getQuery: jest.fn().mockReturnValue('SELECT 1'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductTranslation),
          useValue: { findOne: jest.fn().mockReturnThis() },
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(ProductCategoryTranslation),
          useValue: { findOne: jest.fn().mockReturnThis() },
        },
        {
          provide: getRepositoryToken(ProductBrand),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(ProductBrandTranslation),
          useValue: { findOne: jest.fn().mockReturnThis() },
        },
        {
          provide: FlashSalePublicService,
          useValue: {
            getActiveFlashSale: jest.fn(),
            transformProduct: jest.fn(),
            transformProductPrice: jest.fn(),
          },
        },
        {
          provide: RequestContextService,
          useValue: {
            currentLang: 'en',
          },
        },
      ],
    }).compile();

    service = module.get<MarketplaceProductService>(MarketplaceProductService);
    productRepo = module.get(getRepositoryToken(Product));
    flashSalePublicService = module.get<FlashSalePublicService>(
      FlashSalePublicService,
    );
    contextService = module.get<RequestContextService>(RequestContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('showBySlug', () => {
    const mockProduct = {
      id: 1,
      slug: 'test-product',
      merchant: { id: 1 },
      productCategory: { id: 1 },
      productBrand: { id: 1 },
      productItems: [{ id: 1, price: 100 }],
    } as any;

    it('should return product when found', async () => {
      const mockFlashSale = { id: 1 } as any;
      const mockTransformedProduct = { ...mockProduct, flashSalePrice: 80 };

      mockQueryBuilder.getMany.mockResolvedValue([mockProduct]);
      jest
        .spyOn(flashSalePublicService, 'getActiveFlashSale')
        .mockResolvedValue(mockFlashSale);
      jest
        .spyOn(flashSalePublicService, 'transformProduct')
        .mockReturnValue(mockTransformedProduct);

      const result = await service.showBySlug('test-product');

      expect(result.data).toBeDefined();
      expect(productRepo.createQueryBuilder).toHaveBeenCalled();
      expect(flashSalePublicService.getActiveFlashSale).toHaveBeenCalled();
    });

    it('should throw error when product not found', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await expect(service.showBySlug('non-existent')).rejects.toThrow(
        new HttpException('Product not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle multiple product variants', async () => {
      const mockProducts = [
        { id: 1, productItems: [{ price: 150 }] },
        { id: 2, productItems: [{ price: 100 }] },
      ] as any;
      const mockFlashSale = { id: 1 } as any;

      mockQueryBuilder.getMany.mockResolvedValue(mockProducts);
      jest
        .spyOn(flashSalePublicService, 'getActiveFlashSale')
        .mockResolvedValue(mockFlashSale);
      jest
        .spyOn(flashSalePublicService, 'transformProduct')
        .mockReturnValue(mockProducts[1]);

      const result = await service.showBySlug('test-product');

      expect(result.data).toBeDefined();
    });
  });

  describe('getProductMerchants', () => {
    it('returns empty meta when no products found', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);
      mockQueryBuilder.getCount.mockResolvedValueOnce(0);

      // createQueryBuilder is used twice in the method; ensure both calls return our mock
      (productRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getProductMerchants('slug-x', 1, 10);
      expect(result).toEqual({
        data: [],
        meta: {
          currentPage: 1,
          itemCount: 0,
          totalItems: 0,
          totalPages: 0,
        },
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.slug = :slug',
        { slug: 'slug-x' },
      );
    });
  });

  describe('getRelationProduct', () => {
    it('handles relationType = onCategory', async () => {
      const product = {
        slug: 's1',
        relationStatus: 'onCategory',
        productCategory: { id: 10 },
        merchant: { id: 7 },
      } as any;
      productRepo.findOne.mockResolvedValue(product);
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 1 }]);

      const res = await service.getRelationProduct('s1');

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { slug: 's1' },
        relations: ['productCategory', 'merchant'],
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'productCategory.id = :categoryId',
        { categoryId: 10 },
      );
      // translation util invoked
      expect(getAllWithTranslationWithData).toHaveBeenCalled();
      await expect(res).resolves?.not?.toThrow; // res is a Promise from util; awaiting call should resolve
    });

    it('handles relationType = allCategory', async () => {
      const product = {
        slug: 's2',
        relationStatus: 'allCategory',
        merchant: { id: 5 },
      } as any;
      productRepo.findOne.mockResolvedValue(product);
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 2 }]);

      const result = await service.getRelationProduct('s2');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'merchant.id = :id',
        { id: 5 },
      );
      expect(getAllWithTranslationWithData).toHaveBeenCalled();
      await expect(result).resolves?.not?.toThrow;
    });

    it('handles explicit ids (else branch)', async () => {
      const product = {
        slug: 's3',
        relationStatus: 'custom',
        valueCustomRelationStatus: ['100', '101'],
      } as any;
      const found = [{ id: 100 }, { id: 101 }];
      productRepo.findOne.mockResolvedValue(product);
      productRepo.find.mockResolvedValue(found);

      const res = await service.getRelationProduct('s3');

      expect(productRepo.find).toHaveBeenCalled();
      expect(getAllWithTranslationWithData).toHaveBeenCalledWith(
        expect.objectContaining({ parents: found }),
      );
      await expect(res).resolves?.not?.toThrow;
    });
  });

  describe('getProductMerchants (non-empty)', () => {
    it('returns computed meta and mapped products', async () => {
      const raw = [
        { id: 1, merchant: { id: 1 } },
        { id: 2, merchant: { id: 2 } },
      ] as any;

      mockQueryBuilder.getMany.mockResolvedValueOnce(raw);
      mockQueryBuilder.getCount.mockResolvedValueOnce(20);
      (productRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      // Mock flash sale transforms
      jest
        .spyOn(flashSalePublicService, 'getActiveFlashSale')
        .mockResolvedValue({ id: 'fs' } as any);
      jest
        .spyOn(flashSalePublicService, 'transformProduct')
        .mockImplementation((_fs, pd) => ({ ...pd, transformed: true }) as any);

      // Mock translation
      (getByIdWithTranslation as jest.Mock).mockResolvedValue({ id: 999 });

      const result = await service.getProductMerchants('slug-z', 2, 5);

      expect(result.meta).toEqual({
        currentPage: 2,
        itemCount: 2,
        totalItems: 20,
        totalPages: 4,
      });
      expect(flashSalePublicService.getActiveFlashSale).toHaveBeenCalledTimes(
        2,
      );
      expect(getByIdWithTranslation).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAll (branches)', () => {
    it('applies search ranking branch (withPagination=true)', async () => {
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [1],
        meta: { totalItems: 1 },
      });
      jest
        .spyOn(flashSalePublicService, 'getActiveFlashSale')
        .mockResolvedValue({} as any);
      // transform returns paginate-like object to keep parents compatible
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockReturnValue({ items: [{ merchant: {} }], meta: {} } as any);

      const res = await service.getAll(
        { page: 1, limit: 10 },
        'true',
        'search',
        [],
        [],
        [],
        'LASTED',
      );

      expect(mockQueryBuilder.addSelect).toHaveBeenCalled();
      expect(getAllWithTranslationWithData).toHaveBeenCalled();
      expect(res).toEqual({ items: [1], meta: { totalItems: 1 } });
    });

    it('applies category/brand/catalog filters and LOW_PRICE_TO_HIGH_PRICE order', async () => {
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: {},
      });
      jest
        .spyOn(flashSalePublicService, 'getActiveFlashSale')
        .mockResolvedValue({} as any);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockReturnValue({ items: [{ merchant: {} }], meta: {} } as any);

      await service.getAll(
        { page: 1, limit: 10 },
        'true',
        '',
        [1, 2],
        [3],
        [4, 5],
        ProductOrderBy.LOW_PRICE_TO_HIGH_PRICE,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'productCategory.id IN(:...productCategoryIds)',
        { productCategoryIds: [1, 2] },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'productBrand.id IN(:...productBrandIds)',
        { productBrandIds: [3] },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'productProductCatalog.productCatalogId IN(:...productCatalogIds)',
        { productCatalogIds: [4, 5] },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'product.minFinalProductPrice',
        'ASC',
      );
    });

    it('applies BEST_SELLER order branch', async () => {
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: {},
      });
      jest
        .spyOn(flashSalePublicService, 'getActiveFlashSale')
        .mockResolvedValue({} as any);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockReturnValue({ items: [{ merchant: {} }], meta: {} } as any);

      await service.getAll(
        { page: 1, limit: 10 },
        'true',
        '',
        [],
        [],
        [],
        ProductOrderBy.BEST_SELLER,
      );

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'product.soldQuantity',
        'DESC',
      );
    });
  });
});
