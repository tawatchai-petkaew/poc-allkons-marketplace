import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { ImageUploadFolder } from '../../../model/image-upload-folder.entity';
import { ImageUploadFolderDto } from './image-upload-folder.dto';

export class UpdateImageUploadFolderDto
  implements Readonly<UpdateImageUploadFolderDto> {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

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

  public static toEntity(dto: Partial<UpdateImageUploadFolderDto>) {
    const it = new ImageUploadFolder();
    it.name = dto.name;

    return it;
  }
}
