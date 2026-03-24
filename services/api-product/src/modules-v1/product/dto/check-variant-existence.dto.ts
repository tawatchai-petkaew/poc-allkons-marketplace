import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckVariantExistenceDto {
  @ApiProperty({
    description: 'Array of product variant IDs to check existence in merchant products',
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(500)
  @Type(() => Number)
  productVariantIds: number[];
}

export class CheckVariantExistenceResponseDto {
  @ApiProperty({
    description: 'Product variant IDs that exist in merchant products (ACTIVE status)',
    example: [1, 2, 3],
    type: [Number],
  })
  existingIds: number[];

  @ApiProperty({
    description: 'Product variant IDs that do not exist in merchant products',
    example: [4, 5],
    type: [Number],
  })
  notExistingIds: number[];
}
