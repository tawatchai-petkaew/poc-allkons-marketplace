import { Test, TestingModule } from '@nestjs/testing';
import { BuyerProductCategoryController } from './buyer-product-category.controller';
import { BuyerProductCategoryService } from './buyer-product-category.service';

describe('BuyerProductCategoryController', () => {
  let controller: BuyerProductCategoryController;
  let service: BuyerProductCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuyerProductCategoryController],
      providers: [
        {
          provide: BuyerProductCategoryService,
          useValue: {
            getAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BuyerProductCategoryController>(BuyerProductCategoryController);
    service = module.get<BuyerProductCategoryService>(BuyerProductCategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all categories from service', async () => {
      const mockResult = {
        data: [
          { id: '1', name: 'Category 1', order: 1, status: 'ACTIVE' as any, path: null, imageUpload: null, skuId: 'SKU1', subCategories: [] },
          { id: '2', name: 'Category 2', order: 2, status: 'ACTIVE' as any, path: null, imageUpload: null, skuId: 'SKU2', subCategories: [] },
        ],
      };

      jest.spyOn(service, 'getAll').mockResolvedValue(mockResult as any);

      const result = await controller.getAll();

      expect(result).toEqual(mockResult);
      expect(service.getAll).toHaveBeenCalledTimes(1);
    });
  });
});
