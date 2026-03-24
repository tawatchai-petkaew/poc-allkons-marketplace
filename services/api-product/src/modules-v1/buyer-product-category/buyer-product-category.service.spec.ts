import { Test, TestingModule } from '@nestjs/testing';
import { BuyerProductCategoryService } from './buyer-product-category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductCategory } from '../../model/product-category.entity';
import { RequestContextService } from '../../modules/request-context/request-context.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';

describe('BuyerProductCategoryService', () => {
  let service: BuyerProductCategoryService;
  let productCategoryRepo: Repository<ProductCategory>;
  let contextService: RequestContextService;
  let cacheManager: any;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuyerProductCategoryService,
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
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
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BuyerProductCategoryService>(
      BuyerProductCategoryService,
    );
    productCategoryRepo = module.get<Repository<ProductCategory>>(
      getRepositoryToken(ProductCategory),
    );
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
    const mockCategories = [
      {
        id: '1',
        order: 1,
        status: 'ACTIVE',
        path: null,
        skuId: 'SKU1',
        productCategoryTranslations: [{ name: 'Category 1' }],
        imageUpload: { id: 1 },
      },
      {
        id: '2',
        order: 2,
        status: 'ACTIVE',
        path: '1',
        skuId: 'SKU2',
        productCategoryTranslations: [{ name: 'Category 2' }],
        imageUpload: { id: 2 },
      },
    ] as any;

    it('should return cached categories if available', async () => {
      const cachedData = [{ id: '1', name: 'Cached Category' }];
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue(mockMerchant);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedData);

      const result = await service.getAll();

      expect(result.data).toEqual(cachedData);
      expect(cacheManager.get).toHaveBeenCalledWith('categories:1');
      expect(productCategoryRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should fetch and build category tree when cache is empty', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue(mockMerchant);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      mockQueryBuilder.getMany.mockResolvedValue(mockCategories);

      const result = await service.getAll();

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].subCategories.length).toBe(1);
      expect(result.data[0].subCategories[0].id).toBe('2');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'categories:1',
        expect.any(Array),
        60000,
      );
    });

    it('should return empty array when no categories found', async () => {
      jest
        .spyOn(contextService, 'currentMerchantOnSlug')
        .mockResolvedValue(mockMerchant);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result.data).toEqual([]);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });
});
