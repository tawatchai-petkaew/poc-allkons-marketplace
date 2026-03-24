import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class LoginUsernameRequestDto {
  @ApiProperty({
    description: 'Username can be either phone number or email',
    example: '0812345678 or user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Country code (required if username is phone number)',
    example: '+66',
    required: false,
  })
  @IsString()
  @IsOptional()
  countryCode?: string;
}

export class LoginWithOtpDto {
  @ApiProperty({
    description: 'OTP pin (6 digits)',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only numbers' })
  @Transform(({ obj }) => obj.pin || obj.otp) // รับทั้ง pin และ otp
  pin: string;

  @ApiProperty({
    description: 'OTP token from SMS service',
    example: 'e7ab565a39b6329d8897ab19ba80cdcf',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ obj }) => obj.token || obj.otpToken) // รับทั้ง token และ otpToken
  token: string;

  @ApiProperty({
    description: 'Country code',
    example: '66',
  })
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @ApiProperty({
    description: 'Phone number',
    example: '812345678',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
