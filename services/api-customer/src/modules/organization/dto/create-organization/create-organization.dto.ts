import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  ValidateNested,
  ValidateIf,
  IsNumber,
  IsOptional,
  Matches,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoleBusinessType } from '@/modules/register/enum/register.enum';
import {
  JuristicTypeValue as JuristicTypeValueEnum,
  OrganizationBranchType as OrganizationBranchTypeEnum,
  OrgType,
} from '@/modules/organization/enum/organization.enum';

/**
 * DTO for personal organization information
 */
export class PersonalOrganizationInfoDto {
  @ApiProperty({
    description: 'Business types that the organization operates',
    example: [RoleBusinessType.AGENT, RoleBusinessType.MDT],
    enum: RoleBusinessType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(RoleBusinessType, {
    each: true,
    message: 'Each businessType must be a valid RoleBusinessType',
  })
  @IsOptional()
  businessType?: string[];

  @ApiProperty({
    description: 'Thai citizen ID card number (13 digits, cannot start with 0)',
    example: '1234567890123',
    pattern: '^[1-9]\\d{12}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{12}$/, {
    message: 'ID card must be 13 digits and cannot start with 0',
  })
  idCard: string;

  @ApiProperty({
    description: 'Acceptance of terms and conditions',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  acceptTerms: boolean;
}

/**
 * DTO for juristic organization information
 */
export class JuristicOrganizationInfoDto {
  @ApiProperty({
    description: 'Business types that the organization operates',
    example: [RoleBusinessType.FAC, RoleBusinessType.CON],
    enum: RoleBusinessType,
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  @IsEnum(RoleBusinessType, {
    each: true,
    message: 'Each businessType must be a valid RoleBusinessType',
  })
  businessType: string[];

  @ApiProperty({
    description: 'Tax identification number',
    example: '0123456789012',
  })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({
    description: 'Type of juristic entity',
    example: JuristicTypeValueEnum.LIMITED_COMPANY,
    enum: JuristicTypeValueEnum,
  })
  @IsEnum(JuristicTypeValueEnum, {
    message: 'Juristic type must be one of the defined types',
  })
  @IsNotEmpty()
  juristicType: JuristicTypeValueEnum;

  @ApiPropertyOptional({
    description:
      'Remark for OTHER juristic type (required if juristicType is OTHER)',
    example: 'Foundation',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.juristicType === JuristicTypeValueEnum.OTHER)
  @IsNotEmpty({
    message: 'remarkTypeOther is required when juristicType is OTHER',
  })
  remarkTypeOther?: string;

  @ApiProperty({
    description: 'Juristic type ID from database',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  juristicTypeId: number;

  @ApiProperty({
    description: 'Official name of the juristic entity',
    example: 'ABC Company Limited',
  })
  @IsString()
  @IsNotEmpty()
  juristicName: string;

  @ApiProperty({
    description: 'Branch type of the organization',
    example: OrganizationBranchTypeEnum.HEAD_OFFICE,
    enum: OrganizationBranchTypeEnum,
  })
  @IsEnum(OrganizationBranchTypeEnum, {
    message: 'Branch type must be HEAD_OFFICE or BRANCH',
  })
  @IsNotEmpty()
  branchType: OrganizationBranchTypeEnum;

  @ApiProperty({
    description: 'Branch number (00000 for head office)',
    example: '00000',
  })
  @IsString()
  @IsNotEmpty()
  branchNumber: string;

  @ApiProperty({
    description: 'Name of the branch',
    example: 'Head Office',
  })
  @IsString()
  @IsNotEmpty()
  branchName: string;

  @ApiProperty({
    description: 'Acceptance of terms and conditions',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  acceptTerms: boolean;

  @ApiPropertyOptional({
    description: 'Description of business type if needed',
    example: 'This business focuses on manufacturing and distribution.',
  })
  @IsString()
  @IsOptional()
  businessTypeDescription?: string;
}

/**
 * DTO for registered individual organization information
 */
export class RegisteredIndividualInfoDto {
  @ApiProperty({
    description: 'Thai ID card number',
    example: '1234567890123',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{12}$/, {
    message: 'ID card must be 13 digits and cannot start with 0',
  })
  idCard: string;

  @ApiProperty({
    description: 'Name as registered',
    example: 'John Doe Shop',
  })
  @IsString()
  @IsNotEmpty()
  registrationName: string;

  @ApiProperty({
    description: 'Business types that the organization operates',
    example: [RoleBusinessType.MDT],
    enum: RoleBusinessType,
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  @IsEnum(RoleBusinessType, {
    each: true,
    message: 'Each businessType must be a valid RoleBusinessType',
  })
  businessType: string[];

  @ApiProperty({
    description: 'Registration number from government',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({
    description: 'Acceptance of terms and conditions',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  acceptTerms: boolean;

  @ApiPropertyOptional({
    description: 'Description of business type if needed',
    example: 'This business focuses on manufacturing and distribution.',
  })
  @IsString()
  @IsOptional()
  businessTypeDescription?: string;
}

/**
 * DTO for creating a new organization
 */
export class CreateOrganizationDto {
  @ApiProperty({
    description: 'ID of the user creating the organization',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'Type of organization to create',
    example: OrgType.PERSONAL,
    enum: OrgType,
  })
  @IsEnum(OrgType, {
    message:
      'Organization type must be PERSONAL, JURISTIC, or REGISTERED_INDIVIDUAL',
  })
  @IsNotEmpty()
  organizationType: OrgType;

  @ApiPropertyOptional({
    description:
      'Personal organization information (required if organizationType is PERSONAL)',
    type: PersonalOrganizationInfoDto,
  })
  @ValidateIf((o) => o.organizationType === OrgType.PERSONAL)
  @IsNotEmpty({
    message: 'personalInfo is required when organizationType is PERSONAL',
  })
  @ValidateNested()
  @Type(() => PersonalOrganizationInfoDto)
  personalInfo?: PersonalOrganizationInfoDto;

  @ApiPropertyOptional({
    description:
      'Juristic organization information (required if organizationType is JURISTIC)',
    type: JuristicOrganizationInfoDto,
  })
  @ValidateIf((o) => o.organizationType === OrgType.JURISTIC)
  @IsNotEmpty({
    message: 'juristicInfo is required when organizationType is JURISTIC',
  })
  @ValidateNested()
  @Type(() => JuristicOrganizationInfoDto)
  juristicInfo?: JuristicOrganizationInfoDto;

  @ApiPropertyOptional({
    description:
      'Registered individual information (required if organizationType is REGISTERED_INDIVIDUAL)',
    type: RegisteredIndividualInfoDto,
  })
  @ValidateIf((o) => o.organizationType === OrgType.REGISTERED_INDIVIDUAL)
  @IsNotEmpty({
    message:
      'registeredIndividualInfo is required when organizationType is REGISTERED_INDIVIDUAL',
  })
  @ValidateNested()
  @Type(() => RegisteredIndividualInfoDto)
  registeredIndividualInfo?: RegisteredIndividualInfoDto;

  @ApiPropertyOptional({
    description: 'Skip updating user registration step (for internal use)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  skipRegisterStep?: boolean;
}
