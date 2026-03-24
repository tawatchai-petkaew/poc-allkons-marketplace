import { IsString, IsOptional, IsBoolean, IsNumber, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePhoneWhiteListDto {
  @ApiProperty({
    description: 'Phone number (local format)',
    example: '0812345678',
  })
  @IsString()
  @Length(8, 20, { message: 'Phone number must be between 8 and 20 characters' })
  @Matches(/^[\d\s\-\(\)\+]+$/, { message: 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign' })
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Country code',
    example: '+66',
  })
  @IsOptional()
  @IsString()
  @Length(2, 10, { message: 'Country code must be between 2 and 10 characters' })
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'Label or description for this phone number',
    example: 'Main Office',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Label must be between 1 and 100 characters' })
  label?: string;

  @ApiPropertyOptional({
    description: 'Whether this phone number is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePhoneWhiteListDto {
  @ApiPropertyOptional({
    description: 'Phone number (local format)',
    example: '0812345678',
  })
  @IsOptional()
  @IsString()
  @Length(8, 20, { message: 'Phone number must be between 8 and 20 characters' })
  @Matches(/^[\d\s\-\(\)\+]+$/, { message: 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Country code',
    example: '+66',
  })
  @IsOptional()
  @IsString()
  @Length(2, 10, { message: 'Country code must be between 2 and 10 characters' })
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'Label or description for this phone number',
    example: 'Main Office',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Label must be between 1 and 100 characters' })
  label?: string;

  @ApiPropertyOptional({
    description: 'Whether this is the primary phone number',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this phone number is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PhoneWhiteListResponseDto {
  @ApiProperty({ description: 'Phone white list ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Organization ID', example: 1 })
  organizationId: number;

  @ApiProperty({ description: 'Phone number', example: '0812345678' })
  phoneNumber: string;

  @ApiProperty({ description: 'Country code', example: '+66', nullable: true })
  countryCode: string;

  @ApiProperty({ description: 'Label', example: 'Main Office', nullable: true })
  label: string;

  @ApiProperty({ description: 'Is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created date', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class PhoneWhiteListPaginatedResponseDto {
  @ApiProperty({ 
    description: 'Array of phone white list items',
    type: [PhoneWhiteListResponseDto] 
  })
  phoneLists: PhoneWhiteListResponseDto[];

  @ApiProperty({ description: 'Total number of items', example: 25 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 3 })
  totalPages: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPrev: boolean;
}

export class GetPhoneWhiteListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Search by phone number or label',
    example: '081',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
