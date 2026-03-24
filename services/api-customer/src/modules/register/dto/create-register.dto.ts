import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { JuristicTypeCIS, OrganizeTypeCIS } from '@/modules/cis/enum/cis.enum';
import {
  RegisterOrganizationType,
  RoleBusinessType,
} from '../enum/register.enum';
import { Type } from 'class-transformer';
import { OrganizationType } from '@/model/organization.entity';
import {
  JuristicTypeValue,
  OrganizationBranchType,
} from '@/modules/organization/enum/organization.enum';
import { Platform } from '@/model/organization-contact.entity';
import { RegisterStep, RegisterStatus } from '@/model/enum/user.enum';

export class phoneNumberDto {
  @ApiProperty({
    description: 'Country code for the phone number',
    example: '66',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2)
  @Matches(/^66$/, { message: 'Country code must be 66' })
  countryCode: string;

  @ApiProperty({
    description: 'Phone number',
    example: '987654324',
  })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  // @IsPhoneNumber('TH')
  phoneNumber: string;

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;
}

export class verifyOtpSmsDto {
  @ApiProperty({
    description: 'Country code for the phone number',
    example: '66',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2)
  countryCode: string;

  @ApiProperty({
    description: 'OTP code sent to the phone number',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  otp: string;

  @ApiProperty({
    description: 'Token received during OTP generation',
    example: 'mb6Yv4nXDp95Q5niKUwB....',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Phone number',
    example: '987654324',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(9)
  @IsPhoneNumber('TH')
  phoneNumber: string;
}

export class RegisterPhoneNumberDto {
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

  @ApiProperty({
    description: 'Password for the account',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Platform from which the user is registering',
    example: 'web',
  })
  @IsOptional()
  @IsBoolean()
  isSeller?: boolean;
}

export class UserInfoDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User middle name',
    example: 'William',
    required: false,
  })
  @IsString()
  @IsOptional()
  midName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;
}

export class CreateDraftProfileDto {
  @ApiProperty({
    description: 'User phone number',
    example: '0812345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'User personal information',
    type: UserInfoDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserInfoDto)
  userInfo: UserInfoDto;
}

export class CreateDraftProfileResponseDto {
  @ApiProperty({
    description: 'Profile ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'User phone number',
    example: '0812345678',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'User personal information',
    type: UserInfoDto,
  })
  @ValidateNested()
  @Type(() => UserInfoDto)
  userInfo: UserInfoDto;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-05-25T10:00:00.000Z',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-05-25T10:00:00.000Z',
  })
  @IsString()
  updatedAt: string;
}

export class OrgPersonalInfoDto {
  @ApiProperty({
    description: 'Types of business',
    example: ['AGENT', 'RETAIL'],
    isArray: true,
    type: String,
    enum: RoleBusinessType,
  })
  @IsNotEmpty()
  @IsEnum(RoleBusinessType, {
    each: true,
    message: 'Each businessType must be a valid RoleBusinessType',
  })
  businessType: string[];

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
}

export class OrgPersonalInfoBuyerDto {
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
}

export class OrgJuristicInfoDto {
  @ApiProperty({
    description: 'Juristic name of the organization',
    example: 'AGENT',
  })
  @IsString()
  @IsNotEmpty()
  juristicName: string;

  @ApiProperty({
    description: 'Types of business',
    example: ['AGENT', 'RETAIL'],
    isArray: true,
    type: String,
    enum: RoleBusinessType,
  })
  @IsNotEmpty()
  @IsEnum(RoleBusinessType, {
    each: true,
    message: 'Each businessType must be a valid RoleBusinessType',
  })
  businessType: string[];

  @ApiProperty({
    description: 'Tax ID number',
    example: '0123456789012',
  })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({
    enum: JuristicTypeCIS,
    description: 'Type of juristic entity',
    example: JuristicTypeCIS.LIMITED_COMPANY,
    required: true,
  })
  @IsEnum(JuristicTypeCIS, {
    message: 'Juristic type must be one of the defined types',
  })
  @IsString()
  @IsNotEmpty()
  juristicType: JuristicTypeCIS;

