import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageUploadService } from './image-upload.service';
import { ImageUpload } from '../../model/image-upload.entity';
import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { ImageUploadConsumer } from './image-upload.consumer';
import { BullModule } from '@nestjs/bull';
import { S3Module } from '@/modules-v1/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageUpload, ImageUploadFolder]),
    BullModule.registerQueue({
      name: 'image-upload-consumer',
    }),
    S3Module,
  ],
  providers: [ImageUploadService, ImageUploadConsumer],
  exports: [ImageUploadService],
})
export class ImageUploadModule {}
