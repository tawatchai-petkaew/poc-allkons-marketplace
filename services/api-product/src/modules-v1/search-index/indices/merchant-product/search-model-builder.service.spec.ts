import { Test, TestingModule } from '@nestjs/testing';
import { SearchModelBuilderService } from './search-model-builder.service';
import { DataFetcherService } from './data-fetcher.service';
import { ProductVariantSearchData } from '../../interfaces';

describe('SearchModelBuilderService', () => {
  let service: SearchModelBuilderService;

  beforeEach(async () => {
    const dataFetcherServiceMock = {
      ensureCategoryHierarchy: jest.fn(),
      buildCategoryPath: jest.fn().mockReturnValue('Electronics > Laptops'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchModelBuilderService,
        {
          provide: DataFetcherService,
          useValue: dataFetcherServiceMock,
        },
      ],
    }).compile();

    service = module.get<SearchModelBuilderService>(SearchModelBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildDocument', () => {
    const mockPv: ProductVariantSearchData = {
      id: 1,
      productId: 101,
      productVariantAlias: 'Test Variant Alias',
      productName: 'Test Product',
      productSlug: 'test-product',
      barcode: '123456789',
      sku: 'SKU-001',
      productStatus: 'Active',
      variantStatus: 'Active',
      minPrice: 100,
      maxPrice: 200,
      categoryId: 11,
      categoryName: 'Laptops',
      brandId: 1,
      brandName: 'Apple',
      sellingMerchantCount: 5,
      merchantIds: [1, 2],
      variantCreatedAt: new Date(),
      variantUpdatedAt: new Date(),
    };

    it('should build a valid search document', async () => {
      const doc = await service.buildDocument(mockPv);

      expect(doc).toBeDefined();
      expect(doc.id).toBe(1);
      expect(doc.name).toBe('Test Variant Alias');
      expect(doc.productName).toBe('Test Product');
      expect(doc.productVariantName).toBe('Test Variant Alias');
      expect(doc.boostScore).toBeGreaterThan(0);
    });

    it('should use productName when alias is null', async () => {
      const pv = { ...mockPv, productVariantAlias: null };
      const doc = await service.buildDocument(pv);

      expect(doc.name).toBe('Test Product');
      expect(doc.productVariantName).toBeNull();
    });

    it('should calculate boost score correctly', async () => {
      const pvHigh = { ...mockPv, sellingMerchantCount: 100 };
      const pvLow = { ...mockPv, sellingMerchantCount: 1 };

      const docHigh = await service.buildDocument(pvHigh);
      const docLow = await service.buildDocument(pvLow);

      expect(docHigh.boostScore).toBeGreaterThan(docLow.boostScore);
    });

    it('should set isActive based on product and variant status', async () => {
      const activeDoc = await service.buildDocument(mockPv);
      expect(activeDoc.isActive).toBe(true);

      const inactivePv = { ...mockPv, productStatus: 'Inactive' };
      const inactiveDoc = await service.buildDocument(inactivePv);
      expect(inactiveDoc.isActive).toBe(false);
    });
  });
});
