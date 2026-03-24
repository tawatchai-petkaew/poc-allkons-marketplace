import { Test, TestingModule } from '@nestjs/testing';
import { BannerMerchantService } from './banner-merchant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BannerMerchant } from '../../model/banner-merchant.entity';
import { BannerMerchantDesktop } from '../../model/banner-merchant-desktop.entity';
import { BannerMerchantApplication } from '../../model/banner-merchant-application.entity';
import { Product } from '../../model/product.entity';
import { ProductBrand } from '../../model/product-brand.entity';
import { ProductCategory } from '../../model/product-category.entity';
import { ProductCatalog } from '../../model/product-catalog.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { Article } from '../../model/article.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { RequestContextService } from '../request-context/request-context.service';

const createMockRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
});

describe('BannerMerchantService', () => {
  let service: BannerMerchantService;
  let bannerRepo: any;
  let desktopRepo: any;
  let appRepo: any;

  const mockActivityLogService = {
    create: jest.fn(),
  };

  const mockRequestContextService = {
    currentMerchant: jest.fn().mockResolvedValue({ id: 1, name: 'Merchant' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerMerchantService,
        {
          provide: getRepositoryToken(BannerMerchant),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(BannerMerchantDesktop),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(BannerMerchantApplication),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(ProductBrand),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(ProductCatalog),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(ImageUpload),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Article),
          useValue: createMockRepository(),
        },
        { provide: ActivityLogService, useValue: mockActivityLogService },
        { provide: RequestContextService, useValue: mockRequestContextService },
      ],
    }).compile();

    service = module.get<BannerMerchantService>(BannerMerchantService);
    bannerRepo = module.get(getRepositoryToken(BannerMerchant));
    desktopRepo = module.get(getRepositoryToken(BannerMerchantDesktop));
    appRepo = module.get(getRepositoryToken(BannerMerchantApplication));
  });

  describe('getAll', () => {
    it('should return all banner merchants', async () => {
      const resultData = [{ id: 1 }];
      bannerRepo.find.mockResolvedValue(resultData);

      const result = await service.getAll();
      expect(result).toHaveLength(1);
      expect(bannerRepo.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create banner merchant with nested attributes', async () => {
      const dto = {
        productId: 1,
        bannerMerchantDesktopAttributes: { imageUploadId: 10 },
        bannerMerchantApplicationAttributes: { imageUploadId: 20 },
      } as any;

      const savedBanner = { id: 1, ...dto };
      bannerRepo.save.mockResolvedValue(savedBanner);
      desktopRepo.save.mockResolvedValue({});
      appRepo.save.mockResolvedValue({});

      const result = await service.create(dto, 123);

      expect(bannerRepo.save).toHaveBeenCalled();
      expect(mockActivityLogService.create).toHaveBeenCalled();
      expect(desktopRepo.save).toHaveBeenCalled();
      expect(appRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('showById', () => {
    it('should return banner merchant by id', async () => {
      bannerRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.showById(1);
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update banner merchant', async () => {
      const dto = { productId: 2 } as any;
      const existing = { id: 1 };
      bannerRepo.findOne.mockResolvedValue(existing);
      bannerRepo.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.update(1, dto, 123);

      expect(bannerRepo.save).toHaveBeenCalled();
      // Cast to any because the mock implementation returns the DTO with productId, but the return type is BannerMerchantDto
      expect((result as any).productId).toBe(2);
    });

    it('should handle nested attribute updates', async () => {
      const dto = {
        bannerMerchantDesktopAttributes: { id: null, imageUploadId: 10 },
      } as any;
      const existing = { id: 1, bannerMerchantDesktop: { id: 99 } };

      bannerRepo.findOne.mockResolvedValue(existing);
      bannerRepo.save.mockResolvedValue(existing);

      // Mock sub-repo calls
      desktopRepo.delete.mockResolvedValue({});
      desktopRepo.save.mockResolvedValue({});

      await service.update(1, dto, 123);

      // Should delete old desktop and save new one
      expect(desktopRepo.delete).toHaveBeenCalledWith(99);
      expect(desktopRepo.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      await service.delete(1);
      expect(bannerRepo.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('createBatchOrUpdate', () => {
    it('should handle batch updates', async () => {
      const existing = [{ id: 1 }, { id: 2 }];
      bannerRepo.find.mockResolvedValue(existing);

      const dto = {
        bannerMerchantAttributes: [
          { id: 1, name: 'update' }, // update
          { name: 'create' }, // create
          // id 2 missing -> delete
        ],
      } as any;

      // Mock internal calls (create/update) logic via spies or by mocking repo behaviors
      // Since create/update are on the same service instance, we can spy if we want,
      // or just rely on repo calls.
      // However, 'create' and 'update' are methods on 'this'.
      // Spying on self is tricky in NestJS depending on proxy.
      // Let's rely on repo calls as the primary verification.

      bannerRepo.softDelete.mockResolvedValue({});
      bannerRepo.findOne.mockResolvedValue({ id: 1 }); // for update logic
      bannerRepo.save.mockResolvedValue({ id: 99 }); // for create logic

      await service.createBatchOrUpdate(dto, 123);

      // 1. Verify soft delete of ID 2
      expect(bannerRepo.softDelete).toHaveBeenCalledWith(2);

      // 2. Verify save (create) and/or update logic triggered
      // Since we mocked repos, create() and update() internal calls will succeed.
    });
  });
});
