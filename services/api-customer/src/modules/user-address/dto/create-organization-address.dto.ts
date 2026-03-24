import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { AddressTypeEnum } from '../../../model/user-address.entity';

export class CreateOrganizationAddressDto {
  @IsNotEmpty()
  @IsNumber()
  organizationId: number;

  @IsNotEmpty()
  @IsEnum(AddressTypeEnum)
  addressType: AddressTypeEnum;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  countryId: number;

  @IsNotEmpty()
  @IsNumber()
  provinceId: number;

  @IsNotEmpty()
  @IsNumber()
  districtId: number;

  @IsNotEmpty()
  @IsNumber()
  subDistrictId: number;

  @IsNotEmpty()
  @IsNumber()
  zipCode: number;

  @IsNotEmpty()
  @IsString()
  cisNumber: string;

  @IsOptional()
  @IsEnum(AddressTypeEnum)
  usedAddress?: AddressTypeEnum;
}
