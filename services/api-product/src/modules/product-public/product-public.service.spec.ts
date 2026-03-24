import { Test, TestingModule } from '@nestjs/testing';
import { ProductPublicService } from './product-public.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../../model/product.entity';
import { ProductTranslation } from '../../model/product-translation.entity';
import { ProductCategory } from '../../model/product-category.entity';
import { ProductCategoryTranslation } from '../../model/product-category-translation.entity';
import { ProductBrand } from '../../model/product-brand.entity';
import { ProductBrandTranslation } from '../../model/product-brand-translation.entity';
import { ProductItem } from '../../model/product-item.entity';
import { RequestContextService } from '../request-context/request-context.service';
import { FlashSalePublicService } from '../flash-sale-public/flash-sale-public.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { paginate } from 'nestjs-typeorm-paginate';
import {
  getAllWithTranslationWithData,
  getByIdWithTranslation,
} from '../../utils';
import { ProductOrderBy } from './enum/product.enum';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

jest.mock('../../utils', () => ({
  getAllWithTranslationWithData: jest.fn(),
  getByIdWithTranslation: jest.fn(),
}));

describe('ProductPublicService', () => {
  let service: ProductPublicService;
  let productRepo: any;
  let productItemRepo: any;
  let contextService: RequestContextService;
  let flashSalePublicService: FlashSalePublicService;
  let cacheManager: any;

  const createMockQueryBuilder = () => {
    const mockQB: any = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getParameters: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockReturnValue({}),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      cache: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          /* items */
        ],
        0,
      ]),
      getMany: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockReturnThis(),
      find: jest.fn(),
      getCount: jest.fn().mockResolvedValue(0),
      getQuery: jest.fn().mockReturnValue('SELECT 1'),
      clone: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      connection: {
        createQueryBuilder: jest.fn(),
      },
      expressionMap: {
        mainAlias: { target: Product },
      },
    };
    // clone should return a new QB with same methods
    mockQB.clone.mockImplementation(() => {
      const cloned = createMockQueryBuilder();
      cloned.getManyAndCount = mockQB.getManyAndCount;
      cloned.getMany = mockQB.getMany;
      cloned.getCount = mockQB.getCount;
      return cloned;
    });
    mockQB.connection.createQueryBuilder.mockReturnValue(mockQB);
    return mockQB;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductPublicService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
            findOne: jest.fn(),
            find: jest.fn(),
            addSelect: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductTranslation),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProductCategoryTranslation),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProductBrand),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProductBrandTranslation),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProductItem),
          useValue: {
            createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
          },
        },
        {
          provide: RequestContextService,
          useValue: {
            currentMerchantOnSlug: jest.fn(),
            currentLang: 'en',
          },
        },
        {
          provide: FlashSalePublicService,
          useValue: {
            getActiveFlashSale: jest.fn(),
            transformProducts: jest.fn(),
            transformProductPrice: jest.fn(),
            transformProduct: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductPublicService>(ProductPublicService);
    productRepo = module.get(getRepositoryToken(Product));
    productItemRepo = module.get(getRepositoryToken(ProductItem));
    contextService = module.get<RequestContextService>(RequestContextService);
    flashSalePublicService = module.get<FlashSalePublicService>(
      FlashSalePublicService,
    );
    cacheManager = module.get(CACHE_MANAGER);

    // Default merchant and active flash sale for all tests
    jest
      .spyOn(contextService, 'currentMerchantOnSlug')
      .mockResolvedValue({ id: 1 } as any);
    jest
      .spyOn(flashSalePublicService, 'getActiveFlashSale')
      .mockResolvedValue(null as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Set defaults for merchant and active flash sale for all tests

  describe('getAll', () => {
    const mockMerchant = { id: 1, name: 'Test Merchant' } as any;
    const mockFlashSale = { id: 1 } as any;
    const mockProducts = [
      { id: 1, name: 'Product 1', productItems: [{ price: 100 }] },
      { id: 2, name: 'Product 2', productItems: [{ price: 200 }] },
    ] as any;

    it('should return cached data if available', async () => {
      const cachedData = { items: mockProducts, meta: {} };
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue(mockMerchant);
      jest
        .spyOn(flashSalePublicService, 'getActiveFlashSale')
        .mockResolvedValue(mockFlashSale);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedData);

      const result = await service.getAll(
        { page: 1, limit: 10 },
        'true',
        '',
        [],
        [],
        [],
      );

      expect(result).toEqual(cachedData);
      expect(cacheManager.get).toHaveBeenCalled();
    });

    it('should rank by _rank when search provided', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: {},
      });

      await service.getAll(
        { page: 1, limit: 10 },
        'true',
        'search',
        [],
        [],
        [],
      );
      expect(qb.addSelect).toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('_rank');
    });

    it('should order by ASC without pagination', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue([]);
      productRepo.createQueryBuilder.mockReturnValue(qb);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: undefined,
      });

      await service.getAll(
        { page: 1, limit: 10 },
        'false',
        '',
        [],
        [],
        [],
        ProductOrderBy.ASC,
      );
      expect(qb.orderBy).toHaveBeenCalledWith('product.id', 'ASC');
    });

    it('should order by LASTED with pagination', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: {},
      });

      await service.getAll(
        { page: 1, limit: 10 },
        'true',
        '',
        [],
        [],
        [],
        ProductOrderBy.LASTED,
      );
      expect(qb.orderBy).toHaveBeenCalledWith('product.id', 'DESC');
    });

    it('should order by BEST_SELLER with pagination', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: {},
      });

      await service.getAll(
        { page: 1, limit: 10 },
        'true',
        '',
        [],
        [],
        [],
        ProductOrderBy.BEST_SELLER,
      );
      expect(qb.orderBy).toHaveBeenCalledWith('product.soldQuantity', 'DESC');
    });

    it('should fetch products when cache is empty', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({
        items: mockProducts,
        meta: {},
      });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: mockProducts,
        meta: {},
      });

      const result = await service.getAll(
        { page: 1, limit: 10 },
        'true',
        '',
        [],
        [],
        [],
      );

      expect(result).toEqual({ items: mockProducts, meta: {} });
      expect(productRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter by category ids', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb2 = createMockQueryBuilder();
      (paginate as jest.Mock).mockResolvedValue({
        items: mockProducts,
        meta: {},
      });
      qb2.connection.createQueryBuilder.mockReturnValue(qb2);
      productRepo.createQueryBuilder.mockReturnValue(qb2);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: mockProducts,
        meta: {},
      });

      await service.getAll({ page: 1, limit: 10 }, 'true', '', [1, 2], [], []);
      expect(qb2.andWhere).toHaveBeenCalled();
    });

    it('should apply search filter', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb3 = createMockQueryBuilder();
      (paginate as jest.Mock).mockResolvedValue({
        items: mockProducts,
        meta: {},
      });
      productRepo.createQueryBuilder.mockReturnValue(qb3);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: mockProducts,
        meta: {},
      });
      await service.getAll({ page: 1, limit: 10 }, 'true', 'test', [], [], []);
      expect(qb3.andWhere).toHaveBeenCalled();
    });

    it('should order by HIGH_PRICE_TO_LOW_PRICE without pagination', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue([]);
      productRepo.createQueryBuilder.mockReturnValue(qb);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: undefined,
      });

      const res = await service.getAll(
        { page: 1, limit: 10 },
        'false',
        '',
        [],
        [],
        [],
        ProductOrderBy.HIGH_PRICE_TO_LOW_PRICE,
      );
      expect(Array.isArray(res.items)).toBe(true);
      expect(qb.orderBy).toHaveBeenCalledWith(
        'product.maxFinalProductPrice',
        'DESC',
      );
    });

    it('should order by LOW_PRICE_TO_HIGH_PRICE without pagination', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue([]);
      productRepo.createQueryBuilder.mockReturnValue(qb);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: undefined,
      });

      const res = await service.getAll(
        { page: 1, limit: 10 },
        'false',
        '',
        [],
        [],
        [],
        ProductOrderBy.LOW_PRICE_TO_HIGH_PRICE,
      );
      expect(Array.isArray(res.items)).toBe(true);
      expect(qb.orderBy).toHaveBeenCalledWith(
        'product.minFinalProductPrice',
        'ASC',
      );
    });

    it('should add rank when search is whitespace (service uses raw search)', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: {},
      });

      await service.getAll({ page: 1, limit: 10 }, 'true', '   ', [], [], []);
      expect(qb.addSelect).toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('_rank');
    });

    it('should order by DEFAULT with pagination', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({
        items: [{ id: 9 }],
        meta: {},
      });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [{ id: 9 }],
        meta: {},
      });

      const res = await service.getAll(
        { page: 1, limit: 10 },
        'true',
        '',
        [],
        [],
        [],
        ProductOrderBy.DEFAULT,
      );
      expect(res).toEqual({ items: [{ id: 9 }], meta: {} });
      expect(qb.orderBy).toHaveBeenCalledWith('product.id', 'ASC');
    });

    it('should filter by brand and catalog ids', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [],
        meta: {},
      });

      await service.getAll({ page: 1, limit: 10 }, 'true', '', [], [5], [9]);
      expect(qb.andWhere).toHaveBeenCalledWith(
        'productBrand.id IN(:...productBrandIds)',
        { productBrandIds: [5] },
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        'productProductCatalog.id IN(:...productCatalogIds)',
        { productCatalogIds: [9] },
      );
    });
  });

  describe('getBestSeller', () => {
    it('returns cached when present', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue({ items: [1] });
      const res = await service.getBestSeller({ page: 1, limit: 5 }, 'true');
      expect(res).toEqual({ items: [1] });
    });

    it('fetches, paginates, transforms and caches', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({
        items: [{ id: 1 }],
        meta: {},
      });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [{ id: 1 }],
        meta: {},
      });

      const res = await service.getBestSeller({ page: 2, limit: 5 }, 'true');
      expect(paginate).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
      expect(res).toEqual({ items: [{ id: 1 }], meta: {} });
      // ensure query builder was used
      expect(qb.orderBy).toHaveBeenCalledWith('product.isPopular', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        'product.soldQuantity',
        'DESC',
      );
    });

    it('fetches without pagination and caches', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue([{ id: 10 }]);
      productRepo.createQueryBuilder.mockReturnValue(qb);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [{ id: 10 }],
        meta: undefined,
      });

      const res = await service.getBestSeller({ page: 1, limit: 5 }, 'false');
      expect(cacheManager.set).toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('product.isPopular', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        'product.soldQuantity',
        'DESC',
      );
      expect(res).toEqual({ items: [{ id: 10 }], meta: undefined });
    });
  });

  describe('getNew', () => {
    it('returns cached when present', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue({ items: [2] });
      const res = await service.getNew({ page: 1, limit: 5 }, 'true');
      expect(res).toEqual({ items: [2] });
    });

    it('fetches without pagination and caches', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue([{ id: 2 }]);
      productRepo.createQueryBuilder.mockReturnValue(qb);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [{ id: 2 }],
        meta: undefined,
      });

      const res = await service.getNew({ page: 1, limit: 5 }, 'false');
      expect(cacheManager.set).toHaveBeenCalled();
      expect(res).toEqual({ items: [{ id: 2 }], meta: undefined });
    });

    it('fetches with pagination and orders correctly', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({
        items: [{ id: 3 }],
        meta: {},
      });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [{ id: 3 }],
        meta: {},
      });

      const res = await service.getNew({ page: 1, limit: 5 }, 'true');
      expect(paginate).toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('product.isNew', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('product.createdAt', 'DESC');
      expect(res).toEqual({ items: [{ id: 3 }], meta: {} });
    });
  });

  describe('getDiscount', () => {
    it('returns cached when present', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue({ items: [3] });
      const res = await service.getDiscount({ page: 1, limit: 12 }, 'true');
      expect(res).toEqual({ items: [3] });
    });

    it('fetches, sorts by discount, transforms and caches', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue([
        {
          price: 100,
          productDiscount: { type: 'remain', unitType: 'bath', value: 80 },
        },
        {
          price: 100,
          productDiscount: { type: 'decrease', unitType: 'percent', value: 10 },
        },
      ]);
      productRepo.createQueryBuilder.mockReturnValue(qb);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [
          {
            price: 100,
            productDiscount: { type: 'remain', unitType: 'bath', value: 80 },
          },
          {
            price: 100,
            productDiscount: {
              type: 'decrease',
              unitType: 'percent',
              value: 10,
            },
          },
        ],
        meta: null,
      });

      const res = await service.getDiscount({ page: 1, limit: 12 }, 'false');
      expect(Array.isArray(res.items)).toBe(true);
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('getRecommend', () => {
    it('returns cached when present', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue({ items: [4] });
      const res = await service.getRecommend({ page: 1, limit: 5 }, 'true');
      expect(res).toEqual({ items: [4] });
    });

    it('fetches, paginates, transforms and caches', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      const qb = createMockQueryBuilder();
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (paginate as jest.Mock).mockResolvedValue({
        items: [{ id: 20 }],
        meta: {},
      });
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res.items);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [{ id: 20 }],
        meta: {},
      });

      const res = await service.getRecommend({ page: 1, limit: 5 }, 'true');
      expect(paginate).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
      expect(res).toEqual({ items: [{ id: 20 }], meta: {} });
      expect(qb.orderBy).toHaveBeenCalledWith('product.isRecommend', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        'product.soldQuantity',
        'DESC',
      );
    });

    it('fetches without pagination and caches', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue([{ id: 21 }]);
      productRepo.createQueryBuilder.mockReturnValue(qb);
      jest
        .spyOn(flashSalePublicService, 'transformProductPrice')
        .mockImplementation((_, res) => res);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue({
        items: [{ id: 21 }],
        meta: undefined,
      });

      const res = await service.getRecommend({ page: 1, limit: 5 }, 'false');
      expect(cacheManager.set).toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('product.isRecommend', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        'product.soldQuantity',
        'DESC',
      );
      expect(res).toEqual({ items: [{ id: 21 }], meta: undefined });
    });
  });

  describe('showBySlug', () => {
    it('returns cached when present', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue({ id: 999 });
      const res = await service.showBySlug('slug-1');
      expect(res).toEqual({ data: { id: 999 } });
    });

    it('fetches, translates, transforms, caches', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      productRepo.findOne.mockResolvedValue({ id: 5 });
      (getByIdWithTranslation as jest.Mock).mockResolvedValue({
        id: 5,
        name: 'X',
      });
      jest
        .spyOn(flashSalePublicService, 'transformProduct')
        .mockImplementation((_, p) => ({ ...p, x: true }));

      const res = await service.showBySlug('slug-2');
      expect(getByIdWithTranslation).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5 }),
      );
      expect(cacheManager.set).toHaveBeenCalled();
      expect(res).toEqual({ data: { id: 5, name: 'X', x: true } });
    });
  });

  describe('getRelationProduct', () => {
    it('returns cached when present', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue([{ id: 1 }]);
      const res = await service.getRelationProduct('slug');
      expect(res).toEqual([{ id: 1 }]);
    });

    it('onCategory branch', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      productRepo.findOne.mockResolvedValue({
        slug: 's',
        relationStatus: 'onCategory',
        productCategory: { id: 7 },
      });
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue([{ id: 1 }]);
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue([
        { id: 1 },
      ]);

      const res = await service.getRelationProduct('s');
      expect(getAllWithTranslationWithData).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
      expect(res).toEqual([{ id: 1 }]);
    });

    it('allCategory branch', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      productRepo.findOne.mockResolvedValue({
        slug: 's',
        relationStatus: 'allCategory',
      });
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue([{ id: 2 }]);
      productRepo.createQueryBuilder.mockReturnValue(qb);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue([
        { id: 2 },
      ]);
      const res = await service.getRelationProduct('s');
      expect(res).toEqual([{ id: 2 }]);
    });

    it('custom ids branch', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
      productRepo.findOne.mockResolvedValue({
        slug: 's',
        relationStatus: 'custom',
        valueCustomRelationStatus: ['1', '3'],
      });
      productRepo.find.mockResolvedValue([{ id: 1 }, { id: 3 }]);
      (getAllWithTranslationWithData as jest.Mock).mockResolvedValue([
        { id: 1 },
        { id: 3 },
      ]);
      const res = await service.getRelationProduct('s');
      expect(productRepo.find).toHaveBeenCalled();
      expect(res).toEqual([{ id: 1 }, { id: 3 }]);
    });
  });

  describe('compareProductDiscount', () => {
    it('returns 0 when discounts are equal (remain bath)', () => {
      const a = {
        price: 100,
        productDiscount: { type: 'remain', unitType: 'bath', value: 80 },
      } as any;
      const b = {
        price: 100,
        productDiscount: { type: 'remain', unitType: 'bath', value: 80 },
      } as any;
      expect(service.compareProductDiscount(a, b)).toBe(0);
    });

    it('handles decrease percent vs decrease bath', () => {
      const a = {
        price: 200,
        productDiscount: { type: 'decrease', unitType: 'percent', value: 10 },
      } as any;
      const b = {
        price: 200,
        productDiscount: { type: 'decrease', unitType: 'bath', value: 5 },
      } as any;
      // a has 20 discount vs b has 5, so a should be considered greater -> return 1
      expect(service.compareProductDiscount(a, b)).toBe(1);
    });

    it('handles remain percent vs decrease percent', () => {
      const a = {
        price: 100,
        productDiscount: { type: 'remain', unitType: 'percent', value: 90 },
      } as any; // pay 10
      const b = {
        price: 100,
        productDiscount: { type: 'decrease', unitType: 'percent', value: 5 },
      } as any; // discount 5
      // a effective discount = 90, b discount = 5 -> a/b comparison returns 1
      expect(service.compareProductDiscount(a, b)).toBe(1);
    });
  });
});
