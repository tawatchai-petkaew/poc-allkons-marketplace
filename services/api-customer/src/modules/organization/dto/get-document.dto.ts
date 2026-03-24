import { DocumentType } from '@/modules/user/enum/file-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetDocumentDto {
  @IsNotEmpty()
  @ApiProperty()
  documentType: DocumentType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  draftOrganizeId: number;
}
