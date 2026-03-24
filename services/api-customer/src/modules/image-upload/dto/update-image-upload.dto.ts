import { ImageUpload } from '../../../model/image-upload.entity';
import { ImageUploadDto } from './image-upload.dto';
import { ImageUploadFolder } from '../../../model/image-upload-folder.entity';

export class UpdateImageUploadDto implements Readonly<UpdateImageUploadDto> {
  imageUploadFolderId: number;
  imageUploadFolder: ImageUploadFolder;

  public static from(dto: Partial<ImageUploadDto>) {
    const it = new ImageUploadDto();
    it.id = dto.id;
    it.url = dto.url;
    it.size = dto.size;
    it.imageUploadFolder = dto.imageUploadFolder;

    return it;
  }

  public static fromEntity(entity: ImageUpload) {
    return this.from({
      id: entity.id,
      url: entity.url,
      size: entity.size,
      imageUploadFolder: entity.imageUploadFolder
    });
  }

  public static toEntity(dto: Partial<UpdateImageUploadDto>) {
    const it = new ImageUpload();
    it.imageUploadFolder = dto.imageUploadFolder;

    return it;
  }
}
