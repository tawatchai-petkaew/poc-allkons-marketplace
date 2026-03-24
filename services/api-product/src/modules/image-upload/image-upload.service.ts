import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Logger } from '@nestjs/common';
import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { CreateImageUploadDto } from './dto/create-image-upload.dto';
import { ImageUploadDto } from './dto/image-upload.dto';
import { UpdateImageUploadDto } from './dto/update-image-upload.dto';
import { S3Service } from '@/modules-v1/s3/s3.service';

@Injectable()
export class ImageUploadService {
  constructor(
    @InjectRepository(ImageUploadFolder)
    private readonly imageUploadFolderRepo: Repository<ImageUploadFolder>,
    @InjectRepository(ImageUpload)
    private readonly imageUploadRepo: Repository<ImageUpload>,
    private s3Service: S3Service,
  ) {}

  async upload(file, dto: CreateImageUploadDto) {
    const { originalname } = file;
    const bucketS3 = process.env.AWS_S3_BUCKET;

    const folderName = null;
    const isPublic = true;

    const imageData: any = await this.s3Service.uploadS3(
      file.buffer,
      bucketS3,
      originalname,
      folderName,
      file?.mimetype,
      isPublic,
    );

    const imageUploadFolder = await this.imageUploadFolderRepo.findOne({
      where: {
        id: dto.imageUploadFolderId,
      },
      relations: ['merchant'],
    });

    const size = file.buffer.length;

    const parentDto = {
      url: imageData.Location,
      name: imageData.key,
      imageName: originalname,
      size: size.toString(),
      imageUploadFolder,
    };

    const result = await this.imageUploadRepo.save(
      CreateImageUploadDto.toEntity(parentDto),
    );

    // Transform the URL before returning
    return isPublic ? result : await this.transformImageUrls(result);
  }

  async uploadWithoutFolder(file, manager?: EntityManager) {
    const { originalname, size } = file;
    const bucketS3 = process.env.AWS_S3_BUCKET;
    const imageData: any = await this.uploadS3(
      file.buffer,
      bucketS3,
      originalname,
    );

    const parentDto = {
      url: imageData.key, // Simply store the key, not the full URI
      name: imageData.key,
      size,
    };

    let result: ImageUpload;

    if (manager) {
      result = await manager.save(
        ImageUpload,
        CreateImageUploadDto.toEntity(parentDto),
      );
    } else {
      result = await this.imageUploadRepo.save(
        CreateImageUploadDto.toEntity(parentDto),
      );
    }

    return await this.transformImageUrls(ImageUploadDto.fromEntity(result));
  }

  public async update(
    id: number,
    dto: UpdateImageUploadDto,
  ): Promise<ImageUploadDto> {
    const imageUpload = await this.imageUploadRepo.findOne({ where: { id } });
    const imageUploadFolder = await this.imageUploadFolderRepo.findOne({
      where: { id: dto.imageUploadFolderId },
    });

    const parentDto = {
      imageUploadFolder,
    };
    const imageUploadEntity = ImageUploadDto.toEntity(parentDto);

    const updatedImageUpload = await this.imageUploadRepo.save(
      Object.assign(imageUpload, imageUploadEntity),
    );

    return await this.transformImageUrls(updatedImageUpload);
  }

  public async delete(id: number) {
    return this.imageUploadRepo.softDelete(id);
  }

  public async restore(id: number, dto: UpdateImageUploadDto) {
    await this.imageUploadRepo.restore(id);

    const imageUpload = await this.imageUploadRepo.findOne({ where: { id } });
    const imageUploadFolder = await this.imageUploadFolderRepo.findOne({
      where: { id: dto.imageUploadFolderId },
    });

    const parentDto = {
      imageUploadFolder,
    };
    const imageUploadEntity = ImageUploadDto.toEntity(parentDto);

    const restoredImageUpload = await this.imageUploadRepo.save(
      Object.assign(imageUpload, imageUploadEntity),
    );

    return await this.transformImageUrls(restoredImageUpload);
  }

