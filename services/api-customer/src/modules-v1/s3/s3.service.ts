import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  private getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
    const s3 = this.getS3();
    const date = new Date();

    const params: S3.PutObjectRequest = {
      Bucket: `${bucket}/allkons_m`,
      Key: `${folderName ? `${folderName}/` : ''}${
        String(name).split('.')[0] + '-' + date.getTime()
      }`,
      Body: file,
      ContentType: contentType,
    };

    if (isPublic) {
      const encodedKey = encodeURIComponent('public-access');
      const encodedValue = encodeURIComponent('true');
      params.Tagging = `${encodedKey}=${encodedValue}`;
    }

    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  async getPresignedUrl(key: string) {
    const s3 = this.getS3();
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key.split('/')[1],
      Expires: 60 * 60 * 24 * 7, // 7 days
    };

    try {
      const result = s3.getSignedUrl('getObject', params);
      return result;
    } catch (error) {
      throw new Error(`Failed to get presigned URL: ${error.message}`);
    }
  }

  async deleteS3File(key: string) {
    const s3 = this.getS3();
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key?.split('/')[1],
    };

    try {
      await s3.deleteObject(params).promise();
      return { success: true, key };
    } catch (error) {
      throw new Error(`Failed to delete S3 file: ${error.message}`);
    }
  }
}
