import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadService } from './image-upload.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageUpload } from '../../model/image-upload.entity';
import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { S3Service } from '@/modules-v1/s3/s3.service';
import { CreateImageUploadDto } from './dto/create-image-upload.dto';
import { ImageUploadDto } from './dto/image-upload.dto';
import { UpdateImageUploadDto } from './dto/update-image-upload.dto';
import { Logger } from '@nestjs/common';

// Mocks for external libs used inside the service
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('signed-url'),
}));

jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(({ params }) => ({
    done: jest.fn().mockResolvedValue({ ETag: 'etag', Key: params.Key }),
  })),
}));

jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    metadata: jest.fn().mockResolvedValue({ format: 'jpeg' }),
    jpeg: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    withMetadata: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('optimized')),
  }));
});

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let imageUploadRepo: any;
  let imageUploadFolderRepo: any;
  let s3Service: any;

  const mockFile = {
    originalname: 'test.jpg',
    buffer: Buffer.from('test-image'),
    size: 1024,
    mimetype: 'image/jpeg',
  };

  const mockFolder = {
    id: 1,
    name: 'Test Folder',
    merchant: { id: 1, slug: 'test-merchant' },
  } as ImageUploadFolder;

  const mockImageUpload = {
    id: 1,
    name: 'test-123456789.jpg',
    url: 'https://bucket.s3.amazonaws.com/test-123456789.jpg',
    imageName: 'test.jpg',
    size: '1024',
    imageUploadFolder: mockFolder,
  } as ImageUpload;

  beforeEach(async () => {
    const mockImageUploadRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      update: jest.fn(),
    };

    const mockImageUploadFolderRepo = {
      findOne: jest.fn(),
    };

    const mockS3Service = {
      uploadS3: jest.fn(),
      deleteS3File: jest.fn(),
      getPresignedUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageUploadService,
        {
          provide: getRepositoryToken(ImageUpload),
          useValue: mockImageUploadRepo,
        },
        {
          provide: getRepositoryToken(ImageUploadFolder),
          useValue: mockImageUploadFolderRepo,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<ImageUploadService>(ImageUploadService);
    imageUploadRepo = module.get(getRepositoryToken(ImageUpload));
    imageUploadFolderRepo = module.get(getRepositoryToken(ImageUploadFolder));
    s3Service = module.get(S3Service);

    // Set required environment variables
    process.env.AWS_S3_BUCKET = 'test-bucket';
    process.env.AWS_REGION = 'ap-southeast-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    process.env.DEFAULT_IMAGE_URL = 'https://example.com/default.jpg';

    jest.clearAllMocks();
    jest.spyOn(Logger, 'log').mockImplementation();
    jest.spyOn(Logger, 'error').mockImplementation();
  });

  afterEach(() => {
    delete process.env.AWS_S3_BUCKET;
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.DEFAULT_IMAGE_URL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload an image to public folder', async () => {
      const createDto = { imageUploadFolderId: 1 } as CreateImageUploadDto;
      const s3Response = {
        Location: 'https://test-bucket.s3.amazonaws.com/test.jpg',
        key: 'test-123456789.jpg',
      };

      imageUploadFolderRepo.findOne.mockResolvedValue(mockFolder);
      s3Service.uploadS3.mockResolvedValue(s3Response);
      jest
        .spyOn(CreateImageUploadDto, 'toEntity')
        .mockReturnValue(mockImageUpload);
      imageUploadRepo.save.mockResolvedValue(mockImageUpload);

      const result = await service.upload(mockFile, createDto);

      expect(imageUploadFolderRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['merchant'],
      });
      expect(s3Service.uploadS3).toHaveBeenCalled();
      expect(imageUploadRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should not transform URLs for public images', async () => {
      const createDto = { imageUploadFolderId: 1 } as CreateImageUploadDto;
      const s3Response = {
        Location: 'https://test-bucket.s3.amazonaws.com/test.jpg',
        key: 'test-123456789.jpg',
      };

      imageUploadFolderRepo.findOne.mockResolvedValue(mockFolder);
      s3Service.uploadS3.mockResolvedValue(s3Response);
      jest
        .spyOn(CreateImageUploadDto, 'toEntity')
        .mockReturnValue(mockImageUpload);
      imageUploadRepo.save.mockResolvedValue(mockImageUpload);
      const transformSpy = jest.spyOn(service, 'transformImageUrls');
      await service.upload(mockFile, createDto);
      // upload() currently uses isPublic = true, so transform should not be called
      expect(transformSpy).not.toHaveBeenCalled();
    });
  });

  describe('uploadWithoutFolder', () => {
    it('should upload image without folder and transform URLs', async () => {
      const uploadS3Result = {
        Location: 'https://test-bucket.s3.amazonaws.com/test.jpg',
        key: 'test-123456789.jpg',
      } as any;

      jest.spyOn(service, 'uploadS3').mockResolvedValue(uploadS3Result);
      jest
        .spyOn(CreateImageUploadDto, 'toEntity')
        .mockReturnValue(mockImageUpload);
      imageUploadRepo.save.mockResolvedValue(mockImageUpload);
      jest
        .spyOn(ImageUploadDto, 'fromEntity')
        .mockReturnValue(mockImageUpload as any);
      jest
        .spyOn(service, 'transformImageUrls')
        .mockResolvedValue(mockImageUpload);

      const result = await service.uploadWithoutFolder(mockFile);

      expect(service.uploadS3).toHaveBeenCalled();
      expect(imageUploadRepo.save).toHaveBeenCalled();
      expect(service.transformImageUrls).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should use entity manager when provided', async () => {
      const mockManager = {
        save: jest.fn().mockResolvedValue(mockImageUpload),
      } as any;

      jest.spyOn(service, 'uploadS3').mockResolvedValue({
        Location: 'https://test-bucket.s3.amazonaws.com/test.jpg',
        key: 'test-123456789.jpg',
      } as any);
      jest
        .spyOn(CreateImageUploadDto, 'toEntity')
        .mockReturnValue(mockImageUpload);
      jest
        .spyOn(ImageUploadDto, 'fromEntity')
        .mockReturnValue(mockImageUpload as any);
      jest
        .spyOn(service, 'transformImageUrls')
        .mockResolvedValue(mockImageUpload);

      await service.uploadWithoutFolder(mockFile, mockManager);

      expect(mockManager.save).toHaveBeenCalled();
      expect(imageUploadRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an image upload', async () => {
      const updateDto = { imageUploadFolderId: 2 } as UpdateImageUploadDto;
      const newFolder = { id: 2, name: 'New Folder' } as ImageUploadFolder;
      const updatedImage = { ...mockImageUpload, imageUploadFolder: newFolder };

      imageUploadRepo.findOne.mockResolvedValue(mockImageUpload);
      imageUploadFolderRepo.findOne.mockResolvedValue(newFolder);
      jest
        .spyOn(ImageUploadDto, 'toEntity')
        .mockReturnValue({ imageUploadFolder: newFolder } as any);
      imageUploadRepo.save.mockResolvedValue(updatedImage);
      jest.spyOn(service, 'transformImageUrls').mockResolvedValue(updatedImage);

      const result = await service.update(1, updateDto);

      expect(imageUploadRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(imageUploadFolderRepo.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(imageUploadRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should soft delete an image', async () => {
      imageUploadRepo.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(imageUploadRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result.affected).toBe(1);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted image', async () => {
      const updateDto = { imageUploadFolderId: 1 } as UpdateImageUploadDto;

      imageUploadRepo.restore.mockResolvedValue({ affected: 1 });
      imageUploadRepo.findOne.mockResolvedValue(mockImageUpload);
      imageUploadFolderRepo.findOne.mockResolvedValue(mockFolder);
      jest
        .spyOn(ImageUploadDto, 'toEntity')
        .mockReturnValue({ imageUploadFolder: mockFolder } as any);
      imageUploadRepo.save.mockResolvedValue(mockImageUpload);
      jest
        .spyOn(service, 'transformImageUrls')
        .mockResolvedValue(mockImageUpload);

      const result = await service.restore(1, updateDto);

      expect(imageUploadRepo.restore).toHaveBeenCalledWith(1);
      expect(imageUploadRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBeDefined();
    });
  });

  describe('destroy', () => {
    it('should permanently delete an image from S3 and database', async () => {
      const deletedImage = { ...mockImageUpload, onDeletePermanent: true };

      imageUploadRepo.findOne.mockResolvedValue(mockImageUpload);
      jest.spyOn(service, 'getS3Client').mockReturnValue({
        send: jest.fn().mockResolvedValue({}),
      } as any);
      jest
        .spyOn(ImageUploadDto, 'toEntity')
        .mockReturnValue({ onDeletePermanent: true } as any);
      imageUploadRepo.save.mockResolvedValue(deletedImage);
      jest.spyOn(service, 'transformImageUrls').mockResolvedValue(deletedImage);

      const result = await service.destroy(1);

      expect(imageUploadRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(result).toBeDefined();
    });

    it('should handle S3 delete error and still update database', async () => {
      const erroredImage = { ...mockImageUpload };

      imageUploadRepo.findOne.mockResolvedValue(erroredImage);
      const send = jest.fn().mockRejectedValue(new Error('S3 delete fail'));
      jest.spyOn(service, 'getS3Client').mockReturnValue({ send } as any);
      jest
        .spyOn(ImageUploadDto, 'toEntity')
        .mockReturnValue({ onDeletePermanent: true } as any);
      imageUploadRepo.save.mockResolvedValue({
        ...erroredImage,
        onDeletePermanent: true,
      });
      jest
        .spyOn(service, 'transformImageUrls')
        .mockResolvedValue({ ...erroredImage, onDeletePermanent: true } as any);

      const result = await service.destroy(1);

      expect(send).toHaveBeenCalled();
      expect(imageUploadRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('onDeletePermanent', true);
    });
  });

  describe('transformImageUrls', () => {
    it('should transform image URL with signed URL', async () => {
      const signedUrl = 'https://presigned-url.com/test.jpg';
      jest.spyOn(service, 'getSignedUrl').mockResolvedValue(signedUrl);
      imageUploadRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.transformImageUrls(mockImageUpload);

      expect(service.getSignedUrl).toHaveBeenCalledWith(mockImageUpload.url);
      expect(imageUploadRepo.update).toHaveBeenCalledWith(1, {
        url: signedUrl,
      });
      expect(result.url).toBe(signedUrl);
    });

    it('should use name as fallback when url is missing', async () => {
      const imageWithoutUrl = { ...mockImageUpload, url: null };
      const signedUrl = 'https://presigned-url.com/test.jpg';
      jest.spyOn(service, 'getSignedUrl').mockResolvedValue(signedUrl);
      imageUploadRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.transformImageUrls(imageWithoutUrl);

      expect(service.getSignedUrl).toHaveBeenCalledWith(mockImageUpload.name);
      expect(result.url).toBe(signedUrl);
    });

    it('should return default image URL on error', async () => {
      jest
        .spyOn(service, 'getSignedUrl')
        .mockRejectedValue(new Error('S3 error'));

      const result = await service.transformImageUrls(mockImageUpload);

      expect(result.url).toBe(process.env.DEFAULT_IMAGE_URL);
    });

    it('should return null when imageUpload is null', async () => {
      const result = await service.transformImageUrls(null);
      expect(result).toBeNull();
    });

    it('should not update DB when no id present', async () => {
      const noId = { url: 'key-only' } as any;
      jest.spyOn(service, 'getSignedUrl').mockResolvedValue('signed');
      const result = await service.transformImageUrls(noId);
      expect(result.url).toBe('signed');
      expect(imageUploadRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL for valid key', async () => {
      const key = 'test-123456789.jpg';
      jest.spyOn(service, 'getS3Client').mockReturnValue({
        send: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await service.getSignedUrl(key);

      expect(result).toBeDefined();
    });

    it('should return default image URL for empty key', async () => {
      const result = await service.getSignedUrl('');

      expect(result).toBe(process.env.DEFAULT_IMAGE_URL);
    });

    it('should handle S3 errors gracefully', async () => {
      // Force presigner to throw to enter catch path
      const { getSignedUrl } = jest.requireMock(
        '@aws-sdk/s3-request-presigner',
      );
      (getSignedUrl as jest.Mock).mockRejectedValueOnce(
        new Error('presign error'),
      );
      jest.spyOn(service, 'getS3Client').mockReturnValue({} as any);

      const result = await service.getSignedUrl('test-key.jpg');

      expect(result).toBe(process.env.DEFAULT_IMAGE_URL);
    });

    it('should clean s3:// prefixed keys and remove duplicate segments', async () => {
      const { getSignedUrl } = jest.requireMock(
        '@aws-sdk/s3-request-presigner',
      );
      const mockGetSignedUrl = getSignedUrl as jest.Mock;
      mockGetSignedUrl.mockClear();
      jest.spyOn(service, 'getS3Client').mockReturnValue({} as any);

      await service.getSignedUrl(
        's3://bucket/images/images/test-12345678901.jpg',
      );

      const calledWithCommand = mockGetSignedUrl.mock.calls[0][1];
      expect(calledWithCommand.input.Key).toBe('test-12345678901.jpg');
    });

    it('should preserve cleaned path when last segment not timestamp-like', async () => {
      const { getSignedUrl } = jest.requireMock(
        '@aws-sdk/s3-request-presigner',
      );
      const mockGetSignedUrl = getSignedUrl as jest.Mock;
      mockGetSignedUrl.mockClear();
      jest.spyOn(service, 'getS3Client').mockReturnValue({} as any);

      await service.getSignedUrl('s3://bucket/a/a/b/c.png');

      const calledWithCommand = mockGetSignedUrl.mock.calls[0][1];
      expect(calledWithCommand.input.Key).toBe('a/b/c.png');
    });

    it('caps expiresIn to 7 days', async () => {
      const { getSignedUrl } = jest.requireMock(
        '@aws-sdk/s3-request-presigner',
      );
      const mockGetSignedUrl = getSignedUrl as jest.Mock;
      mockGetSignedUrl.mockClear();
      jest.spyOn(service, 'getS3Client').mockReturnValue({} as any);

      await service.getSignedUrl('key.jpg', 99999999);

      const optionsArg = mockGetSignedUrl.mock.calls[0][2];
      expect(optionsArg).toEqual({ expiresIn: 604800 });
    });
  });

  describe('uploadS3', () => {
    it('should build sanitized key and return correct location', async () => {
      jest.spyOn(service, 'getS3Client').mockReturnValue({} as any);

      const result = await service.uploadS3(
        Buffer.from('raw'),
        'bucketname',
        'a/b \\c*d.jpg',
      );

      expect(result).toHaveProperty('Location');
      expect(result).toHaveProperty('key');
      // ensure no slashes/backslashes remain in key
      expect(result.key).not.toMatch(/[\\/]/);
    });

    it('handles upload error', async () => {
      const { Upload } = jest.requireMock('@aws-sdk/lib-storage');
      (Upload as jest.Mock).mockImplementationOnce(() => ({
        done: jest.fn().mockRejectedValue(new Error('upload fail')),
      }));
      jest.spyOn(service, 'getS3Client').mockReturnValue({} as any);

      await expect(
        service.uploadS3(Buffer.from('raw'), 'bucket', 'name.jpg'),
      ).rejects.toThrow('upload fail');
    });
  });

  describe('validateS3Object', () => {
    it('should return true for valid S3 object', async () => {
      jest.spyOn(service, 'getS3Client').mockReturnValue({
        send: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await service.validateS3Object(
        'test-key.jpg',
        'test-bucket',
      );

      expect(result).toBe(true);
    });

    it('should return false for invalid S3 object', async () => {
      jest.spyOn(service, 'getS3Client').mockReturnValue({
        send: jest.fn().mockRejectedValue(new Error('Not found')),
      } as any);

      const result = await service.validateS3Object(
        'invalid-key.jpg',
        'test-bucket',
      );

      expect(result).toBe(false);
    });
  });

  describe('getS3Client', () => {
    it('should create S3 client with credentials', () => {
      const client = service.getS3Client();

      expect(client).toBeDefined();
    });
  });
});
