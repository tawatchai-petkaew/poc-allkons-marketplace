import { Test, TestingModule } from '@nestjs/testing';
import { BannerMerchantPublicService } from './banner-merchant-public.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BannerMerchant } from '../../model/banner-merchant.entity';
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

describe('BannerMerchantPublicService', () => {
  let service: BannerMerchantPublicService;
  let repo: any;
  let cacheManager: Cache;

  const mockRequestContextService = {
    currentMerchantOnSlug: jest.fn(),
    currentMerchant: jest.fn(),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerMerchantPublicService,
        {
          provide: getRepositoryToken(BannerMerchant),
          useValue: createMockRepository(),
        },
        { provide: RequestContextService, useValue: mockRequestContextService },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<BannerMerchantPublicService>(
      BannerMerchantPublicService,
    );
    repo = module.get(getRepositoryToken(BannerMerchant));
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('getAll', () => {
    it('should return cached data if available (Cache Hit)', async () => {
      mockRequestContextService.currentMerchantOnSlug.mockResolvedValue({
        id: 1,
      });
      const cachedData = [{ id: 1, type: 'test' }];
      (mockCache.get as jest.Mock).mockResolvedValue(cachedData);

      const result = await service.getAll();

      expect(mockCache.get).toHaveBeenCalledWith('bannerMerchants:1');
      expect(repo.find).not.toHaveBeenCalled();
      expect(result).toEqual({ data: cachedData });
    });

    it('should fetch from repo and cache if not in cache (Cache Miss)', async () => {
      mockRequestContextService.currentMerchantOnSlug.mockResolvedValue({
        id: 1,
      });
      (mockCache.get as jest.Mock).mockResolvedValue(null);

      const dbData = [{ id: 1, type: 'test' }];
      repo.find.mockResolvedValue(dbData);

      const result = await service.getAll();

      expect(repo.find).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith(
        'bannerMerchants:1',
        expect.any(Array),
        60000,
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('showById', () => {
    it('should return banner by id', async () => {
      mockRequestContextService.currentMerchant.mockResolvedValue({ id: 1 });
      const dbData = { id: 1, type: 'test' };
      repo.findOne.mockResolvedValue(dbData);

      const result = await service.showById(1);

      expect(repo.findOne).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ where: { merchant: { id: 1 } } }),
      );
      expect(result.data.id).toBe(1);
    });
  });
});
