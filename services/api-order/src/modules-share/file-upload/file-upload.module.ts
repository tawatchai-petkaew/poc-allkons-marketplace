import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { FileUploadConsumer } from './file-upload.comsumer';

import { FileUpload } from '../../model/file-upload.entity';

import { RequestContextModule } from '../../modules/request-context/request-context.module';
import { BullModule } from '@nestjs/bull';
import { S3Module } from '@/modules-share/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileUpload]),
    RequestContextModule,
    BullModule.registerQueue({
      name: 'file-upload-consumer',
    }),
    S3Module,
  ],
  providers: [FileUploadService, FileUploadConsumer],
  controllers: [FileUploadController],
  exports: [FileUploadService],
})
export class FileUploadModule {}
