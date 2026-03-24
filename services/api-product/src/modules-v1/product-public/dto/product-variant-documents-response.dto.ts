import { ApiProperty } from '@nestjs/swagger';
import { TechnicalType } from '@/utils/utils';

class FileDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ enum: ['PDF', 'EXCEL', 'WORD', 'IMAGE', 'OTHER'] })
  technicalType: TechnicalType;
}

export class ProductVariantDocumentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  documentType: string;

  @ApiProperty({ type: FileDto })
  file: FileDto;
}

export class ProductVariantDocumentsResponseDto {
  @ApiProperty({ type: [ProductVariantDocumentDto] })
  documents: ProductVariantDocumentDto[];
}
