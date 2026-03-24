import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CheckPriceMerchantRequestDto {
  @ApiProperty({
    description: 'Array of product variant IDs',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  productVariantIds: number[];
}

export class PriceMerchantItemDto {
  @ApiProperty()
  productVariantId: number;

  @ApiProperty({ nullable: true })
  priceExcludeVat: number;

  @ApiProperty({ nullable: true })
  priceIncludeVat: number;

  @ApiProperty({ nullable: true })
  specialPriceIncludeVat: number;

  @ApiProperty({ nullable: true })
  specialPriceExcludeVat: number;
}

export class CheckPriceMerchantResponseDto {
  @ApiProperty()
  isHeadOffice: boolean;

  @ApiProperty({ type: [PriceMerchantItemDto] })
  items: PriceMerchantItemDto[];
}

