import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InviteValidatePhoneDto {
  @ApiProperty({
    description: 'phone number',
    example: '982341234',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'country code of phone',
    example: '66',
  })
  @IsNotEmpty()
  @IsString()
  countryCode: string;
}
