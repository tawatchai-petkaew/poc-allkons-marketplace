import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { AddressTypeEnum } from '../../../model/user-address.entity';

export class UpdateUserAddressDto {
  @IsOptional()
  @IsEnum(AddressTypeEnum)
  addressType?: AddressTypeEnum;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  countryId?: number;

  @IsOptional()
  @IsNumber()
  provinceId?: number;

  @IsOptional()
  @IsNumber()
  districtId?: number;

  @IsOptional()
  @IsNumber()
  subDistrictId?: number;

  @IsOptional()
  @IsNumber()
  zipCode?: number;

  @IsOptional()
  @IsString()
  cisNumber?: string;

  @IsOptional()
  @IsEnum(AddressTypeEnum)
  usedAddress?: AddressTypeEnum;
}
