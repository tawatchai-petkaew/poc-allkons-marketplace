import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterPhoneNumberRequestDto {
  @ApiProperty({
    description: 'Thai phone number',
    example: '987543212',
  })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('TH')
  phoneNumber: string;

  @ApiProperty({
    description: 'Country code for the phone number',
    example: '66',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2)
  @Matches(/^66$/, { message: 'Country code must be 66' })
  countryCode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiProperty({
    description: 'Password for the account',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Define register from seller or not',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isSeller?: boolean;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhbGc...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Access token for authentication allkons Id',
    example: 'eyJhbGc...',
  })
  akidAccessToken?: string;

  constructor(partial: Partial<RegisterResponseDto>) {
    Object.assign(this, partial);
  }
}
