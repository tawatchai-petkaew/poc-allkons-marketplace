import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

/**
 * Base query DTO for pagination with search
 */
export class BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search keyword',
    example: 'search term',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Base pagination metadata
 */
export class PaginationMeta {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPrev: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}

/**
 * Generic paginated response DTO
 */
export class BasePaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of data items' })
  items: T[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMeta })
  pagination: PaginationMeta;

  constructor(items: T[], page: number, limit: number, total: number) {
    this.items = items;
    this.pagination = new PaginationMeta(page, limit, total);
  }
}

/**
 * Standard API response wrapper with pagination
 */
export class ApiPaginatedResponse<T> {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Data retrieved successfully',
  })
  message: string;

  @ApiProperty({ description: 'Response data with pagination' })
  data: {
    items: T[];
    pagination: PaginationMeta;
  };

  constructor(
    items: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Data retrieved successfully',
  ) {
    this.success = true;
    this.message = message;
    this.data = {
      items,
      pagination: new PaginationMeta(page, limit, total),
    };
  }
}

/**
 * Simple pagination metadata (without hasNext/hasPrev)
 */
export class SimplePaginationMeta {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
  }
}