  @ApiProperty({
    description: 'Remark type for other information',
    example: 'Other information about the organization',
    required: false,
  })
  @ValidateIf((o) => o.juristicType === 'OTHER')
  @IsString()
  @IsNotEmpty({
    message: 'remarkTypeOther is required when juristicType is OTHER',
  })
  remarkTypeOther?: string;

  @IsNumber()
  juristicTypeId?: number;

  @IsOptional()
  @IsString()
  businessTypeDescription?: string;
}

export class OrgJuristicInfoBuyerDto {
  @ApiProperty({
    description: 'Juristic name of the organization',
    example: 'AGENT',
  })
  @IsString()
  @IsNotEmpty()
  juristicName: string;

  @ApiProperty({
    description: 'Tax ID number',
    example: '0123456789012',
  })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({
    enum: JuristicTypeCIS,
    description: 'Type of juristic entity',
    example: JuristicTypeCIS.LIMITED_COMPANY,
    required: true,
  })
  @IsEnum(JuristicTypeCIS, {
    message: 'Juristic type must be one of the defined types',
  })
  @IsString()
  @IsNotEmpty()
  juristicType: JuristicTypeCIS;

  @ApiProperty({
    description: 'Remark type for other information',
    example: 'Other information about the organization',
    required: false,
  })
  @ValidateIf((o) => o.juristicType === 'OTHER')
  @IsString()
  @IsNotEmpty({
    message: 'remarkTypeOther is required when juristicType is OTHER',
  })
  remarkTypeOther?: string;

