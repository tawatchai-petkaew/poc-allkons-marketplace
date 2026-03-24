import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { FileUpload } from '../../model/file-upload.entity';

import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { FileUploadDto } from './dto/file-upload.dto';
import { FileUploadType } from '@/model/enum/file-upload.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { S3Service } from '@/modules-share/s3/s3.service';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileUpload)
    private readonly fileUploadRepo: Repository<FileUpload>,
    @InjectQueue('file-upload-consumer')
    private fileUploadConsumerQueue: Queue,
    private s3Service: S3Service,
  ) {}

  async upload(
    file: Express.Multer.File,
    folderName?: string,
    type: FileUploadType = FileUploadType.PERMANENT,
    isPublic: boolean = false,
  ) {
    const { originalname, size } = file;
    const bucketS3 = process.env.AWS_S3_BUCKET;
    const imageData: any = await this.s3Service.uploadS3(
      file.buffer,
      bucketS3,
      originalname,
      folderName,
      file?.mimetype,
      isPublic,
    );

    const parentDto = {
      url: imageData.Location,
      name: imageData.key,
      fileName: originalname,
      size: size?.toString(),
      type: type,
    };

    const result = await this.fileUploadRepo
      .save(CreateFileUploadDto.toEntity(parentDto))
      .then(async (e) => {
        return FileUploadDto.fromEntity(e);
      });

    if (type === FileUploadType.TEMP) {
      this.removeTempFileJob(result.id);
    }

    if (!isPublic) {
      result.url = await this.s3Service.getPresignedUrl(result.name);
    }

    return result;
  }

  public async delete(id: number) {
    return this.fileUploadRepo.softDelete(id);
  }

  public async destroy(id: number) {
    const file = await this.fileUploadRepo.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });

    await this.s3Service.deleteS3File(file.name);

    const parentDto = {
      onDeletePermanent: true,
    };
    const fileUploadEntity = FileUploadDto.toEntity(parentDto);

    return this.fileUploadRepo.save(Object.assign(file, fileUploadEntity));
  }

  async setTypeToPermanent(ids: number[]) {
    try {
      const files = await this.fileUploadRepo.find({ where: { id: In(ids) } });

      if (files.length === 0) {
        throw new NotFoundException('File not found');
      }

      const result = await this.fileUploadRepo.update(
        {
          id: In(ids),
        },
        {
          type: FileUploadType.PERMANENT,
        },
      );

      return { affected: result?.affected };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error', {
        cause: error,
      });
    }
  }

  async removeTempFileJob(id: number) {
    if (process.env.REDIS_HOST) {
      await this.fileUploadConsumerQueue.add(
        'hard-delete-temp-file-upload',
        { id },
        {
          delay: 1000 * 60, // 60s
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000 * 60,
          },
          removeOnComplete: {
            age: 24 * 3600 * 7,
          },
          removeOnFail: {
            age: 24 * 3600 * 30,
          },
        },
      );
    }
  }

  public async getFiles(fileIds: number[]) {
    return this.fileUploadRepo.find({ where: { id: In(fileIds) } });
  }
}
