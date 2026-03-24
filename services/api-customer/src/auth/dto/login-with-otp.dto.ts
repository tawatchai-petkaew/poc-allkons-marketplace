import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWithOtpDto {
  @ApiProperty({
    description: 'Country code',
    example: '66'
  })
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @ApiProperty({
    description: 'Phone number',
    example: '963334444'
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'OTP code',
    example: '123456'
  })
  @IsNotEmpty()
  @IsString()
  otp: string;

  @ApiProperty({
    description: 'OTP token',
    example: 'otp_token_123'
  })
  @IsNotEmpty()
  @IsString()
  otpToken: string;
}
