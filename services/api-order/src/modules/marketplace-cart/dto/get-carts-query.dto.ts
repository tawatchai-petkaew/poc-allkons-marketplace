import { BaseQueryDto } from '@/utils/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCartsQueryDto extends BaseQueryDto {}

export class GetCartItemsQueryDto extends BaseQueryDto {
  @ApiProperty({ description: 'Cart ID', example: 14676 })
  @IsInt()
  @IsNotEmpty()
  cartId: number;
}

export class DeleteCartItemsDto {
  @ApiProperty({
    description: 'Array of cart item IDs to delete',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  ids: number[];
}
