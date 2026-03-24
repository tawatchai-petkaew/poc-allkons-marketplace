import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceProductCategoryController } from './marketplace-product-category.controller';
import { MarketplaceProductCategoryService } from './marketplace-product-category.service';

describe('MarketplaceProductCategoryController', () => {
  let controller: MarketplaceProductCategoryController;
  let service: MarketplaceProductCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceProductCategoryController],
      providers: [
        {
          provide: MarketplaceProductCategoryService,
          useValue: {
            getAll: jest.fn(),
            getByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MarketplaceProductCategoryController>(MarketplaceProductCategoryController);
    service = module.get<MarketplaceProductCategoryService>(MarketplaceProductCategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all categories', async () => {
      const mockResult = {
        data: [
          { id: '1', name: 'Category 1', subCategories: [] },
        ],
      };

      jest.spyOn(service, 'getAll').mockResolvedValue(mockResult as any);

      const result = await controller.getAll();

      expect(result).toEqual(mockResult);
      expect(service.getAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return categories by ids', async () => {
      const mockResult = [
        { id: '1', name: 'Category 1', order: 1, status: 'ACTIVE', path: null, imageUpload: null, skuId: 'SKU1', subCategories: [] },
      ];

      jest.spyOn(service, 'getByIds').mockResolvedValue(mockResult as any);

      const result = await controller.getById('1,2', 'flat');

      expect(result).toEqual(mockResult);
      expect(service.getByIds).toHaveBeenCalledWith([1, 2], 'flat');
    });
  });
});