  public async destroy(id: number) {
    const s3Client = this.getS3Client();
    const image = await this.imageUploadRepo.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: image.name,
    });

    try {
      const data = await s3Client.send(command);
      console.log(data);
    } catch (err) {
      console.log(err, err.stack);
    }

    const parentDto = {
      onDeletePermanent: true,
    };
    const imageUploadEntity = ImageUploadDto.toEntity(parentDto);

    const destroyedImageUpload = await this.imageUploadRepo.save(
      Object.assign(image, imageUploadEntity),
    );

    return await this.transformImageUrls(destroyedImageUpload);
  }

  // Modified uploadS3 to create simple keys without any paths
  async uploadS3(file, bucket, name) {
    const s3Client = this.getS3Client();
    const date = new Date();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sharp = require('sharp');
    const image = sharp(file);
    const meta = await image.metadata();
    const { format } = meta;

    const config = {
      jpeg: { mozjpeg: true },
      webp: { reductionEffort: 6 },
      png: { palette: true },
    };

    // Create a very simple key - just filename-timestamp.format
    // No paths, folders, or bucket names
    const sanitizedName = String(name)
      .split('.')[0]
      .replace(/[/\\]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const key = `${sanitizedName}-${date.getTime()}.${format}`;

    Logger.log(`Uploading to S3 with simple key: ${key}`);

    const buffer = await image[format](config[format]).withMetadata().toBuffer();

    try {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: `image/${format}`,
        },
      });

      const result = await upload.done();
      return {
        Location: `https://${bucket}.s3.amazonaws.com/${key}`,
        key,
        ...result,
      };
    } catch (err) {
      Logger.error(err);
      throw new Error(err.message);
    }
  }

  // Completely rewritten getSignedUrl method to avoid duplications
  async getSignedUrl(key: string, expiresIn = 604800): Promise<string> {
    if (!key) {
      Logger.error('Empty key provided to getSignedUrl');
      return process.env.DEFAULT_IMAGE_URL || null;
    }

    const s3Client = this.getS3Client();
    const bucket = process.env.AWS_S3_BUCKET;

    // Clean up the key - extract only the filename without paths or duplicates
    let objectKey = key;

    // Remove any S3 URI prefix if present
    if (objectKey.startsWith('s3://')) {
      const parts = objectKey.substring(5).split('/');
      // Remove the bucket name and use only the remaining parts
      parts.shift();
      objectKey = parts.join('/');
    }

    // Extract only the filename from any path structure
    if (objectKey.includes('/')) {
      const pathParts = objectKey.split('/');

      // Check for duplicated folder names and remove them
      const uniqueParts = [];
      for (let i = 0; i < pathParts.length; i++) {
        // Skip empty parts
        if (!pathParts[i]) continue;

        // Skip if this segment is the same as the previous one
        if (i > 0 && pathParts[i] === pathParts[i - 1]) continue;

        uniqueParts.push(pathParts[i]);
      }

      // If it ends with a filename (with no path), use just that
      // Otherwise use the cleaned path
      const lastPart = uniqueParts[uniqueParts.length - 1];
      if (lastPart && lastPart.includes('-') && /\d{10,}/.test(lastPart)) {
        // This looks like our timestamp format filename, just use that
        objectKey = lastPart;
      } else {
        objectKey = uniqueParts.join('/');
      }
    }

    Logger.log(`Using cleaned object key for S3: ${objectKey}`);

    try {
      const maxExpiresIn = 604800; // 7 days in seconds
      const safeExpiresIn = Math.min(expiresIn, maxExpiresIn);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      });

      return await getSignedUrl(s3Client, command, { expiresIn: safeExpiresIn });
    } catch (error) {
      Logger.error(`Error generating signed URL: ${error.message}`);
      return process.env.DEFAULT_IMAGE_URL || null;
    }
  }

  // Updated transformImageUrls method to update the image object with signed URL
  async transformImageUrls(
    imageUpload: ImageUpload | ImageUploadDto,
  ): Promise<any> {
    if (!imageUpload) return null;

    const result = { ...imageUpload };

    try {
      if (result.url) {
        // Generate signed URL from the key stored in url
        const signedUrl = await this.getSignedUrl(result.url);
        if (signedUrl) {
          // Update the image URL with the signed URL
          result.url = signedUrl;

          // If this is an actual database entity and not just a DTO
          if (result.id) {
            await this.imageUploadRepo.update(result.id, {
              url: signedUrl,
            });
            Logger.log(`Updated image ${result.id} with signed URL`);
          }
        }
      } else if (result.name) {
        // Fallback to name if url is missing
        const signedUrl = await this.getSignedUrl(result.name);
        if (signedUrl) {
          result.url = signedUrl;

          // If this is an actual database entity and not just a DTO
          if (result.id) {
            await this.imageUploadRepo.update(result.id, {
              url: signedUrl,
            });
            Logger.log(`Updated image ${result.id} with signed URL from name`);
          }
        }
      } else {
        result.url = process.env.DEFAULT_IMAGE_URL || null;
      }
    } catch (error) {
      Logger.error(`Failed to transform image URL: ${error.message}`);
      result.url = process.env.DEFAULT_IMAGE_URL || null;
    }

    return result;
  }

  // Fixed validateS3Object method to properly debug validation errors
  async validateS3Object(key: string, bucket: string): Promise<boolean> {
    const s3Client = this.getS3Client();
    try {
      Logger.log(`Validating object with key: ${key} in bucket: ${bucket}`);
      const command = new HeadObjectCommand({ Key: key, Bucket: bucket });
      await s3Client.send(command);
      return true;
    } catch (err) {
      Logger.error(
        `Object validation failed: ${err.name} - ${err.message} for key: ${key}`,
      );
      return false;
    }
  }

  getS3Client() {
    return new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
}
