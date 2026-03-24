import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImageUploadService } from './image-upload.service';
import { ImageUploadController } from './image-upload.controller';

import { ImageUpload } from '../../model/image-upload.entity';
import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { ImageUploadConsumer } from './image-upload.consumer';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { S3Module } from '@/modules-v1/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageUpload, ImageUploadFolder]),
    BullModule.registerQueue({
      name: 'image-upload-consumer',
    }),
    BullBoardModule.forFeature({
      name: 'image-upload-consumer',
      adapter: BullAdapter,
    }),
    S3Module,
  ],
  providers: [ImageUploadService, ImageUploadConsumer],
  controllers: [ImageUploadController],
  exports: [ImageUploadService],
})
export class ImageUploadModule {}
