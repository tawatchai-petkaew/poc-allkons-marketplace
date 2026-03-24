import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { ImageUploadFolder } from '../../../model/image-upload-folder.entity';
import { ImageUploadFolderDto } from './image-upload-folder.dto';
import { Merchant } from '../../../model/merchant.entity';

export class CreateImageUploadFolderDto
  implements Readonly<CreateImageUploadFolderDto> {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  merchantId: number;

  merchant: Merchant;

  public static from(dto: Partial<ImageUploadFolderDto>) {
    const it = new ImageUploadFolderDto();
    it.id = dto.id;
    it.name = dto.name;
    it.merchant = dto.merchant;

    return it;
  }

  public static fromEntity(entity: ImageUploadFolder) {
    return this.from({
      id: entity.id,
      name: entity.name,
      merchant: entity.merchant
    });
  }

  public static toEntity(dto: Partial<CreateImageUploadFolderDto>) {
    const it = new ImageUploadFolder();
    it.name = dto.name;
    it.merchant = dto.merchant;

    return it;
  }
}
