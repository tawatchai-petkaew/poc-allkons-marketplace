import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  MatchStatus,
  ImportStatus,
} from '@/model/import-product-item.entity';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';

/**
 * Query DTO for listing import batch items with pagination
 */
export class ListBatchItemsQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by match status',
    enum: MatchStatus,
    example: MatchStatus.FOUND,
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  matchStatus?: MatchStatus;

  @ApiPropertyOptional({
    description: 'Filter by import status (accepts single value, comma-separated, or array)',
    enum: ImportStatus,
    example: [ImportStatus.COMPLETED, ImportStatus.PENDING],
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((s) => s.trim());
    return [value];
  })
  @IsArray()
  @IsEnum(ImportStatus, { each: true })
  importStatus?: ImportStatus[];

  @ApiPropertyOptional({
    description: 'Search text to filter by product name, barcode, or brand (case-insensitive)',
    example: 'iPhone',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
