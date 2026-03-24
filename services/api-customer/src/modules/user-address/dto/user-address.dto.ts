import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsString, IsDate, IsBoolean } from 'class-validator';
import { AddressTypeEnum, UserAddress } from '../../../model/user-address.entity';

export class LocationInfoDto {
  id: number;
  nameTh: string;
  nameEn?: string;
  code?: string;
}

export class SubDistrictInfoDto extends LocationInfoDto {
  zipCodeId: string;
  zipCode: string;
}

export class UserAddressDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  organizationId: number;

  @IsNotEmpty()
  @IsBoolean()
  isOrganizationAddress: boolean;

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

  country: LocationInfoDto;
  province: LocationInfoDto;
  district: LocationInfoDto;
  subDistrict: SubDistrictInfoDto;

  @IsOptional()
  @IsEnum(AddressTypeEnum)
  usedAddress?: AddressTypeEnum;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  public static fromEntity(entity: UserAddress): UserAddressDto {
    const dto = new UserAddressDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.addressType = entity.addressType;
    dto.address = entity.address;
    dto.countryId = entity.countryId;
    dto.provinceId = entity.provinceId;
    dto.districtId = entity.districtId;
    dto.subDistrictId = entity.subDistrictId;
    dto.cisNumber = entity.cisNumber;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.usedAddress = entity.usedAddress;
    dto.organizationId = entity.organizationId;
    dto.isOrganizationAddress = entity.organizationId ? true : false;

    if (entity.country) {
      dto.country = {
        id: entity.country.id,
        nameTh: entity.country.name
      };
    }

    if (entity.province) {
      dto.province = {
        id: entity.province.id,
        nameTh: entity.province.name_th,
        nameEn: entity.province.name_en,
        code: entity.province.code
      };
    }

    if (entity.district) {
      dto.district = {
        id: entity.district.id,
        nameTh: entity.district.name_th,
        nameEn: entity.district.name_en,
        code: entity.district.code
      };
    }

    if (entity.subDistrict) {
      dto.subDistrict = {
        id: entity.subDistrict.id,
        nameTh: entity.subDistrict.name_th,
        nameEn: entity.subDistrict.name_en,
        zipCode: entity.subDistrict.zip_code,
        code: entity.subDistrict.code,
        zipCodeId: entity.subDistrict.zipCodeId
      };
    }

    return dto;
  }

  public static toEntity(dto: Partial<UserAddressDto>): UserAddress {
    const entity = new UserAddress();
    if (dto.id) entity.id = dto.id;
    if (dto.userId) entity.userId = dto.userId;
    if (dto.addressType) entity.addressType = dto.addressType;
    if (dto.address) entity.address = dto.address;
    if (dto.countryId) entity.countryId = dto.countryId;
    if (dto.provinceId) entity.provinceId = dto.provinceId;
    if (dto.districtId) entity.districtId = dto.districtId;
    if (dto.subDistrictId) entity.subDistrictId = dto.subDistrictId;
    if (dto.cisNumber) entity.cisNumber = dto.cisNumber;
    return entity;
  }
}
