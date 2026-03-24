import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nContext } from 'nestjs-i18n';
import { paginate } from 'nestjs-typeorm-paginate';

import { Article } from '../../model/article.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { Merchant } from '../../model/merchant.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { MerchantService } from '../merchant/merchant.service';
import { RequestContextService } from '../request-context/request-context.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

// Mock dependencies
jest.mock('nestjs-typeorm-paginate');

const mockPaginate = paginate as jest.MockedFunction<typeof paginate>;

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepo: any;
  let imageUploadRepo: any;
  let activityLogService: any;
  let merchantService: any;
  let requestContextService: any;
  let queryBuilder: any;

  const mockMerchant = ({
    id: 1,
    name: 'Test Merchant',
  } as unknown) as Merchant;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    const mockArticleRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const mockImageUploadRepo = {
      findOne: jest.fn(),
    };

    const mockActivityLogServiceDef = {
      create: jest.fn(),
    };

    const mockMerchantServiceDef = {
      setSoftDeleteRepository: jest.fn(),
    };

    const mockRequestContextServiceDef = {
      currentMerchant: jest.fn().mockResolvedValue(mockMerchant),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepo,
        },
        {
          provide: getRepositoryToken(ImageUpload),
          useValue: mockImageUploadRepo,
        },
        {
          provide: ActivityLogService,
          useValue: mockActivityLogServiceDef,
        },
        {
          provide: MerchantService,
          useValue: mockMerchantServiceDef,
        },
        {
          provide: RequestContextService,
          useValue: mockRequestContextServiceDef,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    articleRepo = module.get(getRepositoryToken(Article));
    imageUploadRepo = module.get(getRepositoryToken(ImageUpload));
    activityLogService = module.get(ActivityLogService);
    merchantService = module.get(MerchantService);
    requestContextService = module.get(RequestContextService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return paginated articles by default', async () => {
      const options = { page: 1, limit: 10 };
      const paginatedResult = { items: [], meta: {} };
      mockPaginate.mockResolvedValue(paginatedResult as any);

      queryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getAll(options);

      expect(requestContextService.currentMerchant).toHaveBeenCalled();
      expect(articleRepo.createQueryBuilder).toHaveBeenCalledWith('article');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.merchant',
        'merchant',
      );
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.imageUpload',
        'imageUpload',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'merchant.id = :merchantId',
        {
          merchantId: mockMerchant.id,
        },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'article.releasedAt',
        'DESC',
      );
      expect(mockPaginate).toHaveBeenCalledWith(queryBuilder, options);
      expect(result).toEqual({ data: [], meta: {} });
    });

    it('should return all articles when withPagination is false', async () => {
      const options = { page: 1, limit: 10 };
      const mockArticles = [{ id: 1, name: 'Article 1' }];
      queryBuilder.getMany.mockResolvedValue(mockArticles);

      const result = await service.getAll(options, 'false');

      expect(mockPaginate).not.toHaveBeenCalled();
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual({ data: mockArticles, meta: undefined });
    });

    it('should filter by name when provided', async () => {
      const options = { page: 1, limit: 10 };
      mockPaginate.mockResolvedValue({ items: [], meta: {} } as any);

      await service.getAll(options, 'true', 'Test Name');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'article.name like :name',
        {
          name: '%Test Name%',
        },
      );
    });
  });

  describe('create', () => {
    const mockUser = { id: 123 };
    const mockI18n = ({
      t: jest.fn().mockReturnValue('URL exists error'),
    } as unknown) as I18nContext;
    const createDto: CreateArticleDto = {
      name: 'Test Article',
      urlSlug: 'test-slug',
      imageUploadId: 1,
    } as any;

    it('should throw error if URL slug already exists', async () => {
      // Mock existing article found by queryBuilder
      queryBuilder.getMany.mockResolvedValue([{ id: 2, urlSlug: 'test-slug' }]);
      imageUploadRepo.findOne.mockResolvedValue({ id: 1 });

      await expect(
        service.create(createDto, mockUser, mockI18n),
      ).rejects.toThrow('URL exists error');

      expect(queryBuilder.where).toHaveBeenCalledWith('merchant.id = :id', {
        id: mockMerchant.id,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'article.urlSlug = :urlSlug',
        {
          urlSlug: createDto.urlSlug,
        },
      );
    });

    it('should create article successfully if valid', async () => {
      // Mock no existing article
      queryBuilder.getMany.mockResolvedValue([]);
      const mockImage = { id: 1 };
      imageUploadRepo.findOne.mockResolvedValue(mockImage);

      const savedArticle = {
        id: 1,
        ...createDto,
        merchant: mockMerchant,
        imageUpload: mockImage,
      };
      articleRepo.save.mockResolvedValue(savedArticle);

      const result = await service.create(createDto, mockUser, mockI18n);

      expect(imageUploadRepo.findOne).toHaveBeenCalledWith({
        id: createDto.imageUploadId,
      });
      expect(articleRepo.save).toHaveBeenCalled();
      expect(activityLogService.create).toHaveBeenCalledWith({
        name: 'create',
        resourceType: 'article',
        resourceId: savedArticle.id,
        actionType: 'user',
        actionId: mockUser,
      });
      expect(merchantService.setSoftDeleteRepository).toHaveBeenCalledWith(
        'article',
        savedArticle.id,
      );
      expect(result).toBeDefined();
    });
  });

  describe('showById', () => {
    it('should return the article', async () => {
      const mockArticle = { id: 1, name: 'Test', merchant: mockMerchant };
      articleRepo.findOne.mockResolvedValue(mockArticle);

      const result = await service.showById(1);

      expect(articleRepo.findOne).toHaveBeenCalledWith(1, {
        where: { merchant: mockMerchant },
        relations: ['imageUpload'],
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    const mockUser = { id: 123 };
    const mockI18n = ({
      t: jest.fn().mockReturnValue('URL exists error'),
    } as unknown) as I18nContext;
    const updateDto: UpdateArticleDto = {
      name: 'Updated Name',
      urlSlug: 'new-slug',
    } as any;
    const existingArticle = {
      id: 1,
      name: 'Old Name',
      urlSlug: 'old-slug',
      merchant: mockMerchant,
    };

    it('should throw error if new URL slug exists', async () => {
      articleRepo.findOne.mockResolvedValue(existingArticle);
      // Mock failure check
      queryBuilder.getMany.mockResolvedValue([{ id: 2, urlSlug: 'new-slug' }]);

      await expect(
        service.update(1, updateDto, mockUser, mockI18n),
      ).rejects.toThrow('URL exists error');

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'article.id != :article_id',
        {
          article_id: existingArticle.id,
        },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'article.urlSlug = :urlSlug',
        {
          urlSlug: updateDto.urlSlug,
        },
      );
    });

    it('should update article successfully', async () => {
      articleRepo.findOne.mockResolvedValue(existingArticle);
      queryBuilder.getMany.mockResolvedValue([]); // No duplicate slug

      const updatedArticle = { ...existingArticle, ...updateDto };
      articleRepo.save.mockResolvedValue(updatedArticle);

      const result = await service.update(1, updateDto, mockUser, mockI18n);

      expect(articleRepo.findOne).toHaveBeenCalledWith(1, {
        where: { merchant: mockMerchant },
        relations: ['imageUpload'],
      });
      expect(articleRepo.save).toHaveBeenCalled();
      expect(activityLogService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'update',
          resourceId: 1,
        }),
      );
      expect(result).toEqual(updatedArticle);
    });

    it('should handle missing imageUploadId', async () => {
      const dtoWithoutImage = {
        name: 'Update',
        imageUploadId: null,
      } as UpdateArticleDto;
      articleRepo.findOne.mockResolvedValue(existingArticle);
      articleRepo.save.mockResolvedValue({
        ...existingArticle,
        ...dtoWithoutImage,
      });

      await service.update(1, dtoWithoutImage, mockUser, mockI18n);

      expect(imageUploadRepo.findOne).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete the article', async () => {
      articleRepo.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(articleRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ affected: 1 });
    });
  });
});
