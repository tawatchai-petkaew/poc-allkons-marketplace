import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '@/model/category.entity';
import { ProductVariantCategory } from '@/model/product-variant-category.entity';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: jest.Mocked<any>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
    };

    const mockProductVariantCategoryRepository = {
      createQueryBuilder: jest.fn(() => ({
        distinctOn: jest.fn(() => ({
          leftJoin: jest.fn(() => ({
            addSelect: jest.fn(() => ({
              where: jest.fn(() => ({
                andWhere: jest.fn(() => ({
                  orderBy: jest.fn(() => ({
                    addOrderBy: jest.fn(() => ({
                      getMany: jest.fn(),
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ProductVariantCategory),
          useValue: mockProductVariantCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

