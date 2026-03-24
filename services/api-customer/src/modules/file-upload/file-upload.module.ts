import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { FileUploadConsumer } from './file-upload.comsumer';

import { FileUpload } from '../../model/file-upload.entity';

import { RequestContextModule } from '../request-context/request-context.module';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { S3Module } from '@/modules-v1/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileUpload]),
    RequestContextModule,
    BullModule.registerQueue({
      name: 'file-upload-consumer',
    }),
    BullBoardModule.forFeature({
      name: 'file-upload-consumer',
      adapter: BullAdapter,
    }),
    S3Module,
  ],
  providers: [FileUploadService, FileUploadConsumer],
  controllers: [FileUploadController],
  exports: [FileUploadService],
})
export class FileUploadModule {}
