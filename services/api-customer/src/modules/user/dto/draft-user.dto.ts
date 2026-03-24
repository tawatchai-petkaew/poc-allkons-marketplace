import { AddressTypeEnum } from '@/model/draft-user-address.entity';
import { kycStatus, MaritalStatus } from '@/model/draft-user.entity';
import { UserGender } from '@/model/enum/user.enum';
import { RoleBusinessType } from '@/modules/register/enum/register.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDraftUserDto {
  id: number;
  image: string;
  countryCode: string;
  tel: string;
  email: string;
  firstNameTh: string;
  middleNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  middleNameEn: string;
  lastNameEn: string;
  gender: UserGender;
  maritalStatus: MaritalStatus;
  birthDate: Date;
  idCard: string;
  businessType: string[];
  kycStatus: kycStatus;
  userId: number;
}

export class CreateDraftUserAddressDto {
  addressType: AddressTypeEnum;
  address: string;
  countryId: number;
  provinceId: number;
  districtId: number;
  subDistrictId: number;
  isSameAddress: AddressTypeEnum;
  draftUserId: number;
}

export class UpdateDraftUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  image: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  countryCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  tel: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  firstNameTh: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  middleNameTh: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  lastNameTh: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  firstNameEn: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  middleNameEn: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  lastNameEn: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  idCard: string;

  @IsEnum(UserGender)
  @IsOptional()
  @ApiProperty()
  gender: UserGender;

  @IsEnum(MaritalStatus)
  @IsOptional()
  @ApiProperty()
  maritalStatus: MaritalStatus;

  @IsString()
  @IsOptional()
  @ApiProperty()
  birthDate: Date;

  @IsArray()
  @IsOptional()
  @IsEnum(RoleBusinessType, { each: true, message: 'Each businessType must be a valid RoleBusinessType' })
  @ApiProperty()
  businessType: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty()
  draftUserAddresses: UpdateDraftUserAddressDto[];
}

export class UpdateDraftUserAddressDto {

  @IsEnum(AddressTypeEnum)
  @IsOptional()
  @ApiProperty()
  addressType: AddressTypeEnum;

  @IsString()
  @IsOptional()
  @ApiProperty()
  address: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  countryId: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  provinceId: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  districtId: number;

  @IsEnum(AddressTypeEnum)
  @IsOptional()
  @ApiProperty()
  subDistrictId: number;

  @IsEnum(AddressTypeEnum)
  @IsOptional()
  @ApiProperty()
  isSameAddress: AddressTypeEnum;
}
