import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Service', () => {
  let service: S3Service;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AWS_REGION') return 'ap-southeast-1';
              if (key === 'AWS_S3_BUCKET') return 'bucket';
              return 'test-value';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);

    mockSend.mockClear();
    (getSignedUrl as jest.Mock).mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadS3', () => {
    it('should upload file', async () => {
      mockSend.mockResolvedValue({});
      const result = await service.uploadS3(
        Buffer.from(''),
        'bucket',
        'name.png',
        'folder',
        'image/png',
        false,
      );
      // Location logic is manually constructed in service now
      expect(result.Location).toContain(
        'https://bucket.s3.ap-southeast-1.amazonaws.com/folder/name',
      );
      expect(mockSend).toHaveBeenCalled();
    });

    it('should upload public file', async () => {
      mockSend.mockResolvedValue({});
      await service.uploadS3(
        Buffer.from(''),
        'bucket',
        'name.png',
        'folder',
        'image/png',
        true,
      );
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Tagging: expect.stringContaining('public-access=true'),
        }),
      );
      expect(mockSend).toHaveBeenCalled();
    });

    it('should reject on error', async () => {
      mockSend.mockRejectedValue(new Error('fail'));
      await expect(
        service.uploadS3(
          Buffer.from(''),
          'bucket',
          'name.png',
          'folder',
          'image/png',
          false,
        ),
      ).rejects.toBe('fail');
    });
  });

  describe('getPresignedUrl', () => {
    it('should return url', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue('http://url');
      const result = await service.getPresignedUrl('folder/key');
      expect(result).toBe('http://url');
      expect(getSignedUrl).toHaveBeenCalled();
    });

    it('should error', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error('ops'));
      await expect(service.getPresignedUrl('folder/key')).rejects.toThrow();
    });
  });

  describe('deleteS3File', () => {
    it('should delete file', async () => {
      mockSend.mockResolvedValue({});
      const result = await service.deleteS3File('folder/key');
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should error', async () => {
      mockSend.mockRejectedValue(new Error('ops'));
      await expect(service.deleteS3File('folder/key')).rejects.toThrow();
    });
  });
});
