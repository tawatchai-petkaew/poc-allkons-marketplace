import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MerchantProduct,
  MerchantProductEntityStatus,
  MerchantProductStatus,
} from '@/model/merchant-product.entity';
import { Merchant } from '@/model/merchant.entity';
import { Product } from '@/model/product.entity';
import { ProductVariant } from '@/model/product-variant.entity';
import { ProductVariantImage } from '@/model/product-variant-image.entity';
import { UserMerchant } from '@/model/user-merchant.entity';
import { RequestContextService } from '@/modules/request-context/request-context.service';
import { ProductMatchingService } from '../../product-matching/product-matching.service';
import { AuthUser } from '@/types/request.types';
import { In } from 'typeorm';

describe('ProductService', () => {
  let service: ProductService;
  let userMerchantRepo: any;
  let merchantProductRepo: any;
  let contextService: any;

  const mockUser: AuthUser = {
    id: 1,
    uuid: 'user-uuid',
    sub: 'user-sub',
    azp: 'user-azp',
  };

  const mockMerchant = {
    id: 100,
    slug: 'current-merchant',
    merchantName: 'Current Merchant',
    contactAddress: 'Address 1',
  };

  beforeEach(async () => {
    const mockUserMerchantRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      // Add other methods if needed
    };

    const mockMerchantProductRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      // Add other methods if needed
    };

    const mockGenericRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        distinctOn: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
        getRawMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn().mockResolvedValue(null),
      })),
    };

    const mockRequestContextService = {
      currentMerchantOnSlug: jest.fn(),
    };

    const mockProductMatchingService = {
      searchProducts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(MerchantProduct),
          useValue: mockMerchantProductRepo,
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: mockGenericRepo,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockGenericRepo,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: mockGenericRepo,
        },
        {
          provide: getRepositoryToken(ProductVariantImage),
          useValue: mockGenericRepo,
        },
        {
          provide: getRepositoryToken(UserMerchant),
          useValue: mockUserMerchantRepo,
        },
        {
          provide: RequestContextService,
          useValue: mockRequestContextService,
        },
        {
          provide: ProductMatchingService,
          useValue: mockProductMatchingService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    userMerchantRepo = module.get(getRepositoryToken(UserMerchant));
    merchantProductRepo = module.get(getRepositoryToken(MerchantProduct));
    contextService = module.get(RequestContextService);
  });

  describe('getBranches', () => {
    it('should return empty data if user has no merchants', async () => {
      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);
      userMerchantRepo.find.mockResolvedValue([]);

      const result = await service.getBranches('SKU123', mockUser);

      expect(result).toEqual({ data: [] });
      expect(contextService.currentMerchantOnSlug).toHaveBeenCalled();
      expect(userMerchantRepo.find).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        select: ['merchantId'],
      });
    });

    it('should return branches list with isCurrent flag', async () => {
      const sku = 'SKU123';
      const otherMerchantId = 200;

      contextService.currentMerchantOnSlug.mockResolvedValue(mockMerchant);

      // Mock UserMerchants: User owns CurrentMerchant(100) and OtherMerchant(200)
      userMerchantRepo.find.mockResolvedValue([
        { merchantId: mockMerchant.id },
        { merchantId: otherMerchantId },
      ]);

      // Mock MerchantProducts found in these merchants
      const mockBranches = [
        {
          merchant: {
            ...mockMerchant,
            id: mockMerchant.id,
            slug: 'current-slug',
          },
          productVariant: { sku },
          quantity: 10,
          priceIncludeVat: 100,
          specialPriceIncludeVat: 90,
          imageUpload: { url: 'img1.jpg' },
        },
        {
          merchant: {
            id: otherMerchantId,
            merchantName: 'Other Shop',
            slug: 'other-slug',
            contactAddress: 'Address 2',
          },
          productVariant: { sku },
          quantity: 5,
          priceIncludeVat: 100,
          specialPriceIncludeVat: null,
          thumbnail: 'thumb.jpg',
        },
      ];

      merchantProductRepo.find.mockResolvedValue(mockBranches);

      const result = await service.getBranches(sku, mockUser);

      expect(merchantProductRepo.find).toHaveBeenCalledWith({
        relations: ['merchant', 'productVariant', 'imageUpload'],
        where: {
          merchantId: In([mockMerchant.id, otherMerchantId]),
          productVariant: {
            sku: sku,
          },
          status: MerchantProductEntityStatus.ACTIVE,
          merchantProductStatus: MerchantProductStatus.SELLING,
        },
        order: {
          quantity: 'DESC',
        },
      });

      expect(result.data).toHaveLength(2);
      // Check first item (Current Merchant)
      expect(result.data[0].merchant.isCurrent).toBe(true);
      expect(result.data[0].merchant.id).toBe(mockMerchant.id);
      expect(result.data[0].product.sku).toBe(sku);
      expect(result.data[0].product.image).toBe('img1.jpg');

      // Check second item (Other Merchant)
      expect(result.data[1].merchant.isCurrent).toBe(false);
      expect(result.data[1].merchant.id).toBe(otherMerchantId);
      expect(result.data[1].product.image).toBe('thumb.jpg');
    });
  });
});
