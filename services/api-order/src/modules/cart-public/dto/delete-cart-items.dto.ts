import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteCartItemsDto {
  @ApiProperty({
    type: [Number],
    description: 'List of cart item IDs to delete',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  ids: number[];
}
