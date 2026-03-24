import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ImportProductBatchStatus } from '@/model/import-product-batch.entity';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';

/**
 * Query DTO for listing import batches with pagination
 */
export class ListBatchesQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Search by original filename',
    example: 'product_import',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by batch status',
    enum: ImportProductBatchStatus,
    example: ImportProductBatchStatus.VALIDATED,
  })
  @IsOptional()
  @IsEnum(ImportProductBatchStatus)
  status?: ImportProductBatchStatus;
}