import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for each item in the matching-similar request
 * - SIMILAR item + productVariantId: Import the product
 * - SIMILAR item without productVariantId: Send to admin for review
 * - NOT_FOUND item + productVariantId: Import the product (admin found match)
 * - NOT_FOUND item without productVariantId: Reject (admin couldn't find match)
 */
export class MatchingSimilarItemDto {
  @ApiProperty({ description: 'Import item ID' })
  @IsNumber()
  itemId: number;

  @ApiPropertyOptional({
    description:
      'Product variant ID to match. ' +
      'With ID: Import product. ' +
      'Without ID: SIMILAR → send to admin, NOT_FOUND → reject.',
  })
  @IsOptional()
  @IsNumber()
  productVariantId?: number | null;

  @ApiPropertyOptional({
    description: 'Reason when not selecting any product (sent to admin)',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Request DTO for matching multiple SIMILAR items at once
 */
export class MatchingSimilarItemsDto {
  @ApiProperty({
    type: [MatchingSimilarItemDto],
    description: 'List of items to match',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MatchingSimilarItemDto)
  items: MatchingSimilarItemDto[];
}

/**
 * Response for each processed item
 */
export class MatchingSimilarItemResultDto {
  @ApiProperty({ description: 'Import item ID' })
  itemId: number;

  @ApiProperty({
    description: 'New import status',
    enum: ['IMPORTING', 'PENDING_ADMIN', 'REJECTED'],
  })
  status: 'IMPORTING' | 'PENDING_ADMIN' | 'REJECTED';

  @ApiPropertyOptional({ description: 'Error message if failed' })
  error?: string;
}

/**
 * Response DTO for matching-similar endpoint
 */
export class MatchingSimilarItemsResponseDto {
  @ApiProperty({ description: 'Number of items being imported' })
  importingCount: number;

  @ApiProperty({ description: 'Number of items sent to admin' })
  pendingAdminCount: number;

  @ApiProperty({
    description: 'Number of items rejected (NOT_FOUND that admin could not match)',
  })
  rejectedCount: number;

  @ApiProperty({ description: 'Number of items that failed to process' })
  failedCount: number;

  @ApiProperty({
    type: [MatchingSimilarItemResultDto],
    description: 'Result for each item',
  })
  items: MatchingSimilarItemResultDto[];
}
