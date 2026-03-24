import { IsOptional, IsNotEmpty, IsDateString, IsString, IsEnum, IsObject, ValidateNested, Length, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserGender } from '../../../../model/enum/user.enum';
import { MaritalStatus } from '../../../../model/user.entity';
import { UserAddressDto } from '@/modules/user-address/dto/user-address.dto';
import { AddressTypeEnum } from '@/model/user-address.entity';
import { DocumentType } from '@/modules/user/enum/file-type.enum';

export class PersonalInfoDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  firstNameEn: string;

  @IsOptional()
  @IsString()
  middleNameEn?: string;

  @IsNotEmpty()
  @IsString()
  lastNameEn: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;

  @IsNotEmpty()
  @IsEnum(UserGender)
  gender: UserGender;

  @IsNotEmpty()
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @IsString()
  @IsNotEmpty({ message: 'ID Card number is required' })
  @Length(13, 13, { message: 'ID Card number must be exactly 13 digits' })
  idCard: string;
}

export class AddressInfoDto {
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

class UsedAddressInfoDto extends AddressInfoDto {
  @IsOptional()
  @IsEnum(AddressTypeEnum)
  usedAddress: AddressTypeEnum;
}

export class AddressesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInfoDto)
  addressIdCard?: AddressInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UsedAddressInfoDto)
  addressCurrent?: UsedAddressInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UsedAddressInfoDto)
  addressTaxInvoice?: UsedAddressInfoDto;
}

export class IdentityVerificationDto {
  @IsNotEmpty()
  @IsBoolean()
  sendApproval: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo?: PersonalInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressesDto)
  addressInfo?: AddressesDto;
}

export class PersonalInfoResponseDto {
  id: number;
  cisNumber: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  firstNameEn: string;
  middleNameEn?: string;
  lastNameEn: string;
  birthDate: string;
  gender: UserGender;
  maritalStatus: MaritalStatus;
  idCard: string;
}

export class AddressInfoResponseDto {
  usedAddress?: AddressTypeEnum;
  address: string;
  countryId: number;
  countryNameTh: string;
  provinceId: number;
  provinceNameTh: string;
  districtId: number;
  districtNameTh: string;
  subDistrictId: number;
  subDistrictNameTh: string;
  zipCode: string;
  cisNumber?: string;
}

export class UserAddressesResponseDto {
  addressIdCard?: AddressInfoResponseDto;
  addressCurrent?: AddressInfoResponseDto;
  addressTaxInvoice?: AddressInfoResponseDto;
}

export class IdentityVerificationResponseDto {
  personalInfo: PersonalInfoResponseDto;
  addressInfo: UserAddressesResponseDto;

  public static fromUserAndAddresses(user: any, addresses: UserAddressDto[]): IdentityVerificationResponseDto {
    const response = new IdentityVerificationResponseDto();
    
    // Personal Info
    response.personalInfo = {
      id: user.id,
      cisNumber: user.cisNumber,
      email: user.email,
      firstName: user.firstNameTh,
      middleName: user.middleNameTh,
      lastName: user.lastNameTh,
      firstNameEn: user.firstNameEn,
      middleNameEn: user.middleNameEn,
      lastNameEn: user.lastNameEn,
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : undefined,
      gender: user.gender,
      maritalStatus: user.maritalStatus,
      idCard: user.idCard,
    };

    // Address Info
    response.addressInfo = {
      addressIdCard: this.mapAddressByType(addresses, AddressTypeEnum.ID_CARD),
      addressCurrent: this.mapAddressByType(addresses, AddressTypeEnum.CURRENT),
      addressTaxInvoice: this.mapAddressByType(addresses, AddressTypeEnum.TAX_INVOICE),
    };

    return response;
  }

  private static mapAddressByType(addresses: UserAddressDto[], type: AddressTypeEnum): AddressInfoResponseDto | undefined {
    const address = addresses.find(addr => addr.addressType === type);
    if (!address) return undefined;

    return {
      usedAddress: address.usedAddress,
      address: address.address,
      countryId: address.countryId,
      countryNameTh: address.country?.nameTh,
      provinceId: address.provinceId,
      provinceNameTh: address.province?.nameTh,
      districtId: address.districtId,
      districtNameTh: address.district?.nameTh,
      subDistrictId: address.subDistrictId,
      subDistrictNameTh: address.subDistrict?.nameTh,
      zipCode: address.subDistrict?.zipCode,
      cisNumber: address.cisNumber,
    };
  }
}

export class UploadIdentityVerificationDto {
  
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  sendApproval: boolean;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType: DocumentType;
}