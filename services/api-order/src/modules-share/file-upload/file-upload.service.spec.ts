import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileUpload } from '../../model/file-upload.entity';
import { getQueueToken } from '@nestjs/bull';
import { S3Service } from '@/modules-share/s3/s3.service';
import { FileUploadType } from '@/model/enum/file-upload.enum';
import { NotFoundException } from '@nestjs/common';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let repo: any;
  let queue: any;
  let s3Service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: getRepositoryToken(FileUpload),
          useValue: {
            save: jest.fn(),
            softDelete: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getQueueToken('file-upload-consumer'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadS3: jest.fn(),
            getPresignedUrl: jest.fn(),
            deleteS3File: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
    repo = module.get(getRepositoryToken(FileUpload));
    queue = module.get(getQueueToken('file-upload-consumer'));
    s3Service = module.get(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload file successfully', async () => {
      const file: any = {
        originalname: 'test.png',
        size: 100,
        buffer: Buffer.from(''),
      };
      s3Service.uploadS3.mockResolvedValue({ Location: 'url', key: 'key' });
      repo.save.mockResolvedValue({ id: 1, name: 'key' });
      s3Service.getPresignedUrl.mockResolvedValue('presigned-url');

      const result = await service.upload(file);
      expect(s3Service.uploadS3).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.url).toBe('presigned-url');
    });

    it('should add cleanup job if temp file', async () => {
      const file: any = {
        originalname: 'test.png',
        size: 100,
        buffer: Buffer.from(''),
      };
      s3Service.uploadS3.mockResolvedValue({ Location: 'url', key: 'key' });
      repo.save.mockResolvedValue({ id: 1, name: 'key' });
      process.env.REDIS_HOST = 'localhost'; // Ensure logic runs

      await service.upload(file, undefined, FileUploadType.TEMP);
      expect(queue.add).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      await service.delete(1);
      expect(repo.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('destroy', () => {
    it('should invalid s3 file and update record', async () => {
      repo.findOne.mockResolvedValue({ id: 1, name: 'key' });
      repo.save.mockResolvedValue({ id: 1 });

      await service.destroy(1);
      expect(s3Service.deleteS3File).toHaveBeenCalledWith('key');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('setTypeToPermanent', () => {
    it('should update type', async () => {
      repo.find.mockResolvedValue([{ id: 1 }]);
      repo.update.mockResolvedValue({ affected: 1 });

      const result = await service.setTypeToPermanent([1]);
      expect(result.affected).toBe(1);
    });

    it('should throw NotFoundException if no files', async () => {
      repo.find.mockResolvedValue([]);
      await expect(service.setTypeToPermanent([1])).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFiles', () => {
    it('should find files', async () => {
      repo.find.mockResolvedValue([]);
      await service.getFiles([1]);
      expect(repo.find).toHaveBeenCalled();
    });
  });
});
