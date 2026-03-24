import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MerchantProductStatus,
  MerchantProductEntityStatus,
} from '@/model/merchant-product.entity';

export class UpdateMerchantProductItemDto {
  @ApiPropertyOptional({
    description: 'Merchant product entity status',
    enum: MerchantProductEntityStatus,
    example: MerchantProductEntityStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MerchantProductEntityStatus)
  status?: MerchantProductEntityStatus;

  @ApiProperty({
    description: 'Product variant ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  priceVat?: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  priceExcludeVat?: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  priceVatPercent?: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  priceIncludeVat?: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  specialPriceVat?: number | null;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  specialPriceIncludeVat?: number | null;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  specialPriceExcludeVat?: number | null;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  specialPriceVatPercent?: number | null;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  startDate?: Date | null;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  endDate?: Date | null;

  @ApiProperty({
    description: 'Product type ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  productTypeId?: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsInt()
  prepareDays?: number;

  @ApiProperty({ nullable: true, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  requirePriceInquiry?: boolean;

  @ApiPropertyOptional({
    description:
      'Use merchantCustomName / description instead of system defaults.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  useCustomDetails?: boolean;

  @ApiPropertyOptional({
    description: 'Merchant-defined product name override.',
    example: 'My custom product name',
    maxLength: 256,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  merchantCustomName?: string | null;

  @ApiPropertyOptional({
    description: 'Merchant-defined product description override.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Merchant product status',
    enum: MerchantProductStatus,
    example: MerchantProductStatus.SELLING,
  })
  @IsOptional()
  @IsEnum(MerchantProductStatus)
  merchantProductStatus?: MerchantProductStatus;
}

export class UpdateMerchantProductRequestDto {
  @ApiProperty({
    description: 'Array of products to update',
    type: [UpdateMerchantProductItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMerchantProductItemDto)
  @IsNotEmpty()
  products: UpdateMerchantProductItemDto[];
}

export class UpdateMerchantProductResponseDto {
  @ApiProperty()
  successCount: number;

  @ApiProperty()
  failedCount: number;

  @ApiProperty()
  totalRequested: number;

  @ApiProperty()
  updatedAt: Date;
}
