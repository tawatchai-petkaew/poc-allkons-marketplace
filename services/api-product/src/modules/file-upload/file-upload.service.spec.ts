import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileUpload } from '../../model/file-upload.entity';
import { getQueueToken } from '@nestjs/bull';
import { S3Service } from '@/modules-v1/s3/s3.service';
import { FileUploadType } from '@/model/enum/file-upload.enum';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { FileUploadDto } from './dto/file-upload.dto';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let fileUploadRepo: any;
  let fileUploadQueue: any;
  let s3Service: any;

  const mockFile = {
    originalname: 'test.pdf',
    size: 1024,
    buffer: Buffer.from('test'),
    mimetype: 'application/pdf',
  } as Express.Multer.File;

  const mockFileUpload = {
    id: 1,
    name: 'uploads/test.pdf',
    url: 'https://bucket.s3.amazonaws.com/uploads/test.pdf',
    fileName: 'test.pdf',
    size: '1024',
    type: FileUploadType.PERMANENT,
  } as FileUpload;

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
      update: jest.fn(),
    };

    const mockQueue = {
      add: jest.fn(),
    };

    const mockS3Service = {
      uploadS3: jest.fn(),
      deleteS3File: jest.fn(),
      getPresignedUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: getRepositoryToken(FileUpload),
          useValue: mockRepository,
        },
        {
          provide: getQueueToken('file-upload-consumer'),
          useValue: mockQueue,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
    fileUploadRepo = module.get(getRepositoryToken(FileUpload));
    fileUploadQueue = module.get(getQueueToken('file-upload-consumer'));
    s3Service = module.get(S3Service);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload a permanent file and return public URL', async () => {
      const s3Response = {
        Location: 'https://bucket.s3.amazonaws.com/uploads/test.pdf',
        key: 'uploads/test.pdf',
      };

      s3Service.uploadS3.mockResolvedValue(s3Response);
      fileUploadRepo.save.mockResolvedValue(mockFileUpload);
      jest.spyOn(FileUploadDto, 'fromEntity').mockReturnValue(mockFileUpload as any);
      jest.spyOn(CreateFileUploadDto, 'toEntity').mockReturnValue(mockFileUpload);

      const result = await service.upload(mockFile, 'uploads', FileUploadType.PERMANENT, true);

      expect(s3Service.uploadS3).toHaveBeenCalledWith(
        mockFile.buffer,
        process.env.AWS_S3_BUCKET,
        'test.pdf',
        'uploads',
        'application/pdf',
        true,
      );
      expect(fileUploadRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should upload a temp file and schedule deletion job', async () => {
      const s3Response = {
        Location: 'https://bucket.s3.amazonaws.com/uploads/test.pdf',
        key: 'uploads/test.pdf',
      };
      const tempFile = { ...mockFileUpload, type: FileUploadType.TEMP };

      s3Service.uploadS3.mockResolvedValue(s3Response);
      fileUploadRepo.save.mockResolvedValue(tempFile);
      jest.spyOn(FileUploadDto, 'fromEntity').mockReturnValue(tempFile as any);
      jest.spyOn(CreateFileUploadDto, 'toEntity').mockReturnValue(tempFile as any);
      jest.spyOn(service, 'removeTempFileJob').mockResolvedValue(undefined);

      process.env.REDIS_HOST = 'localhost';

      const result = await service.upload(mockFile, 'uploads', FileUploadType.TEMP, true);

      expect(service.removeTempFileJob).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();

      delete process.env.REDIS_HOST;
    });

    it('should upload a private file and return presigned URL', async () => {
      const s3Response = {
        Location: 'https://bucket.s3.amazonaws.com/uploads/test.pdf',
        key: 'uploads/test.pdf',
      };
      const presignedUrl = 'https://presigned-url.com/test.pdf';

      s3Service.uploadS3.mockResolvedValue(s3Response);
      s3Service.getPresignedUrl.mockResolvedValue(presignedUrl);
      fileUploadRepo.save.mockResolvedValue(mockFileUpload);
      jest.spyOn(FileUploadDto, 'fromEntity').mockReturnValue(mockFileUpload as any);
      jest.spyOn(CreateFileUploadDto, 'toEntity').mockReturnValue(mockFileUpload);

      const result = await service.upload(mockFile, 'uploads', FileUploadType.PERMANENT, false);

      expect(s3Service.getPresignedUrl).toHaveBeenCalledWith('uploads/test.pdf');
      expect(result.url).toBe(presignedUrl);
    });
  });

  describe('delete', () => {
    it('should soft delete a file', async () => {
      fileUploadRepo.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(fileUploadRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result.affected).toBe(1);
    });
  });

  describe('destroy', () => {
    it('should permanently delete a file from S3 and mark as deleted', async () => {
      const deletedFile = { ...mockFileUpload, onDeletePermanent: true };

      fileUploadRepo.findOne.mockResolvedValue(mockFileUpload);
      s3Service.deleteS3File.mockResolvedValue(undefined);
      jest.spyOn(FileUploadDto, 'toEntity').mockReturnValue({ onDeletePermanent: true } as any);
      fileUploadRepo.save.mockResolvedValue(deletedFile);

      const result = await service.destroy(1);

      expect(fileUploadRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(s3Service.deleteS3File).toHaveBeenCalledWith('uploads/test.pdf');
      expect(fileUploadRepo.save).toHaveBeenCalled();
      expect(result.onDeletePermanent).toBe(true);
    });
  });

  describe('setTypeToPermanent', () => {
    it('should update file types to permanent', async () => {
      const ids = [1, 2, 3];
      const files = [
        { id: 1, type: FileUploadType.TEMP },
        { id: 2, type: FileUploadType.TEMP },
        { id: 3, type: FileUploadType.TEMP },
      ];

      fileUploadRepo.find.mockResolvedValue(files);
      fileUploadRepo.update.mockResolvedValue({ affected: 3 });

      const result = await service.setTypeToPermanent(ids);

      expect(fileUploadRepo.find).toHaveBeenCalledWith({ where: { id: expect.anything() } });
      expect(fileUploadRepo.update).toHaveBeenCalledWith(
        { id: expect.anything() },
        { type: FileUploadType.PERMANENT },
      );
      expect(result.affected).toBe(3);
    });

    it('should throw NotFoundException when no files found', async () => {
      const ids = [999];

      fileUploadRepo.find.mockResolvedValue([]);

      await expect(service.setTypeToPermanent(ids)).rejects.toThrow(NotFoundException);
      expect(fileUploadRepo.update).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const ids = [1];

      fileUploadRepo.find.mockRejectedValue(new Error('Database error'));

      await expect(service.setTypeToPermanent(ids)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('removeTempFileJob', () => {
    it('should add job to queue when Redis is configured', async () => {
      process.env.REDIS_HOST = 'localhost';

      await service.removeTempFileJob(1);

      expect(fileUploadQueue.add).toHaveBeenCalledWith(
        'hard-delete-temp-file-upload',
        { id: 1 },
        expect.objectContaining({
          delay: 60000,
          attempts: 3,
        }),
      );

      delete process.env.REDIS_HOST;
    });

    it('should not add job when Redis is not configured', async () => {
      delete process.env.REDIS_HOST;

      await service.removeTempFileJob(1);

      expect(fileUploadQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('getFiles', () => {
    it('should return files by IDs', async () => {
      const ids = [1, 2];
      const files = [
        { id: 1, name: 'file1.pdf' },
        { id: 2, name: 'file2.pdf' },
      ];

      fileUploadRepo.find.mockResolvedValue(files);

      const result = await service.getFiles(ids);

      expect(fileUploadRepo.find).toHaveBeenCalledWith({ where: { id: expect.anything() } });
      expect(result).toEqual(files);
    });
  });
});
