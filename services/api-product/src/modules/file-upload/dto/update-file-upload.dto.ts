import { IsOptional } from 'class-validator';

import { FileUpload } from '../../../model/file-upload.entity';
import { Merchant } from '../../../model/merchant.entity';
import { FileUploadDto } from './file-upload.dto';

export class UpdateFileUploadDto implements Readonly<UpdateFileUploadDto> {
  @IsOptional()
  url: string;

  @IsOptional()
  name: string;

  @IsOptional()
  fileName: string;

  @IsOptional()
  size: string;

  @IsOptional()
  onDeletePermanent: boolean;

  @IsOptional()
  merchant: Merchant;

  public static from(dto: Partial<FileUploadDto>) {
    const it = new FileUploadDto();
    it.id = dto.id;
    it.url = dto.url;
    it.name = dto.name;
    it.fileName = dto.fileName;
    it.size = dto.size;
    it.merchant = dto.merchant;

    return it;
  }

  public static fromEntity(entity: FileUpload) {
    return this.from({
      id: entity.id,
      url: entity.url,
      name: entity.name,
      fileName: entity.fileName,
      size: entity.size,
      merchant: entity.merchant
    });
  }

  public static toEntity(dto: Partial<UpdateFileUploadDto>) {
    const it = new FileUpload();
    it.url = dto.url;
    it.name = dto.name;
    it.fileName = dto.fileName;
    it.size = dto.size;
    it.onDeletePermanent = dto.onDeletePermanent;
    it.merchant = dto.merchant;

    return it;
  }
}
