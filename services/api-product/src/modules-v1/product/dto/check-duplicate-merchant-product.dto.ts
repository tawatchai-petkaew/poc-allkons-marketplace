import { Merchant } from '@/model';
import { ProductVariant } from '@/model/product-variant.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CheckDuplicateMerchantProductDto {
  @ApiProperty({
    description: 'Array of merchant UUIDs to check for duplicate products',
    example: ['merchant-uuid-1', 'merchant-uuid-2'],
  })
  @IsArray()
  @IsString({ each: true })
  merchantUuids: string[];

  @ApiProperty({
    description: 'Array of product variant SKU UUIDs to check for duplicates',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  @IsString({ each: true })
  productVariantSkuUuids: string[];
}

export class MerchantProductValidationResult {
  merchant: Merchant;
  addableProducts: ProductVariant[];
  duplicatedProducts: ProductVariant[];
}
