import { Test, TestingModule } from '@nestjs/testing';
import { MerchantCategoryService } from './merchant-category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MerchantCategory } from '@/model/merchant-category.entity';
import { Repository } from 'typeorm';
import { CreateMerchantCategoryDto } from './dto/create-merchant-category.dto';
import { UpdateMerchantCategoryDto } from './dto/update-merchant-category.dto';

describe('MerchantCategoryService', () => {
  let service: MerchantCategoryService;
  let repo: Repository<MerchantCategory>;

  const mockRepo = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantCategoryService,
        {
          provide: getRepositoryToken(MerchantCategory),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<MerchantCategoryService>(MerchantCategoryService);
    repo = module.get<Repository<MerchantCategory>>(
      getRepositoryToken(MerchantCategory),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a merchant category', async () => {
      const dto: CreateMerchantCategoryDto = {
        name: 'Test Category',
        nameEn: 'Test Category EN',
      };
      const savedEntity = { id: 1, ...dto };
      mockRepo.save.mockResolvedValue(savedEntity);

      const result = await service.create(dto);

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining(dto));
      expect(result).toEqual(savedEntity);
    });
  });

  describe('showAll', () => {
    it('should return all merchant categories', async () => {
      const entities = [{ id: 1, name: 'Cat 1' }];
      mockRepo.find.mockResolvedValue(entities);

      const result = await service.showAll();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual(entities);
    });
  });

  describe('findById', () => {
    it('should return a merchant category by id', async () => {
      const entity = { id: 1, name: 'Cat 1' };
      mockRepo.findOne.mockResolvedValue(entity);

      const result = await service.findById(1);

      expect(repo.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(entity);
    });
  });

  describe('update', () => {
    it('should update a merchant category', async () => {
      const id = 1;
      const dto: UpdateMerchantCategoryDto = {
        name: 'Updated Name',
        nameEn: 'Updated Name EN',
      };
      const existingEntity = { id, name: 'Old Name', nameEn: 'Old Name EN' };
      const updatedEntity = { id, ...dto };

      mockRepo.findOne.mockResolvedValue(existingEntity);
      mockRepo.save.mockResolvedValue(updatedEntity);

      const result = await service.update(id, dto);

      expect(repo.findOne).toHaveBeenCalledWith(id);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ ...existingEntity, ...dto }),
      );
      expect(result).toEqual(updatedEntity);
    });
  });

  describe('delete', () => {
    it('should soft delete a merchant category', async () => {
      const id = 1;
      const deleteResult = { affected: 1 };
      mockRepo.softDelete.mockResolvedValue(deleteResult);

      const result = await service.delete(id);

      expect(repo.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(deleteResult);
    });
  });
});
