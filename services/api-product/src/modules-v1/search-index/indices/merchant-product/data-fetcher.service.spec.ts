import { Test, TestingModule } from '@nestjs/testing';
import { DataFetcherService } from './data-fetcher.service';
import { CacheService } from '../../core';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('DataFetcherService', () => {
  let service: DataFetcherService;
  let dataSource: any;
  let cacheService: any;

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    };

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataFetcherService,
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
        {
          provide: CacheService,
          useValue: cacheService,
        },
      ],
    }).compile();

    service = module.get<DataFetcherService>(DataFetcherService);
  });

  describe('fetchProductVariants', () => {
    it('should fetch data using Product.brandId and Product.categoryId', async () => {
      const ids = [1];
      const mockResult = [
        {
          id: 1,
          sku: 'SKU1',
          barcode: 'BAR1',
          description: 'Desc',
          variant_status: 'Active',
          variant_created_at: new Date(),
          variant_updated_at: new Date(),
          product_id: 101,
          product_name: 'Product 1',
          product_slug: 'prod-1',
          product_status: 'Active',
          min_price: 100,
          max_price: 200,
          brand_id: 5, // From Brand table
          brand_name: 'Brand Simple',
          category_id: 50, // From Category table
          category_name: 'Category Simple',
          parent_category_ids: [],
          selling_branch_count: 5,
          selling_branch_ids: [1, 2, 3],
          attributes: [],
          tag_ids: [],
          tag_names: [],
        },
      ];

      dataSource.query.mockResolvedValue(mockResult);

      const result = await service.fetchProductVariants(ids);

      // Verify Query Structure
      const query = dataSource.query.mock.calls[0][0];
      expect(query).toContain('LEFT JOIN brand b ON p."brandId" = b.id');
      expect(query).toContain('LEFT JOIN category c ON p."categoryId" = c.id');

      // Verify correct mapping
      expect(result).toHaveLength(1);
      expect(result[0].brandId).toBe(5);
      expect(result[0].brandName).toBe('Brand Simple');
      expect(result[0].categoryId).toBe(50);
      expect(result[0].categoryName).toBe('Category Simple');
    });
  });
});
