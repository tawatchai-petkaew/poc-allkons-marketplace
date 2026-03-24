import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateLastAccessedDto {
  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  @IsNotEmpty({ message: 'userId is required' })
  @IsNumber({}, { message: 'userId must be a number' })
  @IsPositive({ message: 'userId must be a positive number' })
  @Type(() => Number)
  userId: number;

  @ApiProperty({
    description: 'Merchant ID',
    example: 1
  })
  @IsNotEmpty({ message: 'merchantId is required' })
  @IsNumber({}, { message: 'merchantId must be a number' })
  @IsPositive({ message: 'merchantId must be a positive number' })
  @Type(() => Number)
  merchantId: number;
}
