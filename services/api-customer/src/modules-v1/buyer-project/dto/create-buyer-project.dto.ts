import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBuyerProjectDto {
  @ApiProperty({
    description: 'The name of the buyer project',
    example: 'Project XYZ'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The ID of the user',
    example: 1
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'The ID of the organization',
    example: 1
  })
  @IsInt()
  @IsNotEmpty()
  organizeId: number;
}
