import { Test, TestingModule } from '@nestjs/testing';
import { ProductCatalogPublicService } from './product-catalog-public.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ProductCatalog,
  ProductCatalogStatus,
  ProductCatalogMainStatus,
} from '../../model/product-catalog.entity';
import { Product } from '../../model/product.entity';
import { ProductTranslation } from '../../model/product-translation.entity';
import { RequestContextService } from '../request-context/request-context.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ProductCatalogDto } from './dto/product-catalog.dto';
import { ProductOrderBy } from './enum/product.enum';

describe('ProductCatalogPublicService', () => {
  let service: ProductCatalogPublicService;
  let productCatalogRepo: any;
  let productRepo: any;
  let productTranslateRepo: any;
  let contextService: any;
  let cacheManager: any;

  const mockMerchant = { id: 1, slug: 'test-merchant' };
  const mockProductCatalog = {
    id: 1,
    name: 'Test Catalog',
    status: ProductCatalogStatus.ACTIVE,
    mainStatus: ProductCatalogMainStatus.SECONDARY,
    merchant: mockMerchant,
  } as ProductCatalog;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    merchant: mockMerchant,
  } as Product;

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
      getMany: jest.fn(),
      getOne: jest.fn(),
      getCount: jest.fn().mockResolvedValue(0),
      getQuery: jest.fn().mockReturnValue('SELECT 1'),
      clone: jest.fn(),
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
    const mockProductCatalogRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockProductRepo = {
      createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
      addSelect: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
    };

    const mockProductTranslateRepo = {
      find: jest.fn(),
      findOne: jest.fn().mockReturnThis(),
    };

    const mockContextService = {
      currentMerchantOnSlug: jest.fn(),
      currentLang: 'en',
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCatalogPublicService,
        {
          provide: getRepositoryToken(ProductCatalog),
          useValue: mockProductCatalogRepo,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
        },
        {
          provide: getRepositoryToken(ProductTranslation),
          useValue: mockProductTranslateRepo,
        },
        {
          provide: RequestContextService,
          useValue: mockContextService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ProductCatalogPublicService>(
      ProductCatalogPublicService,
    );
    productCatalogRepo = module.get(getRepositoryToken(ProductCatalog));
    productRepo = module.get(getRepositoryToken(Product));
    productTranslateRepo = module.get(getRepositoryToken(ProductTranslation));
    contextService = module.get(RequestContextService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return cached data if available', async () => {
      const cachedData = { data: [mockProductCatalog], meta: {} };
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      cacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getAll({ page: 1, limit: 10 });

      expect(cacheManager.get).toHaveBeenCalledWith('catalogs:1');
      expect(result).toEqual(cachedData);
      expect(productCatalogRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should fetch and cache data when not cached with pagination', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      cacheManager.get.mockResolvedValue(null);

      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockProductCatalog]);
      productCatalogRepo.createQueryBuilder.mockReturnValue(mockQB);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(mockProductCatalog as any);

      const result = await service.getAll({ page: 1, limit: 10 }, 'true');

      expect(mockQB.where).toHaveBeenCalledWith('merchant.id = :merchantId', {
        merchantId: 1,
      });
      expect(mockQB.andWhere).toHaveBeenCalledWith(
        'productCatalog.status = :status',
        {
          status: ProductCatalogStatus.ACTIVE,
        },
      );
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result.data).toBeDefined();
    });

    it('should filter by name when provided', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      cacheManager.get.mockResolvedValue(null);

      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockProductCatalog]);
      productCatalogRepo.createQueryBuilder.mockReturnValue(mockQB);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(mockProductCatalog as any);

      await service.getAll({ page: 1, limit: 10 }, 'true', 'Test');

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        'productCatalog.name like :name',
        {
          name: '%Test%',
        },
      );
    });

    it('should return data without pagination when withPagination is false', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      cacheManager.get.mockResolvedValue(null);

      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockProductCatalog]);
      productCatalogRepo.createQueryBuilder.mockReturnValue(mockQB);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(mockProductCatalog as any);

      const result = await service.getAll({ page: 1, limit: 10 }, 'false');

      expect(result.data).toBeDefined();
      expect(mockQB.getMany).toHaveBeenCalled();
    });
  });

  describe('showById', () => {
    it('should return catalog with products', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      productCatalogRepo.findOne.mockResolvedValue(mockProductCatalog);

      const mockProductQB = createMockQueryBuilder();
      mockProductQB.getMany.mockResolvedValue([mockProduct]);
      productRepo.createQueryBuilder.mockReturnValue(mockProductQB);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(mockProductCatalog as any);

      const result = await service.showById(1, { page: 1, limit: 10 });

      expect(productCatalogRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, merchant: mockMerchant },
        relations: ['merchant'],
      });
      expect(result.data.productCatalogData).toBeDefined();
      expect(result.data.productData).toBeDefined();
    });

    it('should order products by latest when orderBy is LASTED', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      productCatalogRepo.findOne.mockResolvedValue(mockProductCatalog);

      const mockProductQB = createMockQueryBuilder();
      mockProductQB.getMany.mockResolvedValue([mockProduct]);
      productRepo.createQueryBuilder.mockReturnValue(mockProductQB);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(mockProductCatalog as any);

      await service.showById(
        1,
        { page: 1, limit: 10 },
        'true',
        '',
        ProductOrderBy.LASTED,
      );

      expect(mockProductQB.orderBy).toHaveBeenCalledWith('product.id', 'DESC');
    });

    it('should order products by best seller', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      productCatalogRepo.findOne.mockResolvedValue(mockProductCatalog);

      const mockProductQB = createMockQueryBuilder();
      mockProductQB.getMany.mockResolvedValue([mockProduct]);
      productRepo.createQueryBuilder.mockReturnValue(mockProductQB);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(mockProductCatalog as any);

      await service.showById(
        1,
        { page: 1, limit: 10 },
        'true',
        '',
        ProductOrderBy.BEST_SELLER,
      );

      expect(mockProductQB.orderBy).toHaveBeenCalledWith(
        'product.soldQuantity',
        'DESC',
      );
    });

    it('should order products by low to high price', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      productCatalogRepo.findOne.mockResolvedValue(mockProductCatalog);

      const mockProductQB = createMockQueryBuilder();
      mockProductQB.getMany.mockResolvedValue([mockProduct]);
      productRepo.createQueryBuilder.mockReturnValue(mockProductQB);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(mockProductCatalog as any);

      await service.showById(
        1,
        { page: 1, limit: 10 },
        'true',
        '',
        ProductOrderBy.LOW_PRICE_TO_HIGH_PRICE,
      );

      expect(mockProductQB.orderBy).toHaveBeenCalledWith(
        'product.minFinalProductPrice',
        'ASC',
      );
    });

    it('should order products by high to low price', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      productCatalogRepo.findOne.mockResolvedValue(mockProductCatalog);

      const mockProductQB = createMockQueryBuilder();
      mockProductQB.getMany.mockResolvedValue([mockProduct]);
      productRepo.createQueryBuilder.mockReturnValue(mockProductQB);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(mockProductCatalog as any);

      await service.showById(
        1,
        { page: 1, limit: 10 },
        'true',
        '',
        ProductOrderBy.HIGH_PRICE_TO_LOW_PRICE,
      );

      expect(mockProductQB.orderBy).toHaveBeenCalledWith(
        'product.maxFinalProductPrice',
        'DESC',
      );
    });

    it('should handle search ordering with ranking', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      productCatalogRepo.findOne.mockResolvedValue(mockProductCatalog);

      const mockProductQB = createMockQueryBuilder();
      // Ensure addSelect is available for ranking
      mockProductQB.addSelect = jest.fn().mockReturnThis();
      mockProductQB.getMany.mockResolvedValue([mockProduct]);
      productRepo.createQueryBuilder.mockReturnValue(mockProductQB);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(mockProductCatalog as any);

      await service.showById(1, { page: 1, limit: 10 }, 'true', 'search term');

      expect(mockProductQB.addSelect).toHaveBeenCalled();
      expect(mockProductQB.orderBy).toHaveBeenCalledWith('_rank');
    });
  });

  describe('primaryProductCatalog', () => {
    it('should return primary product catalog', async () => {
      const primaryCatalog = {
        ...mockProductCatalog,
        mainStatus: ProductCatalogMainStatus.PRIMARY,
      };
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      productCatalogRepo.findOne.mockResolvedValue(primaryCatalog);
      jest
        .spyOn(ProductCatalogDto, 'fromEntity')
        .mockReturnValue(primaryCatalog as any);

      const result = await service.primaryProductCatalog();

      expect(productCatalogRepo.findOne).toHaveBeenCalledWith({
        where: {
          mainStatus: ProductCatalogMainStatus.PRIMARY,
          merchant: mockMerchant,
        },
        relations: ['merchant', 'imageUpload'],
      });
      expect(result.data).toBeDefined();
    });

    it('should return null when no primary catalog exists', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      productCatalogRepo.findOne.mockResolvedValue(null);

      const result = await service.primaryProductCatalog();

      expect(result.data).toBeNull();
    });
  });
});
