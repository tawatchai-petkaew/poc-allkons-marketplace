import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageUploadFolderService } from './image-upload-folder.service';
import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { Merchant } from '../../model/merchant.entity';
import { User } from '../../model/user.entity';

import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageUploadFolder, Merchant, User, ImageUpload]),
    RequestContextModule
  ],
  providers: [ImageUploadFolderService],
})
export class ImageUploadFolderModule {}
