import { Test, TestingModule } from '@nestjs/testing';
import { MerchantPublicService } from './merchant-public.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Merchant } from '@/model/merchant.entity';
import { MerchantTranslation } from '@/model/merchant-translation.entity';
import { RequestContextService } from '@/modules/request-context/request-context.service';
import * as Utils from '@/utils';

jest.mock('@/utils', () => ({
  getByIdWithTranslation: jest.fn(),
}));

describe('MerchantPublicService', () => {
  let service: MerchantPublicService;
  let cacheManager: Cache;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRequestContextService = {
    currentMerchantOnSlug: jest.fn(),
    currentLang: 'en',
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantPublicService,
        { provide: getRepositoryToken(Merchant), useValue: mockRepo },
        {
          provide: getRepositoryToken(MerchantTranslation),
          useValue: mockRepo,
        },
        { provide: RequestContextService, useValue: mockRequestContextService },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<MerchantPublicService>(MerchantPublicService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    const merchant = { id: 1, slug: 'test-merchant' };
    const cachedData = { id: 1, name: 'Cached' };
    const dbData = { id: 1, name: 'From DB' };

    it('should return cached data if available', async () => {
      mockRequestContextService.currentMerchantOnSlug.mockResolvedValue(
        merchant,
      );
      mockCache.get.mockResolvedValue(cachedData);

      const result = await service.get();

      expect(mockCache.get).toHaveBeenCalledWith(`merchants:${merchant.id}`);
      expect(result).toEqual({ data: cachedData });
      expect(Utils.getByIdWithTranslation).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache if not available', async () => {
      mockRequestContextService.currentMerchantOnSlug.mockResolvedValue(
        merchant,
      );
      mockCache.get.mockResolvedValue(null);
      (Utils.getByIdWithTranslation as jest.Mock).mockResolvedValue(dbData);

      const result = await service.get();

      expect(mockCache.get).toHaveBeenCalledWith(`merchants:${merchant.id}`);
      expect(Utils.getByIdWithTranslation).toHaveBeenCalledWith(
        expect.objectContaining({
          id: merchant.id,
          parent: merchant,
        }),
      );
      expect(mockCache.set).toHaveBeenCalledWith(
        `merchants:${merchant.id}`,
        dbData,
        expect.any(Number),
      );
      expect(result).toEqual({ data: dbData });
    });
  });
});
