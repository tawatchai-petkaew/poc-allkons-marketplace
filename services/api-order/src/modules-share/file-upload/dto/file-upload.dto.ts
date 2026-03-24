import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty } from 'class-validator';

import { FileUpload } from '../../../model/file-upload.entity';
import { Merchant } from '../../../model/merchant.entity';
import { FileUploadType } from '@/model/enum/file-upload.enum';

export class FileUploadDto implements Readonly<FileUploadDto> {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  fileName: string;

  @IsNotEmpty()
  type: FileUploadType;

  @IsNotEmpty()
  size: string;

  @IsOptional()
  onDeletePermanent: boolean;

  @IsNotEmpty()
  merchant: Merchant;

  public static from(dto: Partial<FileUploadDto>) {
    const it = new FileUploadDto();
    it.id = dto.id;
    it.url = dto.url;
    it.name = dto.name;
    it.fileName = dto.fileName;
    it.size = dto.size;
    it.merchant = dto.merchant;
    it.type = dto.type;

    return it;
  }

  public static fromEntity(entity: FileUpload) {
    return this.from({
      id: entity.id,
      url: entity.url,
      name: entity.name,
      fileName: entity.fileName,
      size: entity.size,
      merchant: entity.merchant,
    });
  }

  public static toEntity(dto: Partial<FileUploadDto>) {
    const it = new FileUpload();
    it.url = dto.url;
    it.name = dto.name;
    it.fileName = dto.fileName;
    it.size = dto.size;
    it.onDeletePermanent = dto.onDeletePermanent;
    it.merchant = dto.merchant;
    it.type = dto.type;

    return it;
  }
}
