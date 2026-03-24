import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';

// Mocks
jest.mock('@aws-sdk/client-s3', () => {
  const sendMock = jest.fn();
  const S3Client = jest.fn(() => ({ send: sendMock }));
  const DeleteObjectCommand = jest.fn((args) => ({ __args: args }));
  const GetObjectCommand = jest.fn((args) => ({ __args: args }));
  return { S3Client, DeleteObjectCommand, GetObjectCommand };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(({ client, params }) => ({
    done: jest.fn().mockResolvedValue({ ETag: 'etag' }),
    __client: client,
    __params: params,
  })),
}));

describe('S3Service', () => {
  let service: S3Service;

  const setEnv = () => {
    process.env.AWS_REGION = 'ap-southeast-1';
    process.env.AWS_ACCESS_KEY_ID = 'key';
    process.env.AWS_SECRET_ACCESS_KEY = 'secret';
    process.env.AWS_S3_BUCKET = 'my-bucket';
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    setEnv();
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();
    service = module.get(S3Service);
  });

  afterEach(() => {
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_S3_BUCKET;
  });

  describe('uploadS3', () => {
    it('uploads public object and returns Location and key; sets Tagging', async () => {
      const res = await service.uploadS3(
        Buffer.from('file'),
        'my-bucket',
        'image.jpg',
        'public',
        'image/jpeg',
        true,
      );

      expect(Upload).toHaveBeenCalledTimes(1);
      const uploadArgs = (Upload as unknown as jest.Mock).mock.calls[0][0];
      expect(uploadArgs.params.Bucket).toBe('my-bucket');
      expect(uploadArgs.params.Tagging).toBe('public-access=true');
      expect(res).toHaveProperty('Location');
      expect(res).toHaveProperty('key');
      expect(res.Location).toContain('https://my-bucket.s3.amazonaws.com/');
      expect(res.key).toMatch(/^public\/image-\d+$/);
    });

    it('uploads private object without Tagging', async () => {
      const res = await service.uploadS3(
        Buffer.from('file'),
        'my-bucket',
        'doc.pdf',
        '',
        'application/pdf',
        false,
      );

      const uploadArgs = (Upload as unknown as jest.Mock).mock.calls[0][0];
      expect(uploadArgs.params.Tagging).toBeUndefined();
      expect(res.key).toMatch(/^doc-\d+$/);
    });

    it('throws when upload fails', async () => {
      (Upload as unknown as jest.Mock).mockImplementationOnce(() => ({
        done: jest.fn().mockRejectedValue(new Error('upload failed')),
      }));

      await expect(
        service.uploadS3(
          Buffer.from('x'),
          'b',
          'n.txt',
          'f',
          'text/plain',
          true,
        ),
      ).rejects.toThrow('upload failed');
    });
  });

  describe('getPresignedUrl', () => {
    it('returns presigned url for given key', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue('https://signed');
      const url = await service.getPresignedUrl('public/key.jpg');
      expect(getSignedUrl).toHaveBeenCalled();
      expect(url).toBe('https://signed');
      // Ensure GetObjectCommand constructed with split key
      expect(
        (GetObjectCommand as unknown as jest.Mock).mock.calls[0][0],
      ).toEqual({
        Bucket: 'my-bucket',
        Key: 'key.jpg',
      });
    });

    it('throws when signing fails', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error('sign fail'));
      await expect(service.getPresignedUrl('public/key.jpg')).rejects.toThrow(
        'Failed to get presigned URL: sign fail',
      );
    });
  });

  describe('deleteS3File', () => {
    it('deletes object and returns success', async () => {
      (S3Client as unknown as jest.Mock).mockImplementationOnce(() => ({
        send: jest.fn().mockResolvedValue({}),
      }));

      const res = await service.deleteS3File('public/key.jpg');
      // Assert a client was constructed and its send was invoked via command args
      expect(
        (S3Client as unknown as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
      expect(
        (DeleteObjectCommand as unknown as jest.Mock).mock.calls[0][0],
      ).toEqual({
        Bucket: 'my-bucket',
        Key: 'key.jpg',
      });
      expect(res).toEqual({ success: true, key: 'public/key.jpg' });
    });

    it('throws when delete fails', async () => {
      (S3Client as unknown as jest.Mock).mockImplementationOnce(() => ({
        send: jest.fn().mockRejectedValue(new Error('del fail')),
      }));

      await expect(service.deleteS3File('public/key.jpg')).rejects.toThrow(
        'Failed to delete S3 file: del fail',
      );
    });
  });
});
