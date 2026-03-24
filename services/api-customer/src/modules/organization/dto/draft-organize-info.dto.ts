import { OrganizationType } from '@/model/draft-organize.entity';
import { kycStatus } from '@/model/draft-user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class DraftOrganizeInfoDto {
  @IsEnum(OrganizationType)
  @IsNotEmpty()
  @ApiProperty()
  organizationType: OrganizationType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  orgInfo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  contactInfo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  addressInfo: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  fileInfo?: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  organizeId: number;
}

export class DraftOrganizeInfoResponseDto {
  id: number;
  organizationType: OrganizationType;
  orgInfo: string;
  contactInfo: string;
  addressInfo: string;
  organizeId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  kycStatus: kycStatus;
}
