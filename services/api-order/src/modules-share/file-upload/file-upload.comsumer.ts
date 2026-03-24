import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';

import { FileUpload } from '../../model/file-upload.entity';
import { FileUploadType } from '@/model/enum/file-upload.enum';
import { FileUploadService } from './file-upload.service';
import { S3Service } from '@/modules-share/s3/s3.service';

@Processor('file-upload-consumer')
export class FileUploadConsumer {
  constructor(
    @InjectRepository(FileUpload)
    private readonly fileUploadRepo: Repository<FileUpload>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Process('hard-delete-temp-file-upload')
  async hardDeleteTempFileUpload(job: Job<unknown>) {
    console.log('----> Start Delete Temp Files');
    const fileUpload = await this.fileUploadRepo.findOne({
      where: { id: job.data['id'] },
    });
    if (fileUpload.type === FileUploadType.TEMP) {
      try {
        await this.fileUploadService.destroy(fileUpload.id);
        console.log('----> End Delete Temp File');
      } catch (error) {
        console.log('----> Error Delete Temp File');
        console.log(error);
      }
    }
  }
}
