import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadFolderService } from './image-upload-folder.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { Merchant } from '../../model/merchant.entity';
import { RequestContextService } from '../request-context/request-context.service';
import { CreateImageUploadFolderDto } from './dto/create-image-upload-folder.dto';
import { UpdateImageUploadFolderDto } from './dto/update-image-upload-folder.dto';
import { ImageUploadFolderDto } from './dto/image-upload-folder.dto';

describe('ImageUploadFolderService', () => {
  let service: ImageUploadFolderService;
  let imageUploadFolderRepo: any;
  let imageUploadRepo: any;
  let merchantRepo: any;
  let contextService: any;

  const mockMerchant = { id: 1, slug: 'test-merchant' } as Merchant;
  const mockFolder = {
    id: 1,
    name: 'Test Folder',
    merchant: mockMerchant,
    imageUploads: [],
  } as ImageUploadFolder;

  const mockImage = {
    id: 1,
    name: 'test.jpg',
    url: 'https://example.com/test.jpg',
    imageUploadFolder: mockFolder,
  } as ImageUpload;

  const createMockQueryBuilder = () => {
    const mockQB: any = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getParameters: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockReturnValue({}),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      cache: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          /* items */
        ],
        0,
      ]),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getCount: jest.fn().mockResolvedValue(0),
      getQuery: jest.fn().mockReturnValue('SELECT 1'),
      clone: jest.fn(),
      connection: {
        createQueryBuilder: jest.fn(),
      },
      expressionMap: {
        mainAlias: { target: ImageUpload },
      },
    };
    // clone should return a new QB with same methods
    mockQB.clone.mockImplementation(() => {
      const cloned = createMockQueryBuilder();
      cloned.getManyAndCount = mockQB.getManyAndCount;
      cloned.getMany = mockQB.getMany;
      cloned.getCount = mockQB.getCount;
      return cloned;
    });
    mockQB.connection.createQueryBuilder.mockReturnValue(mockQB);
    return mockQB;
  };

  beforeEach(async () => {
    const mockImageUploadFolderRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockImageUploadRepo = {
      find: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockMerchantRepo = {
      findOne: jest.fn(),
    };

    const mockContextService = {
      currentMerchant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageUploadFolderService,
        {
          provide: getRepositoryToken(ImageUploadFolder),
          useValue: mockImageUploadFolderRepo,
        },
        {
          provide: getRepositoryToken(ImageUpload),
          useValue: mockImageUploadRepo,
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: mockMerchantRepo,
        },
        {
          provide: RequestContextService,
          useValue: mockContextService,
        },
      ],
    }).compile();

    service = module.get<ImageUploadFolderService>(ImageUploadFolderService);
    imageUploadFolderRepo = module.get(getRepositoryToken(ImageUploadFolder));
    imageUploadRepo = module.get(getRepositoryToken(ImageUpload));
    merchantRepo = module.get(getRepositoryToken(Merchant));
    contextService = module.get(RequestContextService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an image upload folder', async () => {
      const createDto = {
        name: 'New Folder',
        merchantId: 1,
      } as CreateImageUploadFolderDto;

      merchantRepo.findOne.mockResolvedValue(mockMerchant);
      imageUploadFolderRepo.save.mockResolvedValue(mockFolder);
      jest
        .spyOn(ImageUploadFolderDto, 'fromEntity')
        .mockReturnValue(mockFolder as any);

      const result = await service.create(createDto);

      expect(merchantRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(imageUploadFolderRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('showAll', () => {
    it('should return all folders with images', async () => {
      const params = { merchantId: 1 };
      const folders = [mockFolder];

      merchantRepo.findOne.mockResolvedValue(mockMerchant);
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue(folders);
      imageUploadFolderRepo.createQueryBuilder.mockReturnValue(mockQB);
      jest
        .spyOn(ImageUploadFolderDto, 'fromEntity')
        .mockImplementation((e) => e as any);

      const result = await service.showAll(params);

      expect(merchantRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toHaveLength(1);
    });
  });

  describe('showAllWithDeleted', () => {
    it('should return all folders including deleted ones', async () => {
      const params = { merchantId: 1 };
      const folderWithImages = { ...mockFolder, imageUploads: [mockImage] };

      merchantRepo.findOne.mockResolvedValue(mockMerchant);
      imageUploadFolderRepo.find.mockResolvedValue([folderWithImages]);
      imageUploadRepo.find.mockResolvedValue([mockImage]);
      jest
        .spyOn(ImageUploadFolderDto, 'fromEntity')
        .mockImplementation((e) => e as any);
      jest
        .spyOn(ImageUploadFolderDto, 'toEntity')
        .mockImplementation((e) => e as any);

      const result = await service.showAllWithDeleted(params);

      expect(imageUploadFolderRepo.find).toHaveBeenCalledWith({
        relations: ['imageUploads'],
        where: { merchant: mockMerchant },
        withDeleted: true,
      });
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an image upload folder', async () => {
      const updateDto = {
        name: 'Updated Folder',
      } as UpdateImageUploadFolderDto;
      const updatedFolder = { ...mockFolder, name: 'Updated Folder' };

      imageUploadFolderRepo.findOne.mockResolvedValue(mockFolder);
      jest
        .spyOn(ImageUploadFolderDto, 'toEntity')
        .mockReturnValue(updateDto as any);
      imageUploadFolderRepo.save.mockResolvedValue(updatedFolder);

      const result = await service.update(1, updateDto);

      expect(imageUploadFolderRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(imageUploadFolderRepo.save).toHaveBeenCalled();
      expect(result).toEqual(updatedFolder);
    });
  });

  describe('delete', () => {
    it('should soft delete folder and its images', async () => {
      const folderWithImages = { ...mockFolder, imageUploads: [mockImage] };

      imageUploadFolderRepo.findOne.mockResolvedValue(folderWithImages);
      imageUploadRepo.softDelete.mockResolvedValue({ affected: 1 });
      imageUploadFolderRepo.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(imageUploadFolderRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['imageUploads'],
      });
      expect(imageUploadRepo.softDelete).toHaveBeenCalledWith(1);
      expect(imageUploadFolderRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result.affected).toBe(1);
    });
  });

  describe('showAllFolder', () => {
    it('should return all folders with image count', async () => {
      const folderWithCount = { ...mockFolder, imageUploadCount: 5 };

      contextService.currentMerchant.mockResolvedValue(mockMerchant);
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([folderWithCount]);
      imageUploadFolderRepo.createQueryBuilder.mockReturnValue(mockQB);
      jest
        .spyOn(ImageUploadFolderDto, 'fromEntity')
        .mockImplementation((e) => e as any);

      const result = await service.showAllFolder();

      expect(contextService.currentMerchant).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].imageUploadCount).toBe(5);
    });
  });

  describe('showAllWithFolder', () => {
    it('should return paginated images with pagination enabled', async () => {
      const options = { page: 1, limit: 10 };
      const paginatedResult = {
        items: [mockImage],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      contextService.currentMerchant.mockResolvedValue(mockMerchant);
      const mockQB = createMockQueryBuilder();
      imageUploadRepo.createQueryBuilder.mockReturnValue(mockQB);

      // Mock the paginate function by returning the query builder with getMany
      mockQB.getMany = jest.fn().mockResolvedValue([mockImage]);

      const result = await service.showAllWithFolder(1, options, 'true');

      expect(contextService.currentMerchant).toHaveBeenCalled();
      expect(mockQB.where).toHaveBeenCalledWith('merchant.id = :id', { id: 1 });
    });

    it('should return images without pagination when withPagination is false', async () => {
      const options = { page: 1, limit: 10 };

      contextService.currentMerchant.mockResolvedValue(mockMerchant);
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockImage]);
      imageUploadRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.showAllWithFolder(1, options, 'false');

      expect(contextService.currentMerchant).toHaveBeenCalled();
      expect(result.data).toBeDefined();
    });

    it('should filter by folder IDs when provided', async () => {
      const options = { page: 1, limit: 10 };
      const folderIds = [1, 2];

      contextService.currentMerchant.mockResolvedValue(mockMerchant);
      const mockQB = createMockQueryBuilder();
      mockQB.getMany.mockResolvedValue([mockImage]);
      imageUploadRepo.createQueryBuilder.mockReturnValue(mockQB);

      await service.showAllWithFolder(1, options, 'false', folderIds);

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        'imageUploadFolder.id IN(:...folderIds)',
        { folderIds },
      );
    });
  });
});
