import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

describe('ArticleController', () => {
  let controller: ArticleController;
  let articleService: any;

  const mockService = {
    getAll: jest.fn(),
    create: jest.fn(),
    showById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockI18n = {} as I18nContext;

  const mockUserRequest = {
    user: { userId: 123 },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ArticleController>(ArticleController);
    articleService = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showAll', () => {
    it('should return articles with default pagination', async () => {
      const mockResult = { data: [], meta: {} };
      mockService.getAll.mockResolvedValue(mockResult);

      const result = await controller.showAll(1, 10, 'true', undefined);

      expect(articleService.getAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        'true',
        undefined,
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass correct parameters', async () => {
      const mockResult = [];
      mockService.getAll.mockResolvedValue(mockResult);

      const result = await controller.showAll(2, 20, 'false', 'search');

      expect(articleService.getAll).toHaveBeenCalledWith(
        { page: 2, limit: 20 },
        'false',
        'search',
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('create', () => {
    const dto: CreateArticleDto = { name: 'Test' } as any;

    it('should create article successfully', async () => {
      const mockCreated = { id: 1, ...dto };
      mockService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(mockUserRequest, dto, mockI18n);

      expect(articleService.create).toHaveBeenCalledWith(dto, 123, mockI18n);
      expect(result).toEqual(mockCreated);
    });

    it('should throw BadRequest exception on error', async () => {
      mockService.create.mockRejectedValue(new Error('Test Error'));

      await expect(
        controller.create(mockUserRequest, dto, mockI18n),
      ).rejects.toThrow(
        new HttpException({ message: 'Test Error' }, HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('show', () => {
    it('should return article by id', async () => {
      const mockArticle = { id: 1, name: 'Test' };
      mockService.showById.mockResolvedValue(mockArticle);

      const result = await controller.show('1');

      expect(articleService.showById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockArticle);
    });

    it('should throw BadRequest exception on error', async () => {
      mockService.showById.mockRejectedValue(new Error('Not Found'));

      await expect(controller.show('99')).rejects.toThrow(
        new HttpException({ message: 'Not Found' }, HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('update', () => {
    const dto: UpdateArticleDto = { name: 'Updated' } as any;

    it('should update article successfully', async () => {
      const mockUpdated = { id: 1, ...dto };
      mockService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update(
        mockUserRequest,
        '1',
        dto,
        mockI18n,
      );

      expect(articleService.update).toHaveBeenCalledWith(1, dto, 123, mockI18n);
      expect(result).toEqual(mockUpdated);
    });

    it('should throw BadRequest exception on error', async () => {
      mockService.update.mockRejectedValue(new Error('Update Failed'));

      await expect(
        controller.update(mockUserRequest, '1', dto, mockI18n),
      ).rejects.toThrow(
        new HttpException({ message: 'Update Failed' }, HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('delete', () => {
    it('should delete article successfully', async () => {
      const mockResult = { affected: 1 };
      mockService.delete.mockResolvedValue(mockResult);

      const result = await controller.delete('1');

      expect(articleService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });

    it('should throw BadRequest exception on error', async () => {
      mockService.delete.mockRejectedValue(new Error('Delete Failed'));

      await expect(controller.delete('1')).rejects.toThrow(
        new HttpException({ message: 'Delete Failed' }, HttpStatus.BAD_REQUEST),
      );
    });
  });
});
