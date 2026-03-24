import { JuristicTypeCIS } from '@/modules/cis/enum/cis.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { JuristicTypeValue } from '../enum/organization.enum';
import { OrganizationType, Type } from '@/model/organization.entity';
import { kycStatus } from '@/model/user.entity';
import { UserAddressDto } from '@/modules/user-address/dto/user-address.dto';
import { AddressTypeEnum } from '@/model/user-address.entity';
import { RoleBusinessType } from '@/modules/register/enum/register.enum';
import { JuristicType } from '@/model/juristic-type.entity';

export class CheckTaxId {
  @ApiProperty({
    description: 'Tax ID of the organization',
  })
  @IsNotEmpty()
  @IsString()
  taxId: string;

  @ApiProperty({
    description: 'Branch Number of the organization',
  })
  @IsOptional()
  @IsString()
  organizeBranchNumber?: string;

  @ApiProperty({
    description:
      'Organization ID to exclude from duplication check (for updating existing organization)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  organizationId?: number;
}

export class OrganizationDto {
  constructor(partial: Partial<OrganizationDto>) {
    Object.assign(this, partial);
  }
  @ApiProperty({
    description: '',
    example: 1,
    enum: JuristicTypeCIS,
  })
  @IsOptional()
  @IsEnum(JuristicTypeCIS)
  organizeType: JuristicTypeCIS;

  @ApiProperty({
    description: '',
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  organizeName: string;

  @ApiProperty({
    description: '',
    example: '',
  })
  @IsString()
  cisNumber: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  mainPhoneNumber: string;

  @ApiProperty({
    example: ['AGENT'],
    enum: RoleBusinessType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(RoleBusinessType, { each: true })
  businessType?: string[];

  @ApiProperty({ example: '' })
  @IsString()
  type?: Type;

  @ApiProperty({ example: '' })
  @IsString()
  remarkTypeOther?: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  mainEmail?: string;

  @IsNumber()
  juristicTypeId?: number;

  @IsString()
  @IsOptional()
  branchNumber?: string;

  @IsString()
  @IsOptional()
  branchName?: string;

  @IsEnum(OrganizationType, { message: 'Invalid organization type' })
  organizationType?: OrganizationType;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  idCard?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsNumber()
  @IsOptional()
  parentOrganizationId?: number;

  @IsNumber()
  @IsOptional()
  headOfficeId?: number;

  @IsString()
  @IsOptional()
  businessTypeDescription?: string;
}

export class OrganizationInfoResponseDto {
  id: number;
  cisNumber: string;
  taxId: string;
  juristicType: JuristicTypeValue;
  organizeName: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  type: Type;
  businessType: string[];
  remarkTypeOther: string | null;
  branchNumber: string | null;
  kycStatus: kycStatus;
  mainPhoneNumber: string;
  email: string;
  otherPhoneNumber: string;
  juristic: JuristicType;
}

export class OrganizationHighestAuthorityResponseDto {
  highestAuthorityName: string;
  highestAuthorityPosition: string;
  highestAuthorityPhoneNumber: string;
  highestAuthorityEmail: string;
}

export class OrganizationContactResponseDto {
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
}

export class OrganizationContactInfoResponseDto {
  highestAuthority: OrganizationHighestAuthorityResponseDto;
  contact: OrganizationContactResponseDto;
  contactShownHighestAuthority: boolean;
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

export class OrganizationResponseDto {
  sendApproval: boolean;
  organizationInfo: OrganizationInfoResponseDto;
  contactInfo: OrganizationContactInfoResponseDto;
  addressInfo: UserAddressesResponseDto;

  public static fromDto(
    organization: any,
    addresses: UserAddressDto[],
  ): OrganizationResponseDto {
    const response = new OrganizationResponseDto();

    response.organizationInfo = {
      id: organization.id,
      cisNumber: organization.cisNumber,
      taxId: organization.taxId,
      juristicType: JuristicTypeCIS[
        organization.organizeType
      ] as JuristicTypeValue,
      organizeName: organization.organizeName,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      deletedAt: organization.deletedAt,
      type: Type[organization.type],
      businessType: organization.businessType,
      remarkTypeOther: organization.remarkTypeOther,
      branchNumber: organization.branchNumber,
      kycStatus: kycStatus[organization.kycStatus],
      mainPhoneNumber: organization.mainPhoneNumber,
      otherPhoneNumber: organization.otherPhoneNumber,
      email: organization.mainEmail,
      juristic: organization.juristic,
    };
    response.contactInfo = {
      highestAuthority: {
        highestAuthorityName: organization.highestAuthorityName,
        highestAuthorityPosition: organization.highestAuthorityPosition,
        highestAuthorityPhoneNumber: organization.highestAuthorityPhoneNumber,
        highestAuthorityEmail: organization.highestAuthorityEmail,
      },
      contact: {
        contactName: organization.contactName,
        contactPhoneNumber: organization.contactPhoneNumber,
        contactEmail: organization.contactEmail,
      },
      contactShownHighestAuthority: organization.contactShownHighestAuthority,
    };

    response.addressInfo = {
      addressIdCard: this.mapAddressByType(addresses, AddressTypeEnum.ID_CARD),
      addressCurrent: this.mapAddressByType(addresses, AddressTypeEnum.CURRENT),
      addressTaxInvoice: this.mapAddressByType(
        addresses,
        AddressTypeEnum.TAX_INVOICE,
      ),
    };
    return response;
  }

  private static mapAddressByType(
    addresses: UserAddressDto[],
    type: AddressTypeEnum,
  ): AddressInfoResponseDto | undefined {
    const address = addresses.find((addr) => addr.addressType === type);
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