  @IsNumber()
  juristicTypeId?: number;
}
export class CreateProfileDto {
  @ApiProperty({
    description: 'User phone number',
    example: '812345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'User personal information',
    type: UserInfoDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserInfoDto)
  userInfo: UserInfoDto;

  @ApiProperty({
    description: 'Terms and conditions acceptance',
    example: true,
  })
  @IsNotEmpty()
  acceptTerms: boolean;

  @ApiProperty({
    description: 'Organization type',
    example: OrganizationType.PERSONAL,
    enum: OrganizationType,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(OrganizationType, {
    message: 'Organization type must be PERSONAL or JURISTIC',
  })
  orgType: OrganizationType;

  @ApiProperty({
    description: 'Personal organization information',
    type: OrgPersonalInfoDto,
    required: false,
  })
  @ValidateIf((o) => o.orgType === OrganizationType.PERSONAL)
  @IsNotEmpty({
    message: 'orgPersonalInfo is required when orgType is PERSONAL',
  })
  @ValidateNested()
  @Type(() => OrgPersonalInfoDto)
  orgPersonalInfo?: OrgPersonalInfoDto;

  @ApiProperty({
    description: 'Juristic organization information',
    type: OrgJuristicInfoDto,
    required: false,
  })
  @ValidateIf((o) => o.orgType === OrganizationType.JURISTIC)
  @IsNotEmpty({
    message: 'orgJuristicInfo is required when orgType is JURISTIC',
  })
  @ValidateNested()
  @Type(() => OrgJuristicInfoDto)
  orgJuristicInfo?: OrgJuristicInfoDto;
}

export class CreateProfileBuyerDto {
  @ApiProperty({
    description: 'User phone number',
    example: '0812345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'User personal information',
    type: UserInfoDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserInfoDto)
  userInfo: UserInfoDto;

  @ApiProperty({
    description: 'Terms and conditions acceptance',
    example: true,
  })
  @IsNotEmpty()
  acceptTerms: boolean;

  @ApiProperty({
    description: 'Organization type',
    example: OrganizationType.PERSONAL,
    enum: OrganizationType,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(OrganizationType, {
    message: 'Organization type must be PERSONAL or JURISTIC',
  })
  orgType: OrganizationType;

  @ApiProperty({
    description: 'personal organization information',
    type: OrgPersonalInfoDto,
    required: false,
  })
  @IsOptional()
  @Type(() => OrgJuristicInfoBuyerDto)
  orgPersonalInfo?: OrgPersonalInfoBuyerDto;

  @ApiProperty({
    description: 'Juristic organization information',
    type: OrgJuristicInfoBuyerDto,
    required: false,
  })
  @IsOptional()
  @Type(() => OrgJuristicInfoBuyerDto)
  orgJuristicInfo?: OrgJuristicInfoBuyerDto;
}

class OrgBranchInfoDto {
  @ApiProperty({
    description: 'Organization branch cis number',
    example: '6e17b7c8-fa57-4ed9-9f5c-e2c54c04140f',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cisNumber: string;

  @ApiProperty({
    description: 'Organization branch code',
    example: '00000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  organizeBranchCode: string;

  @ApiProperty({
    description: 'Organization branch name',
    example: 'My Organization branch',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  organizeBranchName: string;

  @ApiProperty({
    description: 'Organization branch Id',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  organizeBranchId: number;

  @ApiProperty({
    description: 'Organization branch type',
    example: OrganizeTypeCIS.HEAD_OFFICE,
    enum: OrganizeTypeCIS,
    required: true,
  })
  @IsEnum(OrganizeTypeCIS, {
    message: 'Organize type must be one of the defined types',
  })
  @IsNotEmpty()
  organizeBranchType: OrganizeTypeCIS;
}

class OrgInfoDto {
  @ApiProperty({
    description: 'Organization cis number',
    example: '6e17b7c8-fa57-4ed9-9f5c-e2c54c04140f',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cisNumber: string;

  @ApiProperty({
    description: 'Organization id',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Organization tax ID',
    example: '1234567890123',
    required: true,
  })
  @IsOptional()
  @IsString()
  taxId: string;

  @ApiProperty({
    description: 'Organization id card',
    example: '1234567890123',
    required: true,
  })
  @IsOptional()
  @IsString()
  idCard: string;

  @ApiProperty({
    description: 'Organization juristic type',
    example: JuristicTypeCIS.LIMITED_COMPANY,
    enum: JuristicTypeCIS,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(JuristicTypeCIS, {
    message: 'Juristic type must be one of the defined types',
  })
  juristicType: JuristicTypeCIS;

  @ApiProperty({
    description: 'Organization name',
    example: 'My Organization',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  organizeName: string;

  @ApiProperty({
    description: 'Organization type',
    example: OrganizeTypeCIS.HEAD_OFFICE,
    enum: OrganizeTypeCIS,
    required: true,
  })
  @IsEnum(OrganizeTypeCIS, {
    message: 'Organize branch type must be one of the defined types',
  })
  @IsOptional()
  organizeBranchType: OrganizeTypeCIS;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrgBranchInfoDto)
  @IsNotEmpty({ message: 'Organization branch information is required' })
  organizeBranchInfo?: OrgBranchInfoDto;
}

export class CreateShopDto {
  @ApiProperty({
    description: 'phone number',
    example: '0812345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Country code for the phone number',
    example: '66',
  })
  @IsString()
  @IsOptional()
  countryCode: string;

  @ApiProperty({
    description: 'Shop name',
    example: 'My Shop',
  })
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @ApiProperty({
    description: 'Merchants name',
    example: 'Head office',
  })
  @IsString()
  @IsOptional()
  merchantName?: string;

  @ApiProperty({
    description: 'Merchants branch code',
    example: '00000',
  })
  @IsString()
  @IsOptional()
  merchantBranchCode?: string;

  @ApiProperty({
    description: 'slug',
    example: 'seller1slug',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Organization type',
    example: OrganizationType.PERSONAL,
    enum: OrganizationType,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(OrganizationType, {
    message:
      'Organization type must be PERSONAL or JURISTIC or REGISTERED_INDIVIDUAL',
  })
  type: OrganizationType;

  @ApiProperty({
    description: 'Skip register step',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  skipRegisterStep?: boolean;

  @ApiProperty({
    description: 'Organization information',
    example: {
      cisNumber: '6e17b7c8-fa57-4ed9-9f5c-e2c54c04140f',
      id: 1,
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgInfoDto)
  @IsNotEmpty({ message: 'Organization information is required' })
  organizeInfo?: OrgInfoDto;
}

export class CreateUserProfileDto {
  @ApiProperty({
    description: 'Country code for the phone number',
    example: '66',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({
    description: 'User phone number',
    example: '812345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'User profile information',
    type: UserInfoDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserInfoDto)
  userInfo: UserInfoDto;

  @ApiProperty({
    description: 'Platform from which the user is registering',
    example: 'SELLER',
    enum: Platform,
    required: true,
  })
  @IsOptional()
  @IsEnum(Platform, { message: 'Platform must be one of the defined types' })
  platform?: Platform = Platform.SELLER;
}

export class OrgTypePersonalDto {
  @IsEnum(RoleBusinessType, {
    each: true,
    message: 'Each businessType must be a valid RoleBusinessType',
  })
  @IsOptional()
  businessType?: string[];

  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{12}$/, {
    message: 'ID card must be 13 digits and cannot start with 0',
  })
  idCard: string;

  @IsBoolean()
  @IsNotEmpty()
  acceptTerms: boolean;
}

export class OrgTypeJuristicDto {
  @IsNotEmpty()
  @IsEnum(RoleBusinessType, {
    each: true,
    message: 'Each businessType must be a valid RoleBusinessType',
  })
  businessType: string[];

  @IsString()
  @IsNotEmpty()
  taxId: string;

  @IsEnum(JuristicTypeValue, {
    message: 'Juristic type must be one of the defined types',
  })
  @IsNotEmpty()
  juristicType: JuristicTypeValue;

  @IsString()
  @IsOptional()
  remarkTypeOther?: string;

  @IsNumber()
  @IsNotEmpty()
  juristicTypeId: number;

  @IsString()
  @IsNotEmpty()
  juristicName: string;

  @IsEnum(OrganizationBranchType, {
    message: 'Branch type must be HEAD_OFFICE or BRANCH',
  })
  @IsNotEmpty()
  branchType: OrganizationBranchType;

  @IsString()
  @IsNotEmpty()
  branchNumber: string;

  @IsString()
  @IsNotEmpty()
  branchName: string;

  @IsBoolean()
  @IsNotEmpty()
  acceptTerms: boolean;

  @IsOptional()
  @IsString()
  businessTypeDescription?: string;
}

export class OrgIndividualDto {
  constructor(partials: Partial<OrgIndividualDto>) {
    Object.assign(this, partials);
  }
  @IsString()
  @IsNotEmpty()
  idCard: string;

  @IsString()
  @IsNotEmpty()
  registrationName: string;

  @IsNotEmpty()
  @IsEnum(RoleBusinessType, {
    each: true,
    message: 'Each businessType must be a valid RoleBusinessType',
  })
  businessType: string[];

  @IsString()
  @IsOptional()
  businessTypeDescription?: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsBoolean()
  @IsNotEmpty()
  acceptTerms: boolean;
}

export class CreateOrganizationProfileDto {
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsBoolean()
  skipRegisterStep?: boolean;

  @IsEnum(RegisterOrganizationType)
  orgType: RegisterOrganizationType;

  @ValidateIf((o) => o.orgType === RegisterOrganizationType.PERSONAL)
  @IsNotEmpty({
    message: 'orgPersonalInfo is required when orgType is PERSONAL',
  })
  @ValidateNested()
  @Type(() => OrgTypePersonalDto)
  orgPersonalInfo?: OrgTypePersonalDto;

  @ValidateIf((o) => o.orgType === RegisterOrganizationType.JURISTIC)
  @IsNotEmpty({
    message: 'orgJuristicInfo is required when orgType is JURISTIC',
  })
  @ValidateNested()
  @Type(() => OrgTypeJuristicDto)
  orgJuristicInfo?: OrgTypeJuristicDto;

  @ValidateIf(
    (o) => o.orgType === RegisterOrganizationType.REGISTERED_INDIVIDUAL,
  )
  @IsNotEmpty({
    message:
      'orgIndividualInfo is required when orgType is REGISTERED_INDIVIDUAL',
  })
  @ValidateNested()
  @Type(() => OrgIndividualDto)
  orgIndividualInfo?: OrgIndividualDto;
}

export class UpdateUserRegistrationDto extends phoneNumberDto {
  @ApiProperty({
    description: 'Registration step',
    enum: RegisterStep,
    example: RegisterStep.USER_INFO,
  })
  @IsNotEmpty()
  @IsEnum(RegisterStep)
  registerStep: RegisterStep;

  @ApiProperty({
    description: 'Registration status',
    enum: RegisterStatus,
    example: RegisterStatus.IN_PROGRESS,
  })
  @IsNotEmpty()
  @IsEnum(RegisterStatus)
  registerStatus: RegisterStatus;
}
