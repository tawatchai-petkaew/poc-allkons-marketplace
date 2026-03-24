import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddMerchantProductDto {
  @ApiProperty({
    description: 'Array of merchant UUIDs to check for duplicate products',
    example: ['merchant-uuid-1', 'merchant-uuid-2'],
  })
  @IsNotEmpty()
  @IsString()
  merchantUuid: string;

  @ApiProperty({
    description: 'Array of product variant SKU UUIDs',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  @IsString({ each: true })
  productVariantSkuUuids: string[];
}
