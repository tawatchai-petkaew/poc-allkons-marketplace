import { Test, TestingModule } from '@nestjs/testing';
import { ArticlePublicService } from './article-public.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Article } from '../../model/article.entity';
import { RequestContextService } from '../request-context/request-context.service';
import { paginate } from 'nestjs-typeorm-paginate';

// Mock nestjs-typeorm-paginate
jest.mock('nestjs-typeorm-paginate');
const mockPaginate = paginate as jest.MockedFunction<typeof paginate>;

describe('ArticlePublicService', () => {
  let service: ArticlePublicService;
  let repo: any;
  let cacheManager: any;
  let queryBuilder: any;

  const mockMerchant = { id: 1, name: 'Test Merchant' };

  const mockRequestContextService = {
    currentMerchantOnSlug: jest.fn().mockResolvedValue(mockMerchant),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    const mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlePublicService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockRepo,
        },
        {
          provide: RequestContextService,
          useValue: mockRequestContextService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ArticlePublicService>(ArticlePublicService);
    repo = module.get(getRepositoryToken(Article));
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return cached data if available', async () => {
      const cachedData = { data: [], meta: {} };
      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getAll({ page: 1, limit: 10 });

      expect(cacheManager.get).toHaveBeenCalledWith(
        `articles:${mockMerchant.id}`,
      );
      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
      expect(result).toEqual(cachedData);
    });

    it('should fetch from db and cache if not in cache (pagination)', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const paginatedResult = { items: [], meta: {} };
      mockPaginate.mockResolvedValue(paginatedResult as any);

      const result = await service.getAll({ page: 1, limit: 10 });

      expect(repo.createQueryBuilder).toHaveBeenCalled();
      expect(
        queryBuilder.where,
      ).toHaveBeenCalledWith('merchant.id = :merchantId', { merchantId: 1 });
      expect(mockPaginate).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        `articles:${mockMerchant.id}`,
        expect.anything(),
        60000, // 1 min TTL
      );
      expect(result.data).toEqual([]);
    });

    it('should filter by name and tag', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPaginate.mockResolvedValue({ items: [], meta: {} } as any);

      await service.getAll({ page: 1, limit: 10 }, 'true', 'test', 'news');

      expect(
        queryBuilder.andWhere,
      ).toHaveBeenCalledWith(':articleTag = ANY(article.tag)', {
        articleTag: 'news',
      });
      expect(
        queryBuilder.andWhere,
      ).toHaveBeenCalledWith('article.name like :name', { name: '%test%' });
    });

    it('should fetch all without pagination', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      queryBuilder.getMany.mockResolvedValue([]);

      await service.getAll({ page: 1, limit: 10 }, 'false');

      expect(mockPaginate).not.toHaveBeenCalled();
      expect(queryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('showById', () => {
    it('should find by id if numeric id provided', async () => {
      const mockArticle = { id: 1, name: 'Test' };
      repo.findOne.mockResolvedValue(mockArticle);

      const result = await service.showById('1');

      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 1 }),
        }),
      );
      expect(result.data.id).toBe(1);
    });

    it('should find by slug if string id provided', async () => {
      const mockArticle = { id: 2, urlSlug: 'some-slug' };
      repo.findOne.mockResolvedValue(mockArticle);

      const result = await service.showById('some-slug');

      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ urlSlug: 'some-slug' }),
        }),
      );
      expect(result.data.id).toBe(2);
    });
  });
});
