import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImageUploadFolderService } from './image-upload-folder.service';
import { ImageUploadFolderController } from './image-upload-folder.controller';
import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { Merchant } from '../../model/merchant.entity';
import { User } from '../../model/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageUploadFolder, Merchant, User, ImageUpload]),
  ],
  providers: [ImageUploadFolderService],
  controllers: [ImageUploadFolderController],
})
export class ImageUploadFolderModule {}
