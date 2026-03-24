import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SaleStatus } from '@/model/import-product-item.entity';

export enum PriceType {
  INVAT = 'INVAT',
  EXVAT = 'EXVAT',
}

export class ProductToAddDto {
  @ApiProperty({ description: 'Product variant ID' })
  @IsNumber()
  productVariantId: number;

  @ApiPropertyOptional({
    description: 'Price type: INVAT (inclusive) or EXVAT (exclusive)',
    enum: PriceType,
  })
  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType;

  @ApiPropertyOptional({
    description:
      'Regular price (only used for HEAD_OFFICE, BRANCH inherits from HEAD_OFFICE)',
  })
  @IsOptional()
  @IsNumber()
  regularPrice?: number;

  @ApiPropertyOptional({ description: 'Special promotional price' })
  @IsOptional()
  @IsNumber()
  specialPrice?: number;

  @ApiPropertyOptional({ description: 'VAT percentage (default 7%)' })
  @IsOptional()
  @IsNumber()
  vatPercent?: number;

  @ApiPropertyOptional({ description: 'Special price start date' })
  @IsOptional()
  specialPriceStartDate?: Date;

  @ApiPropertyOptional({ description: 'Special price end date' })
  @IsOptional()
  specialPriceEndDate?: Date;

  @ApiPropertyOptional({
    description: 'Require price inquiry (สอบถามราคา)',
    default: false,
  })
  @IsOptional()
  requirePriceInquiry?: boolean;

  @ApiPropertyOptional({
    description: 'Sale status: SELLING or HIDDEN',
    enum: SaleStatus,
  })
  @IsOptional()
  @IsEnum(SaleStatus, { message: 'saleStatus must be either SELLING or HIDDEN' })
  saleStatus?: SaleStatus;
}

export class AddProductsToMerchantDto {
  @ApiProperty({ description: 'Target merchant ID' })
  @IsNumber()
  merchantId: number;

  @ApiProperty({
    description: 'Array of products to add',
    type: [ProductToAddDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductToAddDto)
  products: ProductToAddDto[];

  @ApiPropertyOptional({ description: 'User who created the records' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export type ProductAddStatus = 'SUCCESS' | 'FAILED' | 'SKIPPED';

export class ProductAddResultDto {
  @ApiProperty({ description: 'Product variant ID' })
  productVariantId: number;

  @ApiProperty({ description: 'Status of the add operation' })
  status: ProductAddStatus;

  @ApiPropertyOptional({ description: 'Reason for failure or skip' })
  reason?: string;

  @ApiPropertyOptional({ description: 'Created merchant product ID' })
  merchantProductId?: number;
}

export class AddProductsToMerchantResultDto {
  @ApiProperty({ description: 'Total number of products requested' })
  totalRequested: number;

  @ApiProperty({ description: 'Number of successfully added products' })
  successCount: number;

  @ApiProperty({ description: 'Number of failed products' })
  failedCount: number;

  @ApiProperty({ description: 'Number of skipped products (duplicates)' })
  skippedCount: number;

  @ApiProperty({
    description: 'Individual results for each product',
    type: [ProductAddResultDto],
  })
  results: ProductAddResultDto[];
}
