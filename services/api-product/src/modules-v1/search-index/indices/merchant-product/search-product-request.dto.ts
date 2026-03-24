import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchTermFilterDto {
  @ApiProperty({ description: 'Field name to filter by' })
  @IsString()
  fieldName: string;

  @ApiPropertyOptional({ description: 'Array of values to filter for' })
  @IsArray()
  @IsOptional()
  filterValues: unknown[];
}

export class SearchProductRequestDto {
  @ApiPropertyOptional({ description: 'Search query string' })
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageLimit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field (e.g., price, createdAt)' })
  @IsOptional()
  @IsString()
  sortByField?: string;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' | 'ascending' | 'descending' = 'desc';

  @ApiPropertyOptional({
    description: 'Merchant ID to filter products sold by this merchant',
  })
  @IsOptional()
  merchantId?: number | null;

  @ApiPropertyOptional({ description: 'Project ID' })
  @IsOptional()
  projectId?: number | null;

  @ApiPropertyOptional({
    description: 'Term filters',
    type: [SearchTermFilterDto],
  })
  @IsOptional()
  @IsArray()
  @Type(() => SearchTermFilterDto)
  termFilters?: SearchTermFilterDto[];

  @ApiPropertyOptional({ description: 'Aggregations list', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aggregations?: string[];
}
