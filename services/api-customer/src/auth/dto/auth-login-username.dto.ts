import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthLoginUsernameDto {
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
