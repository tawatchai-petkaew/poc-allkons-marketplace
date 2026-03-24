import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty } from 'class-validator';

import { FileUpload } from '../../../model/file-upload.entity';
import { Merchant } from '../../../model/merchant.entity';
import { FileUploadDto } from './file-upload.dto';
import { FileUploadType } from '@/model/enum/file-upload.enum';
import { StringToBoolean } from '@/decorators/string-to-boolean.decorator';

export class CreateFileUploadDto implements Readonly<CreateFileUploadDto> {
  @IsOptional()
  url: string;

  @IsOptional()
  name: string;

  @IsOptional()
  fileName: string;

  @IsOptional()
  size: string;

  @IsOptional()
  folderName: string;

  @IsOptional()
  onDeletePermanent: boolean;

  @IsOptional()
  merchant: Merchant;

  @IsOptional()
  type: FileUploadType;

  @IsOptional()
  @StringToBoolean()
  isPublic: boolean

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
      type: entity.type
    });
  }

  public static toEntity(dto: Partial<CreateFileUploadDto>) {
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
