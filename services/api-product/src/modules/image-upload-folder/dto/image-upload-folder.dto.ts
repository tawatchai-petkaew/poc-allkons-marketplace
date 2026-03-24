import { ApiProperty } from '@nestjs/swagger';

import { ImageUploadFolder } from '../../../model/image-upload-folder.entity';
import { Merchant } from '../../../model/merchant.entity';
import { ImageUpload } from '../../../model/image-upload.entity';

export class ImageUploadFolderDto implements Readonly<ImageUploadFolderDto> {
  @ApiProperty({ required: true })
  id: number;

  @ApiProperty({ required: true })
  name: string;

  merchant: Merchant;
  imageUploads: ImageUpload[];

  public static from(dto: Partial<ImageUploadFolderDto>) {
    const it = new ImageUploadFolderDto();
    it.id = dto.id;
    it.name = dto.name;
    it.merchant = dto.merchant;
    it.imageUploads = dto.imageUploads;

    return it;
  }

  public static fromEntity(entity: ImageUploadFolder) {
    return this.from({
      id: entity.id,
      name: entity.name,
      merchant: entity.merchant,
      imageUploads: entity.imageUploads
    });
  }

  public static toEntity(dto: Partial<ImageUploadFolderDto>) {
    const it = new ImageUploadFolder();
    it.name = dto.name;
    it.merchant = dto.merchant;
    it.imageUploads = dto.imageUploads;

    return it;
  }
}
