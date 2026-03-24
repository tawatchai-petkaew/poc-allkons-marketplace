import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadFolderController } from './image-upload-folder.controller';
import { ImageUploadFolderService } from './image-upload-folder.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpException } from '@nestjs/common';

describe('ImageUploadFolderController', () => {
  let controller: ImageUploadFolderController;
  let service: any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      showAll: jest.fn(),
      showAllWithDeleted: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      showAllFolder: jest.fn(),
      showAllWithFolder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageUploadFolderController],
      providers: [
        {
          provide: ImageUploadFolderService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ImageUploadFolderController>(
      ImageUploadFolderController,
    );
    service = module.get<ImageUploadFolderService>(ImageUploadFolderService);
  });

  const mockRequestMerchant = {
    id: 1,
    uuid: 'uuid',
    slug: 'slug',
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create folder', async () => {
      service.create.mockResolvedValue({});
      await controller.create({} as any);
      expect(service.create).toHaveBeenCalled();
    });

    it('should throw HttpException on error', async () => {
      service.create.mockRejectedValue(new Error('error'));
      await expect(controller.create({} as any)).rejects.toThrow(HttpException);
    });
  });

  describe('showAll', () => {
    it('should return all', async () => {
      await controller.showAll({});
      expect(service.showAll).toHaveBeenCalled();
    });
  });

  describe('showAllWithDeleted', () => {
    it('should return all with deleted', async () => {
      await controller.showAllWithDeleted({});
      expect(service.showAllWithDeleted).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update', async () => {
      service.update.mockResolvedValue({});
      await controller.update('1', {} as any);
      expect(service.update).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should throw HttpException on error', async () => {
      service.update.mockRejectedValue(new Error('error'));
      await expect(controller.update('1', {} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('delete', () => {
    it('should delete', async () => {
      service.delete.mockResolvedValue({});
      await controller.delete('1');
      expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException on error', async () => {
      service.delete.mockRejectedValue(new Error('error'));
      await expect(controller.delete('1')).rejects.toThrow(HttpException);
    });
  });

  describe('showAllFolder', () => {
    it('should return folders', async () => {
      await controller.showAllFolder(mockRequestMerchant);
      expect(service.showAllFolder).toHaveBeenCalled();
    });
  });

  describe('showAllWithFolder', () => {
    it('should return images in folder', async () => {
      await controller.showAllWithFolder(
        1,
        10,
        'true',
        [1],
        '123',
        mockRequestMerchant,
      );
      expect(service.showAllWithFolder).toHaveBeenCalledWith(
        123,
        { page: 1, limit: 10 },
        'true',
        [1],
      );
    });
  });
});
