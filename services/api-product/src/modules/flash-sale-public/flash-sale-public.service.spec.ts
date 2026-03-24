import { Test, TestingModule } from '@nestjs/testing';
import { FlashSalePublicService } from './flash-sale-public.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FlashSale } from '../../model/flash-sale.entity';
import { Product } from '../../model/product.entity';
import { ProductTranslation } from '../../model/product-translation.entity';
import { RequestContextService } from '../request-context/request-context.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { paginate } from 'nestjs-typeorm-paginate';
import { getByIdWithTranslation } from '../../utils';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

jest.mock('../../utils', () => ({
  getByIdWithTranslation: jest.fn(),
}));

describe('FlashSalePublicService', () => {
  let service: FlashSalePublicService;
  let flashSaleRepo: any;
  let contextService: RequestContextService;
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
      getCount: jest.fn().mockResolvedValue(0),
      getQuery: jest.fn().mockReturnValue('SELECT 1'),
      clone: jest.fn().mockReturnThis(),
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
        FlashSalePublicService,
        {
          provide: getRepositoryToken(FlashSale),
          useValue: {
            createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(ProductTranslation),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: RequestContextService,
          useValue: {
            currentMerchantOnSlug: jest.fn(),
            currentLang: 'en',
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

    service = module.get<FlashSalePublicService>(FlashSalePublicService);
    flashSaleRepo = module.get(getRepositoryToken(FlashSale));
    contextService = module.get<RequestContextService>(RequestContextService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    const mockMerchant = { id: 1, name: 'Test Merchant' } as any;
    const mockFlashSales = [
      {
        id: 1,
        name: 'Flash Sale 1',
        productFlashSales: [
          {
            product: {
              id: 1,
              productTranslations: [{ name: 'Product 1' }],
            },
          },
        ],
      },
    ] as any;

    it('should return flash sales with pagination', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue(mockMerchant);
      const qb = createMockQueryBuilder();
      qb.connection.createQueryBuilder.mockReturnValue(qb);
      flashSaleRepo.createQueryBuilder.mockReturnValue(qb);

      (paginate as jest.Mock).mockResolvedValue({
        items: mockFlashSales,
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      });

      const result = await service.getAll({ page: 1, limit: 10 }, 'true');

      expect(result).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(paginate as jest.Mock).toHaveBeenCalled();
    });

    it('should return all flash sales without pagination', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue(mockMerchant);
      const qb = createMockQueryBuilder();
      qb.getMany.mockResolvedValue(mockFlashSales);
      qb.connection.createQueryBuilder.mockReturnValue(qb);
      flashSaleRepo.createQueryBuilder.mockReturnValue(qb);
      const result = await service.getAll({ page: 1, limit: 10 }, 'false');

      expect(result).toBeDefined();
    });

    it('should filter by name', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue(mockMerchant);
      const qb2 = createMockQueryBuilder();
      qb2.getMany.mockResolvedValue(mockFlashSales);
      flashSaleRepo.createQueryBuilder.mockReturnValue(qb2);

      await service.getAll({ page: 1, limit: 10 }, 'false', 'Sale');

      expect(qb2.andWhere).toHaveBeenCalled();
    });
  });

  describe('getActiveFlashSale', () => {
    it('should return active flash sale', async () => {
      const mockMerchant = { id: 1 } as any;
      const mockFlashSale = { id: 1, status: 'ACTIVE' } as any;

      jest.spyOn(flashSaleRepo, 'findOne').mockResolvedValue(mockFlashSale);

      const result = await service.getActiveFlashSale(mockMerchant);

      expect(result).toEqual(mockFlashSale);
      expect(flashSaleRepo.findOne).toHaveBeenCalled();
    });

    it('should return null when no active flash sale', async () => {
      const mockMerchant = { id: 1 } as any;

      jest.spyOn(flashSaleRepo, 'findOne').mockResolvedValue(null);

      const result = await service.getActiveFlashSale(mockMerchant);

      expect(result).toBeNull();
    });
  });

  describe('showById', () => {
    it('should return a flash sale by id with translated products', async () => {
      const mockMerchant = { id: 2 } as any;
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue(mockMerchant);

      const flashSale = {
        id: 10,
        name: 'FS',
        productFlashSales: [
          {
            product: { id: 101, productTranslations: [] },
            productFlashSaleItems: [],
          },
        ],
        merchant: mockMerchant,
      } as any;

      jest.spyOn(flashSaleRepo, 'findOne').mockResolvedValue(flashSale);
      (getByIdWithTranslation as jest.Mock).mockResolvedValue({
        id: 101,
        translated: true,
      });

      const res = await service.showById(10);
      expect(res.data).toBeDefined();
      expect(getByIdWithTranslation).toHaveBeenCalledWith(
        expect.objectContaining({ id: 101 }),
      );
    });
  });

  describe('activeFlashSale', () => {
    it('should return cached data when cache hit', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue({ id: 99 } as any);
      cacheManager.get.mockResolvedValue({ cached: true });

      const res = await service.activeFlashSale('yes');
      expect(res).toEqual({ data: { cached: true } });
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should cache and return null when there is no active flash sale', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue({ id: 5 } as any);
      cacheManager.get.mockResolvedValue(undefined);
      jest.spyOn(flashSaleRepo, 'findOne').mockResolvedValue(null);

      const res = await service.activeFlashSale('no');
      expect(res).toEqual({ data: null });
      expect(cacheManager.set).toHaveBeenCalledWith(
        'flashSale:5',
        'null',
        expect.any(Number),
      );
    });

    it('should return active flash sale with fsPage = no (raw productFlashSales)', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue({ id: 7 } as any);
      cacheManager.get.mockResolvedValue(undefined);

      const flashSale = {
        id: 1,
        merchant: { id: 7 },
        productFlashSales: [
          {
            product: { id: 1, productImages: [], productItems: [] },
            productFlashSaleItems: [],
          },
        ],
      } as any;

      (getByIdWithTranslation as jest.Mock).mockImplementation(
        async ({ parent }) => parent,
      );
      jest.spyOn(flashSaleRepo, 'findOne').mockResolvedValue(flashSale);

      const res = await service.activeFlashSale('no');
      expect(res.data).toBeDefined();
      expect(res.data.productFlashSales.length).toBe(1);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'flashSale:7',
        expect.any(Object),
        expect.any(Number),
      );
    });

    it('should compute custom product data and sold quantities when fsPage = yes', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue({ id: 8 } as any);
      cacheManager.get.mockResolvedValue(undefined);

      const product = {
        id: 1,
        piecePerBigUnit: 12,
        productItems: [
          {
            id: 1001,
            price: 50,
            bigUnitPrice: 500,
            productDiscount: {
              id: 1,
              unitType: 'percent',
              type: 'discount',
              value: 10,
            },
            productBigUnitDiscount: {
              id: 2,
              unitType: 'percent',
              type: 'discount',
              value: 5,
            },
          },
        ],
      } as any;

      const flashSale = {
        id: 2,
        merchant: { id: 8 },
        productFlashSales: [
          {
            product,
            productFlashSaleItems: [
              {
                productItem: { id: 1001 },
                price: 45,
                bigUnitPrice: 480,
                soldQuantity: 3,
                bigUnitSoldQuantity: 2,
              },
            ],
          },
        ],
      } as any;

      (getByIdWithTranslation as jest.Mock).mockImplementation(
        async ({ parent }) => parent,
      );
      jest.spyOn(flashSaleRepo, 'findOne').mockResolvedValue(flashSale);

      const res = await service.activeFlashSale('yes');
      const item = res.data.productFlashSales[0].product.productItems[0];
      // price overrides
      expect(item.productDiscount).toEqual(
        expect.objectContaining({
          unitType: 'bath',
          type: 'remain',
          value: 45,
        }),
      );
      expect(item.productBigUnitDiscount).toEqual(
        expect.objectContaining({
          unitType: 'bath',
          type: 'remain',
          value: 480,
        }),
      );
      // flags set when bigUnitPrice exists
      expect(item.flashSaleSmallUnit).toBe('yes');
      expect(item.flashSaleBigUnit).toBe('yes');
      // sold quantity = 3 + 2 * 12 = 27
      expect(res.data.productFlashSales[0].soldQuantity).toBe(27);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'flashSale:8',
        expect.any(Object),
        expect.any(Number),
      );
    });

    it('should handle fsPage = yes with only bigUnitPrice present', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue({ id: 18 } as any);
      cacheManager.get.mockResolvedValue(undefined);

      const product = {
        id: 2,
        piecePerBigUnit: 6,
        productItems: [
          {
            id: 2001,
            // price undefined on item to test branch
            bigUnitPrice: 600,
          },
        ],
      } as any;

      const flashSale = {
        id: 3,
        merchant: { id: 18 },
        productFlashSales: [
          {
            product,
            productFlashSaleItems: [
              {
                productItem: { id: 2001 },
                // price missing, but bigUnitPrice present
                bigUnitPrice: 590,
                soldQuantity: 0,
                bigUnitSoldQuantity: 1,
              },
            ],
          },
        ],
      } as any;

      (getByIdWithTranslation as jest.Mock).mockImplementation(
        async ({ parent }) => parent,
      );
      jest.spyOn(flashSaleRepo, 'findOne').mockResolvedValue(flashSale);

      const res = await service.activeFlashSale('yes');
      const item = res.data.productFlashSales[0].product.productItems[0];
      expect(item.productBigUnitDiscount).toEqual(
        expect.objectContaining({
          unitType: 'bath',
          type: 'remain',
          value: 590,
        }),
      );
      expect(item.flashSaleSmallUnit).toBe('no');
      expect(item.flashSaleBigUnit).toBe('yes');
    });

    it('should handle fsPage = yes with only small-unit price present', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue({ id: 28 } as any);
      cacheManager.get.mockResolvedValue(undefined);

      const product = {
        id: 3,
        piecePerBigUnit: 10,
        productItems: [
          {
            id: 3001,
            price: 20,
            // no bigUnitPrice on base item
          },
        ],
      } as any;

      const flashSale = {
        id: 4,
        merchant: { id: 28 },
        productFlashSales: [
          {
            product,
            productFlashSaleItems: [
              {
                productItem: { id: 3001 },
                price: 18,
                // no bigUnitPrice in flash
                soldQuantity: 2,
                bigUnitSoldQuantity: 0,
              },
            ],
          },
        ],
      } as any;

      (getByIdWithTranslation as jest.Mock).mockImplementation(
        async ({ parent }) => parent,
      );
      jest.spyOn(flashSaleRepo, 'findOne').mockResolvedValue(flashSale);

      const res = await service.activeFlashSale('yes');
      const item = res.data.productFlashSales[0].product.productItems[0];
      expect(item.productDiscount).toEqual(
        expect.objectContaining({
          unitType: 'bath',
          type: 'remain',
          value: 18,
        }),
      );
      expect(item.productBigUnitDiscount).toBeUndefined();
      expect(item.flashSaleSmallUnit).toBe('yes');
      expect(item.flashSaleBigUnit).toBe('no');
    });

    it('should keep item unchanged when no matching flash sale item', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue({ id: 38 } as any);
      cacheManager.get.mockResolvedValue(undefined);

      const product = {
        id: 4,
        productItems: [
          {
            id: 4001,
            price: 100,
            productDiscount: {
              id: 1,
              unitType: 'percent',
              type: 'discount',
              value: 100,
            },
          },
        ],
      } as any;

      const flashSale = {
        id: 5,
        merchant: { id: 38 },
        productFlashSales: [
          {
            product,
            productFlashSaleItems: [
              {
                productItem: { id: 9999 }, // no match
                price: 90,
              },
            ],
          },
        ],
      } as any;

      (getByIdWithTranslation as jest.Mock).mockImplementation(
        async ({ parent }) => parent,
      );
      jest.spyOn(flashSaleRepo, 'findOne').mockResolvedValue(flashSale);

      const res = await service.activeFlashSale('yes');
      const item = res.data.productFlashSales[0].product.productItems[0];
      expect(item.productDiscount?.value).toBe(100); // unchanged
      expect(item.flashSaleSmallUnit).toBeUndefined();
      expect(item.flashSaleBigUnit).toBeUndefined();
    });
  });

  describe('transformProductPrice', () => {
    it('should return original list when no active flash sale', () => {
      const products = [{ id: 1 } as any, { id: 2 } as any];
      const result = service.transformProductPrice(null, products);
      expect(result).toEqual(products);

      const paged = { items: products } as any;
      const result2 = service.transformProductPrice(null, paged);
      expect(result2).toEqual(products);
    });

    it('should map each product through transformProduct when active flash sale exists', () => {
      const spy = jest
        .spyOn(service, 'transformProduct')
        .mockImplementation((_, p: any) => ({ ...p, t: true }));
      const products = [{ id: 1 } as any, { id: 2 } as any];
      const mapped = service.transformProductPrice({} as any, products);
      expect(mapped).toEqual([
        { id: 1, t: true },
        { id: 2, t: true },
      ]);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should map paginated items when active flash sale exists', () => {
      const spy = jest
        .spyOn(service, 'transformProduct')
        .mockImplementation((_, p: any) => ({ ...p, z: true }));
      const paged = { items: [{ id: 3 } as any, { id: 4 } as any] } as any;
      const mapped = service.transformProductPrice({} as any, paged);
      expect(mapped).toEqual([
        { id: 3, z: true },
        { id: 4, z: true },
      ]);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('transformProduct', () => {
    it('should return same product when not in active flash sale', () => {
      const res = service.transformProduct(
        { productFlashSales: [] } as any,
        { id: 1 } as any,
      );
      expect(res).toEqual({ id: 1 });
    });

    it('should override discounts when product is in active flash sale', () => {
      const product = {
        id: 1,
        productItems: [
          {
            id: 100,
            price: 10,
            bigUnitPrice: 100,
          },
        ],
      } as any;

      const active = {
        productFlashSales: [
          {
            product: { id: 1 },
            productFlashSaleItems: [
              { productItem: { id: 100 }, price: 9, bigUnitPrice: 90 },
            ],
          },
        ],
      } as any;

      const res = service.transformProduct(active, product);
      expect((res as any).productItems[0].productDiscount).toEqual(
        expect.objectContaining({ unitType: 'bath', type: 'remain', value: 9 }),
      );
      expect((res as any).productItems[0].productBigUnitDiscount).toEqual(
        expect.objectContaining({
          unitType: 'bath',
          type: 'remain',
          value: 90,
        }),
      );
      expect((res as any).productItems[0].flashSaleSmallUnit).toBe('yes');
      expect((res as any).productItems[0].flashSaleBigUnit).toBe('yes');
    });

    it('should create default discount and keep big unit undefined when only small-unit price exists', () => {
      const product = {
        id: 2,
        productItems: [
          {
            id: 201,
            price: 30,
            // no productDiscount on base
            // no bigUnitPrice on base
          },
        ],
      } as any;

      const active = {
        productFlashSales: [
          {
            product: { id: 2 },
            productFlashSaleItems: [{ productItem: { id: 201 }, price: 25 }],
          },
        ],
      } as any;

      const res = service.transformProduct(active, product) as any;
      expect(res.productItems[0].productDiscount).toEqual(
        expect.objectContaining({
          id: 999,
          unitType: 'bath',
          type: 'remain',
          value: 25,
        }),
      );
      expect(res.productItems[0].productBigUnitDiscount).toBeUndefined();
    });
  });
});
