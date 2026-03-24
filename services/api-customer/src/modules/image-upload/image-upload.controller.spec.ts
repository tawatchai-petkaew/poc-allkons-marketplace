import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadController } from './image-upload.controller';
import { ImageUploadService } from './image-upload.service';
import { HttpException } from '@nestjs/common';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

describe('ImageUploadController', () => {
  let controller: ImageUploadController;
  let service: any;

  beforeEach(async () => {
    const mockService = {
      upload: jest.fn(),
      update: jest.fn(),
      restore: jest.fn(),
      delete: jest.fn(),
      destroy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageUploadController],
      providers: [
        {
          provide: ImageUploadService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ImageUploadController>(ImageUploadController);
    service = module.get<ImageUploadService>(ImageUploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should upload file', async () => {
      service.upload.mockResolvedValue({});
      await controller.upload({}, {} as any);
      expect(service.upload).toHaveBeenCalled();
    });

    it('should throw HttpException on error', async () => {
      service.upload.mockRejectedValue(new Error('error'));
      await expect(controller.upload({}, {} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('update', () => {
    it('should update', async () => {
      service.update.mockResolvedValue({});
      await controller.update('1', {} as any, 'slug');
      expect(service.update).toHaveBeenCalledWith(
        1,
        expect.any(Object),
        'slug',
      );
    });

    it('should throw HttpException on error', async () => {
      service.update.mockRejectedValue(new Error('error'));
      await expect(controller.update('1', {} as any, 'slug')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('restore', () => {
    it('should restore', async () => {
      service.restore.mockResolvedValue({});
      await controller.restore('1', {} as any, 'slug');
      expect(service.restore).toHaveBeenCalledWith(
        1,
        expect.any(Object),
        'slug',
      );
    });

    it('should throw HttpException on error', async () => {
      service.restore.mockRejectedValue(new Error('error'));
      await expect(controller.restore('1', {} as any, 'slug')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('delete', () => {
    it('should delete', async () => {
      service.delete.mockResolvedValue({});
      await controller.delete('1', 'slug');
      expect(service.delete).toHaveBeenCalledWith(1, 'slug');
    });

    it('should throw HttpException on error', async () => {
      service.delete.mockRejectedValue(new Error('error'));
      await expect(controller.delete('1', 'slug')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('destroy', () => {
    it('should destroy', async () => {
      service.destroy.mockResolvedValue({});
      await controller.destroy('1', 'slug');
      expect(service.destroy).toHaveBeenCalledWith(1, 'slug');
    });

    it('should throw HttpException on error', async () => {
      service.destroy.mockRejectedValue(new Error('error'));
      await expect(controller.destroy('1', 'slug')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
