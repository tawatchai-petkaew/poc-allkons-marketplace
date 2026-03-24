import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileUpload } from '../../model/file-upload.entity';
import { S3Service } from '../../modules-v1/s3/s3.service';
import { getQueueToken } from '@nestjs/bull';
import { FileUploadType } from '../../model/enum/file-upload.enum';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { In } from 'typeorm';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let s3Service: any;
  let queue: any;
  let repo: any;

  beforeEach(async () => {
    repo = {
      save: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    s3Service = {
      uploadS3: jest.fn(),
      getPresignedUrl: jest.fn(),
      deleteS3File: jest.fn(),
    };

    queue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        { provide: getRepositoryToken(FileUpload), useValue: repo },
        { provide: S3Service, useValue: s3Service },
        { provide: getQueueToken('file-upload-consumer'), useValue: queue },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload permanent file successfully', async () => {
      const file: any = {
        originalname: 'test.png',
        size: 1000,
        buffer: Buffer.from('test'),
      };
      s3Service.uploadS3.mockResolvedValue({
        Location: 'http://s3/test.png',
        key: 'test.png',
      });
      repo.save.mockResolvedValue({
        id: 1,
        name: 'test.png',
        url: 'http://s3/test.png',
      });
      s3Service.getPresignedUrl.mockResolvedValue('http://presigned/test.png');

      const result = await service.upload(file, 'folder');

      expect(s3Service.uploadS3).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.url).toBe('http://presigned/test.png');
    });

    it('should upload temp file and add to queue', async () => {
      const file: any = {
        originalname: 'test.png',
        size: 1000,
        buffer: Buffer.from('test'),
      };
      s3Service.uploadS3.mockResolvedValue({
        Location: 'http://s3/test.png',
        key: 'test.png',
      });
      repo.save.mockResolvedValue({
        id: 1,
        name: 'test.png',
        url: 'http://s3/test.png',
      });
      process.env.REDIS_HOST = 'localhost'; // Ensure redis host is set for queue check

      await service.upload(file, 'folder', FileUploadType.TEMP);

      expect(queue.add).toHaveBeenCalledWith(
        'hard-delete-temp-file-upload',
        { id: 1 },
        expect.any(Object),
      );
    });
  });

  describe('delete', () => {
    it('should soft delete file', async () => {
      await service.delete(1);
      expect(repo.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('destroy', () => {
    it('should delete from S3 and update DB', async () => {
      repo.findOne.mockResolvedValue({ id: 1, name: 'test.png' });
      repo.save.mockResolvedValue({});

      await service.destroy(1);

      expect(s3Service.deleteS3File).toHaveBeenCalledWith('test.png');
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ onDeletePermanent: true }),
      );
    });
  });

  describe('setTypeToPermanent', () => {
    it('should update type for files', async () => {
      repo.find.mockResolvedValue([{ id: 1 }]);
      repo.update.mockResolvedValue({ affected: 1 });

      const result = await service.setTypeToPermanent([1]);
      expect(result.affected).toBe(1);
      expect(repo.update).toHaveBeenCalledWith(
        { id: In([1]) },
        { type: FileUploadType.PERMANENT },
      );
    });

    it('should throw NotFoundException if no files found', async () => {
      repo.find.mockResolvedValue([]);
      await expect(service.setTypeToPermanent([1])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      repo.find.mockRejectedValue(new Error('DB Error'));
      await expect(service.setTypeToPermanent([1])).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getFiles', () => {
    it('should find files by ids', async () => {
      await service.getFiles([1, 2]);
      expect(repo.find).toHaveBeenCalledWith({ where: { id: In([1, 2]) } });
    });
  });
});
