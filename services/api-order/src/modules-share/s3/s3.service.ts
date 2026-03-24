import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
      region: this.configService.get<string>('AWS_REGION') || 'ap-southeast-1',
    });
  }

  async uploadS3(
    file: Buffer,
    bucket: string,
    name: string,
    folderName: string,
    contentType: string,
    isPublic: boolean,
  ) {
    const date = new Date();
    const key = `${folderName ? `${folderName}/` : ''}${
      String(name).split('.')[0] + '-' + date.getTime()
    }`;

    const params: PutObjectCommandInput = {
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    };

    if (isPublic) {
      const encodedKey = encodeURIComponent('public-access');
      const encodedValue = encodeURIComponent('true');
      params.Tagging = `${encodedKey}=${encodedValue}`;
    }

    try {
      await this.s3Client.send(new PutObjectCommand(params));

      const region =
        this.configService.get<string>('AWS_REGION') || 'ap-southeast-1';
      const location = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

      return {
        Location: location,
        key: key,
        Key: key,
      };
    } catch (err) {
      console.log(err);
      throw err.message;
    }
  }

  async getPresignedUrl(key: string) {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: key.split('/')[1],
    };

    try {
      const command = new GetObjectCommand(params);
      // ExpiresIn is in seconds
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 60 * 60 * 24 * 7,
      });
      return url;
    } catch (error) {
      throw new Error(`Failed to get presigned URL: ${error.message}`);
    }
  }

  async deleteS3File(key: string) {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: key?.split('/')[1],
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
      return { success: true, key };
    } catch (error) {
      throw new Error(`Failed to delete S3 file: ${error.message}`);
    }
  }
}
