import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  private getS3Client() {
    return new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Extract bucket name from AWS_S3_BUCKET env variable
   * Handles cases where env contains 'bucket/folder' format
   */
  private getBucketName(): string {
    const s3BucketEnv = process.env.AWS_S3_BUCKET || 's3-apse1-allkons-dev';
    return s3BucketEnv.split('/')[0];
  }

  async uploadS3(
    file: Buffer,
    bucket: string,
    name: string,
    folderName: string,
    contentType: string,
    isPublic: boolean,
    isDisableAutoTimestamp: boolean = false,
  ) {
    const s3Client = this.getS3Client();
    const date = new Date();

    // Extract filename and extension properly
    const nameParts = String(name).split('.');
    const extension =
      nameParts.length > 1 ? `.${nameParts[nameParts.length - 1]}` : '';
    const nameWithoutExt = nameParts.slice(0, -1).join('.');

    const key = `${folderName ? `${folderName}/` : ''}${nameWithoutExt}${isDisableAutoTimestamp ? '' : `-${date.getTime()}`}${extension}`;

    const params: any = {
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
      const upload = new Upload({
        client: s3Client,
        params,
      });

      const result = await upload.done();
      return {
        Location: `https://${bucket}.s3.amazonaws.com/${key}`,
        key,
        ...result,
      };
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async getPresignedUrl(key: string) {
    const s3Client = this.getS3Client();
    const command = new GetObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });

    try {
      const result = await getSignedUrl(s3Client, command, {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to get presigned URL: ${error.message}`);
    }
  }

  async getObject(key: string): Promise<Buffer> {
    const s3Client = this.getS3Client();
    const command = new GetObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });

    try {
      const response = await s3Client.send(command);
      const stream = response.Body;

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream as any) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      throw new Error(`Failed to get object from S3: ${error.message}`);
    }
  }

  async deleteS3File(key: string) {
    const s3Client = this.getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });

    try {
      await s3Client.send(command);
      return { success: true, key };
    } catch (error) {
      throw new Error(`Failed to delete S3 file: ${error.message}`);
    }
  }

  /**
   * Best-effort parallel delete of multiple S3 objects.
   * O(1) wall-clock: all deletes run concurrently.
   */
  async deleteS3Files(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const results = await Promise.allSettled(keys.map((key) => this.deleteS3File(key)));
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        this.logger.error(`Compensating S3 delete failed [${keys[i]}]: ${result.reason?.message}`);
      } else {
        this.logger.log(`Compensating S3 delete ok: ${keys[i]}`);
      }
    });
  }
}
