import { DocumentType } from '@/modules/user/enum/file-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadDocumentDto {
  @IsNotEmpty()
  @ApiProperty()
  documentType: DocumentType;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  fileBase64: string[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  draftOrganizeId: number;
}
