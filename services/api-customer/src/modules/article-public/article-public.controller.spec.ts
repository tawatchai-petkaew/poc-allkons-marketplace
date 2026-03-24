import { Test, TestingModule } from '@nestjs/testing';
import { ArticlePublicController } from './article-public.controller';
import { ArticlePublicService } from './article-public.service';
import {
  HttpException,
  HttpStatus,
  CACHE_MANAGER,
} from '@nestjs/common';

describe('ArticlePublicController', () => {
  let controller: ArticlePublicController;
  let service: any;

  const mockService = {
    getAll: jest.fn(),
    showById: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlePublicController],
      providers: [
        {
          provide: ArticlePublicService,
          useValue: mockService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<ArticlePublicController>(ArticlePublicController);
    service = module.get<ArticlePublicService>(ArticlePublicService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showAll', () => {
    it('should return articles', async () => {
      const mockResult = { data: [], meta: {} };
      mockService.getAll.mockResolvedValue(mockResult);

      const result = await controller.showAll(1, 10, 'true', 'name', 'tag');

      expect(service.getAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        'true',
        'name',
        'tag',
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('show', () => {
    it('should return article by id', async () => {
      const mockArticle = { id: 1 };
      mockService.showById.mockResolvedValue(mockArticle);

      const result = await controller.show('1');

      expect(service.showById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockArticle);
    });

    it('should throw BadRequest on error', async () => {
      mockService.showById.mockRejectedValue(new Error('Fetch failed'));

      await expect(controller.show('1')).rejects.toThrow(
        new HttpException({ message: 'Fetch failed' }, HttpStatus.BAD_REQUEST),
      );
    });
  });
});
