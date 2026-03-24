import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckIdCardDto {
  @ApiProperty({
    description: 'Thai National ID Card Number (13 digits)',
    example: '1234567890123',
    minLength: 13,
    maxLength: 13
  })
  @IsString()
  @IsNotEmpty({ message: 'ID Card number is required' })
  @Length(13, 13, { message: 'ID Card number must be exactly 13 digits' })
  idCard: string;
}

export class CheckRegistrationNumberDto {
  @ApiProperty({
    description: 'Business Registration Number',
    example: '1234567890123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Registration number is required' })
  @Length(13, 13, { message: 'Registration number must be exactly 13 digits' })
  registrationNumber: string;
}