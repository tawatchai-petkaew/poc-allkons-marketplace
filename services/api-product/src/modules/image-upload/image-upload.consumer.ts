import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';

import { ImageUpload } from '../../model/image-upload.entity';

@Processor('image-upload-consumer')
export class ImageUploadConsumer {
  constructor(
    @InjectRepository(ImageUpload)
    private readonly imageUploadRepo: Repository<ImageUpload>
  ) {}

  @Process('soft-delete-image-upload-repository')
  async softDeleteImageUploadRepository(job: Job<unknown>) {
    console.log('----> Start Soft Delete Repository');
    await this.imageUploadRepo.softDelete(job.data['id']);
    console.log('----> End Soft Delete Repository');
  }
}
