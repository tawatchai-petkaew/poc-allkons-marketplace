import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import * as AWS from 'aws-sdk';

jest.mock('aws-sdk', () => {
  const mS3 = {
    upload: jest.fn(),
    getSignedUrl: jest.fn(),
    deleteObject: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return {
    S3: jest.fn(() => mS3),
  };
});

describe('S3Service', () => {
  let service: S3Service;
  let s3: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
    s3 = new AWS.S3();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadS3', () => {
    it('should upload file', async () => {
      (s3.upload as jest.Mock).mockImplementation((params, cb) => {
        cb(null, { Location: 'url' });
      });

      const res = await service.uploadS3(
        Buffer.from('test'),
        'bucket',
        'name',
        'folder',
        'type',
        true,
      );
      expect(res).toEqual({ Location: 'url' });
      expect(s3.upload).toHaveBeenCalled();
    });

    it('should reject on error', async () => {
      (s3.upload as jest.Mock).mockImplementation((params, cb) => {
        cb(new Error('fail'), null);
      });

      await expect(
        service.uploadS3(
          Buffer.from('test'),
          'bucket',
          'name',
          'folder',
          'type',
          true,
        ),
      ).rejects.toBe('fail');
    });
  });

  describe('getPresignedUrl', () => {
    it('should return url', async () => {
      (s3.getSignedUrl as jest.Mock).mockReturnValue('signed_url');
      const res = await service.getPresignedUrl('folder/key');
      expect(res).toBe('signed_url');
    });
  });

  describe('deleteS3File', () => {
    it('should delete file', async () => {
      (s3.promise as jest.Mock).mockResolvedValue({});
      const res = await service.deleteS3File('folder/key');
      expect(res.success).toBe(true);
    });
  });
});
