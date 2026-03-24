import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetCartQueryDto {
  @ApiProperty({
    required: false,
    default: 1,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: 10,
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
