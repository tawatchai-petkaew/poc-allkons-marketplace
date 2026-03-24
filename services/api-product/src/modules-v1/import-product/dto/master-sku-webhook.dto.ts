import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single suggested product from MASTER_SKU
 */
export class SuggestedProductDto {
  @ApiPropertyOptional({
    description: 'Product variant ID in our database.',
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro Max',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Product brand',
    example: 'Apple',
  })
  @IsString()
  @MaxLength(255)
  brand: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '8851234567890',
  })
  @IsString()
  @MaxLength(100)
  barcode: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}

/**
 * DTO for one item with its suggestions
 */
export class MasterSkuProductSuggestionDto {
  @ApiProperty({
    description: 'Import item ID',
    example: 456,
  })
  @IsNumber()
  itemId: number;

  @ApiPropertyOptional({
    type: [SuggestedProductDto],
    description:
      'List of suggested products for this item. Set to null to reject the item.',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SuggestedProductDto)
  suggestions?: SuggestedProductDto[] | null;

  @ApiPropertyOptional({
    description:
      'Rejection reason (optional, only used when suggestions is null)',
    example: 'Product not found in Master SKU database',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

/**
 * Request DTO for MASTER_SKU webhook
 */
export class MasterSkuSuggestProductRequestDto {
  @ApiProperty({
    type: [MasterSkuProductSuggestionDto],
    description: 'List of items with their suggestions',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MasterSkuProductSuggestionDto)
  items: MasterSkuProductSuggestionDto[];
}

/**
 * Result for each processed item
 */
export class MasterSkuItemResultDto {
  @ApiProperty({
    description: 'Import item ID',
    example: 456,
  })
  itemId: number;

  @ApiProperty({
    description: 'Processing status',
    enum: ['SUCCESS', 'FAILED'],
    example: 'SUCCESS',
  })
  status: 'SUCCESS' | 'FAILED';

  @ApiPropertyOptional({
    description: 'Error message if processing failed',
    example: 'Item not found or invalid status',
  })
  error?: string;

  @ApiPropertyOptional({
    description: 'Number of valid suggestions processed',
    example: 3,
  })
  suggestionsCount?: number;
}
