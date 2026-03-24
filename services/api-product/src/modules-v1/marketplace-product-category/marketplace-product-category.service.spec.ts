import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceProductCategoryService } from './marketplace-product-category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductCategory, ProductCategoryStatus } from '@/model/product-category.entity';
import { HttpException } from '@nestjs/common';

describe('MarketplaceProductCategoryService', () => {
  let service: MarketplaceProductCategoryService;
  let productCategoryRepo: any;

  const mockCategory = {
    id: 1,
    name: 'Electronics',
    order: 1,
    status: ProductCategoryStatus.ACTIVE,
    path: null,
    skuId: 'ELEC',
    productCategoryTranslations: [{ name: 'Electronics' }],
    imageUpload: { id: 1, url: 'https://example.com/image.jpg' },
  } as unknown as ProductCategory;

  const mockSubCategory = {
    id: 2,
    name: 'Phones',
    order: 1,
    status: ProductCategoryStatus.ACTIVE,
    path: '1',
    skuId: 'PHONE',
    productCategoryTranslations: [{ name: 'Phones' }],
    imageUpload: { id: 2, url: 'https://example.com/phone.jpg' },
  } as unknown as ProductCategory;

  const createMockQueryBuilder = () => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  });

  beforeEach(async () => {
    const mockRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceProductCategoryService,
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MarketplaceProductCategoryService>(MarketplaceProductCategoryService);
    productCategoryRepo = module.get(getRepositoryToken(ProductCategory));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all categories in tree structure', async () => {
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockCategory, mockSubCategory]);
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getAll();

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(mockQB.andWhere).toHaveBeenCalledWith('productCategory.status = :status', {
        status: ProductCategoryStatus.ACTIVE,
      });
      expect(mockQB.limit).toHaveBeenCalledWith(30);
    });

    it('should return empty array when no categories found', async () => {
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([]);
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getAll();

      expect(result.data).toEqual([]);
    });

    it('should handle errors and throw HttpException', async () => {
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockRejectedValue(new Error('Database error'));
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      await expect(service.getAll()).rejects.toThrow(HttpException);
    });

    it('should build category tree with parent and children', async () => {
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockCategory, mockSubCategory]);
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getAll();

      expect(result.data).toBeDefined();
      const parentCategory = result.data.find((cat) => cat.id === 1);
      expect(parentCategory).toBeDefined();
      if (parentCategory) {
        expect(parentCategory.subCategories).toBeDefined();
      }
    });

    it('should sort categories by order', async () => {
      const category1 = { ...mockCategory, order: 2 };
      const category2 = { ...mockCategory, id: 3, order: 1 };
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([category1, category2]);
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getAll();

      expect(result.data[0].order).toBeLessThanOrEqual(result.data[1]?.order || Infinity);
    });
  });

  describe('getByIds', () => {
    it('should return categories by ids in flat format', async () => {
      const ids = [1, 2];
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockCategory, mockSubCategory]);
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getByIds(ids, 'flat');

      expect(mockQB.andWhere).toHaveBeenCalledWith('productCategory.id IN (:...ids)', { ids });
      expect(mockQB.andWhere).toHaveBeenCalledWith('productCategory.status = :status', {
        status: ProductCategoryStatus.ACTIVE,
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return categories by ids in nested format', async () => {
      const ids = [1, 2];
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockCategory, mockSubCategory]);
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getByIds(ids, 'nested');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should default to flat format when responseType not specified', async () => {
      const ids = [1];
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockCategory]);
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getByIds(ids);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty ids array', async () => {
      const ids: number[] = [];
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([]);
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getByIds(ids);

      expect(result).toEqual([]);
    });

    it('should build nested tree with multiple levels', async () => {
      const deepSubCategory = {
        ...mockSubCategory,
        id: 3,
        path: '1.2',
        productCategoryTranslations: [{ name: 'Smartphones' }],
      };
      const ids = [1, 2, 3];
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockCategory, mockSubCategory, deepSubCategory]);
      productCategoryRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getByIds(ids, 'nested');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
