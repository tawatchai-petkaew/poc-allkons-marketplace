import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RoleBusinessType } from '@/modules/register/enum/register.enum';
import { JuristicTypeCIS } from '@/modules/cis/enum/cis.enum';
import { Type as OrganizationType } from '@/model/organization.entity';
import { AddressTypeEnum } from '@/model/user-address.entity';

export class OrganizeInfoDto {
  @ApiProperty({ example: 'Seller Revamp' })
  @IsString()
  @IsNotEmpty()
  organizeName: string;

  @ApiProperty({ 
    example: ['AGENT'],
    enum: RoleBusinessType,
    isArray: true
  })
  @IsArray()
  @IsEnum(RoleBusinessType, { each: true })
  businessType: string[];

  @ApiProperty({ example: '1234567890123' })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({ 
    example: 'PUBLIC_LIMITED_COMPANY',
    enum: JuristicTypeCIS
  })
  @IsEnum(JuristicTypeCIS)
  juristicType: JuristicTypeCIS;

  @ApiProperty({ 
    example: 'HEAD_OFFICE',
    enum: OrganizationType
  })
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiProperty({ example: '', required: false })
  @ValidateIf(o => o.type === OrganizationType.BRANCH)
  @IsString()
  @IsNotEmpty()
  branchNumber?: string;

  @ApiProperty({ 
    description: 'Remark type for other information',
    example: 'Other information about the organization',
    required: false
  })
  @ValidateIf(o => o.juristicType === "OTHER")
  @IsString()
  @IsNotEmpty({ message: 'remarkTypeOther is required when juristicType is OTHER' })
  remarkTypeOther?: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  mainPhoneNumber: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  otherPhoneNumber?: string;

  @ApiProperty({ example: '' })
  @IsEmail()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNumber()
  juristicTypeId: number;
}

export class HighestAuthorityDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  highestAuthorityName: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  highestAuthorityPosition: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  highestAuthorityPhoneNumber: string;

  @ApiProperty({ example: '' })
  @IsEmail()
  @IsNotEmpty()
  highestAuthorityEmail: string;
}

export class ContactDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  contactPhoneNumber: string;

  @ApiProperty({ example: '' })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;
}

export class ContactInfoDto {
  @ApiProperty({ type: HighestAuthorityDto })
  @ValidateNested()
  @Type(() => HighestAuthorityDto)
  highestAuthority: HighestAuthorityDto;

  @ApiProperty({ type: ContactDto })
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  contactShownHighestAuthority: boolean;
}

export class AddressDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  subDistrictId: string;

  @IsNotEmpty()
  @IsString()
  districtId: string;

  @IsNotEmpty()
  @IsString()
  provinceId: string;

  @IsNotEmpty()
  @IsString()
  countryId: string;

  @IsNotEmpty()
  @IsString()
  zipCode: string;
}

export class AddressWithUsedAddressDto extends AddressDto {
  @ApiProperty({ 
    example: 'ID_CARD',
    enum: AddressTypeEnum
  })
  @IsEnum(AddressTypeEnum)
  usedAddress: AddressTypeEnum;
}

export class AddressInfoDto {
  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  addressIdCard: AddressDto;

  @ApiProperty({ type: AddressWithUsedAddressDto })
  @ValidateNested()
  @Type(() => AddressWithUsedAddressDto)
  addressCurrent: AddressWithUsedAddressDto;

  @ApiProperty({ type: AddressWithUsedAddressDto })
  @ValidateNested()
  @Type(() => AddressWithUsedAddressDto)
  addressTaxInvoice: AddressWithUsedAddressDto;
}

export class UpdateIdentityVerificationDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  sendApproval: boolean;

  @ApiProperty({ type: OrganizeInfoDto })
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => OrganizeInfoDto)
  organizeInfo: OrganizeInfoDto;

  @ApiProperty({ type: ContactInfoDto })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo?: ContactInfoDto;

  @ApiProperty({ type: AddressInfoDto })
  @ValidateNested()
  @Type(() => AddressInfoDto)
  addressInfo: AddressInfoDto;
}
