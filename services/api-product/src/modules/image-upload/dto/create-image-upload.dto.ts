import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { ImageUpload } from '../../../model/image-upload.entity';
import { ImageUploadDto } from './image-upload.dto';
import { ImageUploadFolder } from '../../../model/image-upload-folder.entity';

export class CreateImageUploadDto implements Readonly<CreateImageUploadDto> {
  @ApiProperty({ required: true })
  url: string;

  name: string;

  size: string;

  @IsOptional()
  imageName: string;

  @IsNotEmpty()
  imageUploadFolderId: number;

  imageUploadFolder: ImageUploadFolder;

  public static from(dto: Partial<ImageUploadDto>) {
    const it = new ImageUploadDto();
    it.id = dto.id;
    it.url = dto.url;
    it.name = dto.name;
    it.imageName = dto.imageName;
    it.size = dto.size;
    it.imageUploadFolder = dto.imageUploadFolder;

    return it;
  }

  public static fromEntity(entity: ImageUpload) {
    return this.from({
      id: entity.id,
      url: entity.url,
      name: entity.name,
      imageName: entity.imageName,
      size: entity.size,
      imageUploadFolder: entity.imageUploadFolder
    });
  }

  public static toEntity(dto: Partial<CreateImageUploadDto>) {
    const it = new ImageUpload();
    it.url = dto.url;
    it.name = dto.name;
    it.imageName = dto.imageName;
    it.size = dto.size;
    it.imageUploadFolder = dto.imageUploadFolder;

    return it;
  }
}
