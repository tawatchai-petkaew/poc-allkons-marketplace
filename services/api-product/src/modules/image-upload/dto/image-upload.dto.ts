import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { ImageUpload } from '../../../model/image-upload.entity';
import { ImageUploadFolder } from '../../../model/image-upload-folder.entity';

export class ImageUploadDto implements Readonly<ImageUploadDto> {
  @ApiProperty({ required: true })
  id: number;

  @ApiProperty({ required: true })
  url: string;

  name: string;

  @IsOptional()
  imageName: string;

  size: string;

  @IsOptional()
  onDeletePermanent: boolean;

  @ApiProperty({ required: true })
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

  public static toEntity(dto: Partial<ImageUploadDto>) {
    const it = new ImageUpload();
    it.url = dto.url;
    it.name = dto.name;
    it.imageName = dto.imageName;
    it.size = dto.size;
    it.onDeletePermanent = dto.onDeletePermanent;
    it.imageUploadFolder = dto.imageUploadFolder;

    return it;
  }
}
