import { Test, TestingModule } from '@nestjs/testing';
import { MerchantCategoryController } from './merchant-category.controller';
import { MerchantCategoryService } from './merchant-category.service';
import { CreateMerchantCategoryDto } from './dto/create-merchant-category.dto';
import { UpdateMerchantCategoryDto } from './dto/update-merchant-category.dto';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

describe('MerchantCategoryController', () => {
  let controller: MerchantCategoryController;
  let service: MerchantCategoryService;

  const mockService = {
    create: jest.fn(),
    showAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantCategoryController],
      providers: [
        {
          provide: MerchantCategoryService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MerchantCategoryController>(
      MerchantCategoryController,
    );
    service = module.get<MerchantCategoryService>(MerchantCategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a merchant category', async () => {
      const dto: CreateMerchantCategoryDto = {
        name: 'New Category',
        nameEn: 'New Category EN',
      };
      const result = { id: 1, ...dto };
      mockService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('showAll', () => {
    it('should return all merchant categories', async () => {
      const result = [{ id: 1, name: 'Cat 1' }];
      mockService.showAll.mockResolvedValue(result);

      expect(await controller.showAll()).toBe(result);
      expect(service.showAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a merchant category', async () => {
      const id = '1';
      const dto: UpdateMerchantCategoryDto = {
        name: 'Updated',
        nameEn: 'Updated EN',
      };
      const result = { id: 1, ...dto };
      mockService.update.mockResolvedValue(result);

      expect(await controller.update(id, dto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(+id, dto);
    });
  });

  describe('delete', () => {
    it('should delete a merchant category', async () => {
      const id = '1';
      const result = { affected: 1 };
      mockService.delete.mockResolvedValue(result);

      expect(await controller.delete(id)).toBe(result);
      expect(service.delete).toHaveBeenCalledWith(+id);
    });
  });
});
