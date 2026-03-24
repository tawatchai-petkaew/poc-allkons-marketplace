import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileUploadService } from './file-upload.service';
import { FileUploadConsumer } from './file-upload.comsumer';

import { FileUpload } from '../../model/file-upload.entity';

import { RequestContextModule } from '../request-context/request-context.module';
import { BullModule } from '@nestjs/bull';
import { S3Module } from '@/modules-v1/s3/s3.module';

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
  exports: [FileUploadService],
})
export class FileUploadModule {}
