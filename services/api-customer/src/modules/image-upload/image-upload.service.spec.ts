import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadService } from './image-upload.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageUpload } from '../../model/image-upload.entity';
import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { S3Service } from '../../modules-v1/s3/s3.service';
import { getQueueToken } from '@nestjs/bull';

// Mock sharp globally
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    metadata: jest.fn().mockResolvedValue({ format: 'jpeg' }),
    jpeg: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    withMetadata: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image')),
  }));
});

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let imageUploadRepo: any;
  let imageUploadFolderRepo: any;
  let s3Service: any;
  let queue: any;
  let mockS3Instance: any;

  beforeEach(async () => {
    imageUploadRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      update: jest.fn(),
    };

    imageUploadFolderRepo = {
      findOne: jest.fn(),
    };

    s3Service = {
      uploadS3: jest.fn(),
    };

    queue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageUploadService,
        { provide: getRepositoryToken(ImageUpload), useValue: imageUploadRepo },
        {
          provide: getRepositoryToken(ImageUploadFolder),
          useValue: imageUploadFolderRepo,
        },
        { provide: S3Service, useValue: s3Service },
        { provide: getQueueToken('image-upload-consumer'), useValue: queue },
      ],
    }).compile();

    service = module.get<ImageUploadService>(ImageUploadService);

    // Setup Mock S3
    mockS3Instance = {
      upload: jest.fn((params, cb) =>
        cb(null, { Location: 's3-loc', Key: 's3-key' }),
      ),
      deleteObject: jest.fn((params, cb) => cb(null, {})),
      getSignedUrlPromise: jest.fn().mockResolvedValue('http://signed-url'),
      headObject: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(true),
      }),
    };
    jest.spyOn(service, 'getS3').mockReturnValue(mockS3Instance);

    process.env.AWS_S3_BUCKET = 'test-bucket';
    process.env.DEMO_MERCHANT_SLUG = 'demo-merchant';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload file using injected S3Service', async () => {
      const file: any = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      };
      const dto: any = { imageUploadFolderId: 1 };

      s3Service.uploadS3.mockResolvedValue({ Location: 'loc', key: 'key' });
      imageUploadFolderRepo.findOne.mockResolvedValue({
        id: 1,
        merchant: { slug: 'test' },
      });
      imageUploadRepo.save.mockResolvedValue({ id: 1, url: 'loc' });

      const result = await service.upload(file, dto);

      expect(s3Service.uploadS3).toHaveBeenCalled();
      expect(imageUploadRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should look up demo merchant and add to queue', async () => {
      const file: any = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      };
      const dto: any = { imageUploadFolderId: 1 };

      s3Service.uploadS3.mockResolvedValue({ Location: 'loc', key: 'key' });
      imageUploadFolderRepo.findOne.mockResolvedValue({
        id: 1,
        merchant: { slug: 'demo-merchant' },
      });
      imageUploadRepo.save.mockResolvedValue({ id: 1, url: 'loc' });
      process.env.REDIS_HOST = 'localhost';

      await service.upload(file, dto);

      expect(queue.add).toHaveBeenCalledWith(
        'soft-delete-image-upload-repository',
        { id: 1 },
        expect.any(Object),
      );
    });
  });

  describe('uploadWithoutFolder', () => {
    it('should upload using local S3 logic and sharp', async () => {
      const file: any = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      };
      imageUploadRepo.save.mockResolvedValue({ id: 1, name: 'key' });

      const result = await service.uploadWithoutFolder(file);

      expect(mockS3Instance.upload).toHaveBeenCalled();
      expect(imageUploadRepo.save).toHaveBeenCalled();
      expect(result.url).toBe('http://signed-url');
    });

    it('should use transaction manager if provided', async () => {
      const file: any = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      };
      const manager: any = {
        save: jest.fn().mockResolvedValue({ id: 1, name: 'key' }),
      };

      await service.uploadWithoutFolder(file, manager);
      expect(manager.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update image upload', async () => {
      const dto: any = { imageUploadFolderId: 2 };
      imageUploadRepo.findOne.mockResolvedValue({ id: 1 });
      imageUploadFolderRepo.findOne.mockResolvedValue({ id: 2 });
      imageUploadRepo.save.mockResolvedValue({
        id: 1,
        name: 'key',
        imageUploadFolder: { id: 2 },
      });

      const result = await service.update(1, dto, 'valid-merchant');
      expect(imageUploadRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error for demo merchant', async () => {
      await expect(
        service.update(1, {} as any, 'demo-merchant'),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      await service.delete(1, 'valid-merchant');
      expect(imageUploadRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw for demo merchant', async () => {
      await expect(service.delete(1, 'demo-merchant')).rejects.toThrow();
    });
  });

  describe('restore', () => {
    it('should restore and update', async () => {
      const dto: any = { imageUploadFolderId: 2 };
      imageUploadRepo.findOne.mockResolvedValue({ id: 1 });
      imageUploadFolderRepo.findOne.mockResolvedValue({ id: 2 });
      imageUploadRepo.save.mockResolvedValue({ id: 1 });

      await service.restore(1, dto, 'valid-merchant');
      expect(imageUploadRepo.restore).toHaveBeenCalledWith(1);
      expect(imageUploadRepo.save).toHaveBeenCalled();
    });

    it('should throw for demo merchant', async () => {
      await expect(
        service.restore(1, {} as any, 'demo-merchant'),
      ).rejects.toThrow();
    });
  });

  describe('destroy', () => {
    it('should delete from S3 and hard update DB', async () => {
      imageUploadRepo.findOne.mockResolvedValue({ id: 1, name: 'key' });
      imageUploadRepo.save.mockResolvedValue({ id: 1 });

      await service.destroy(1, 'valid-merchant');

      expect(mockS3Instance.deleteObject).toHaveBeenCalled();
      expect(imageUploadRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ onDeletePermanent: true }),
      );
    });

    it('should throw for demo merchant', async () => {
      await expect(service.destroy(1, 'demo-merchant')).rejects.toThrow();
    });
  });

  describe('validateS3Object', () => {
    it('should return true if object exists', async () => {
      const result = await service.validateS3Object('key', 'bucket');
      expect(result).toBe(true);
    });

    it('should return false if error occurs', async () => {
      mockS3Instance.headObject.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('fail')),
      });
      const result = await service.validateS3Object('key', 'bucket');
      expect(result).toBe(false);
    });
  });

  describe('getSignedUrl', () => {
    it('should return default if key is empty', async () => {
      const result = await service.getSignedUrl('');
      expect(result).toBe(null);
    });

    it('should clean keys and generate url', async () => {
      const result = await service.getSignedUrl('s3://bucket/folder/key.jpg');
      expect(mockS3Instance.getSignedUrlPromise).toHaveBeenCalledWith(
        'getObject',
        expect.objectContaining({ Key: 'folder/key.jpg' }),
      );
      expect(result).toBe('http://signed-url');
    });
  });
});
