import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadFolderService } from './image-upload-folder.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { Merchant } from '../../model/merchant.entity';
import { paginate } from 'nestjs-typeorm-paginate';

jest.mock('nestjs-typeorm-paginate');

describe('ImageUploadFolderService', () => {
  let service: ImageUploadFolderService;
  let folderRepo: any;
  let imageRepo: any;
  let merchantRepo: any;
  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    folderRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    imageRepo = {
      softDelete: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    merchantRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageUploadFolderService,
        {
          provide: getRepositoryToken(ImageUploadFolder),
          useValue: folderRepo,
        },
        { provide: getRepositoryToken(ImageUpload), useValue: imageRepo },
        { provide: getRepositoryToken(Merchant), useValue: merchantRepo },
      ],
    }).compile();

    service = module.get<ImageUploadFolderService>(ImageUploadFolderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a folder', async () => {
      const dto: any = { merchantId: 1, name: 'test' };
      merchantRepo.findOne.mockResolvedValue({ id: 1 });
      folderRepo.save.mockResolvedValue({ id: 1, name: 'test' });

      const result = await service.create(dto);
      expect(folderRepo.save).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });
  });

  describe('showAll', () => {
    it('should return all folders for merchant', async () => {
      merchantRepo.findOne.mockResolvedValue({ id: 1 });
      queryBuilder.getMany.mockResolvedValue([{ id: 1, name: 'folder' }]);

      const result = await service.showAll({ merchantId: 1 });
      expect(folderRepo.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalledWith('merchant.id = :id', {
        id: 1,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('showAllWithDeleted', () => {
    it('should return folders including deleted ones', async () => {
      merchantRepo.findOne.mockResolvedValue({ id: 1 });
      folderRepo.find.mockResolvedValue([{ id: 1 }]);
      imageRepo.find.mockResolvedValue([{ id: 1 }]);

      const result = await service.showAllWithDeleted({ merchantId: 1 });
      expect(folderRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update folder', async () => {
      folderRepo.findOne.mockResolvedValue({ id: 1 });
      folderRepo.save.mockResolvedValue({ id: 1, name: 'updated' });

      const result = await service.update(1, { name: 'updated' } as any);
      expect(folderRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('updated');
    });
  });

  describe('delete', () => {
    it('should soft delete folder and images', async () => {
      folderRepo.findOne.mockResolvedValue({
        id: 1,
        imageUploads: [{ id: 10 }],
      });

      await service.delete(1);

      expect(imageRepo.softDelete).toHaveBeenCalledWith(10);
      expect(folderRepo.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('showAllFolder', () => {
    it('should return folders with counts', async () => {
      queryBuilder.getMany.mockResolvedValue([{ id: 1, imageUploadCount: 5 }]);

      const result = await service.showAllFolder(1);

      expect(queryBuilder.loadRelationCountAndMap).toHaveBeenCalled();
      expect(result[0].imageUploadCount).toBe(5);
    });
  });

  describe('showAllWithFolder', () => {
    it('should return images paginated', async () => {
      (paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.showAllWithFolder(1, {} as any, 'true');
      expect(paginate).toHaveBeenCalled();
    });

    it('should filter by folderIds provided', async () => {
      (paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.showAllWithFolder(1, {} as any, 'true', [1, 2]);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'imageUploadFolder.id IN(:...folderIds)',
        { folderIds: [1, 2] },
      );
    });

    it('should return raw array if pagination false', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      const result = await service.showAllWithFolder(1, {} as any, 'false');
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });
  });
});
