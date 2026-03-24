import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationAuthDto {
  @ApiProperty({
    description: 'User ID of the person accessing the organization',
    example: 123
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'Organization ID to generate token for',
    example: 456
  })
  @IsNumber()
  @IsNotEmpty()
  organizationId: number;

  @ApiProperty({
    description: 'Optional additional context or metadata',
    example: 'admin_access',
    required: false
  })
  @IsOptional()
  @IsString()
  context?: string;
}

export class OrganizationTokenResponseDto {
  @ApiProperty({
    description: 'JWT access token for organization authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer'
  })
  tokenType: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600
  })
  expiresIn: number;

}
