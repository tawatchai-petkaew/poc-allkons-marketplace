import {
  AddressStatus,
  AddressTypeCis,
  PersonalType,
  PersonalTaxIdType,
  BranchType,
} from '@/model/user-customer-address.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  Length,
  IsEmail,
} from 'class-validator';

export class UpdateBuyerAddressDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Organization ID', example: 1 })
  @IsInt()
  organizeId: number;

  @ApiProperty({
    enum: AddressTypeCis,
    description: 'Type of address',
    example: AddressTypeCis.SHIPPING_ADDRESS,
  })
  @IsEnum(AddressTypeCis)
  addressType: AddressTypeCis;

  @ApiProperty({ description: 'Name of contact person', example: 'John Doe' })
  @IsString()
  contactName: string;

  @ApiProperty({
    description: 'Contact phone number (10 digits)',
    example: '0123456789',
    maxLength: 10,
    minLength: 10,
  })
  @IsString()
  @Length(10, 10)
  contactPhoneNumber: string;

  @ApiProperty({ description: 'Country ID', example: 1 })
  @IsInt()
  countryId: number;

  @ApiProperty({ description: 'Province ID', example: 1 })
  @IsInt()
  provinceId: number;

  @ApiProperty({ description: 'District ID', example: 1 })
  @IsInt()
  districtId: number;

  @ApiProperty({ description: 'Sub-district ID', example: 1 })
  @IsInt()
  subDistrictId: number;

  @ApiProperty({ description: 'Zipcode ID', example: 1 })
  @IsInt()
  @IsOptional()
  zipcodeId?: number;

  @ApiProperty({ description: 'Country name', example: 'Thailand' })
  @IsString()
  countryName: string;

  @ApiProperty({ description: 'Province name', example: 'Bangkok' })
  @IsString()
  provinceName: string;

  @ApiProperty({ description: 'District name', example: 'Watthana' })
  @IsString()
  districtName: string;

  @ApiProperty({
    description: 'Sub-district name',
    example: 'Khlong Toei Nuea',
  })
  @IsString()
  subDistrictName: string;

  @ApiProperty({ description: 'Zipcode', example: '10110' })
  @IsString()
  zipcodeName: string;

  @ApiProperty({ required: false, description: 'Project ID', example: 1 })
  @IsOptional()
  @IsInt()
  projectId?: number;

  @ApiProperty({ description: 'Name of the address', example: 'Home' })
  @IsString()
  addressName: string;

  @ApiProperty({
    description: 'Address details',
    example: '123 Street, Building A',
  })
  @IsString()
  addressInfo: string;

  @ApiProperty({
    required: false,
    description: 'Additional remarks',
    example: 'Near the mall',
  })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ required: false, description: 'Latitude', example: '13.7563' })
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiProperty({
    required: false,
    description: 'Longitude',
    example: '100.5018',
  })
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiProperty({
    description: 'Is this the default address',
    default: false,
    example: false,
  })
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty({
    enum: AddressStatus,
    description: 'Address status',
    default: AddressStatus.ACTIVE,
    example: AddressStatus.ACTIVE,
  })
  @IsEnum(AddressStatus)
  @IsOptional()
  status: AddressStatus;

  @ApiProperty({
    description: 'CIS number for the address',
    example: '180c066d-68dc-xxxx-xxxx-2f14f26b99cd',
  })
  @IsOptional()
  @IsString()
  cisNumber?: string;

  @ApiProperty({
    enum: PersonalType,
    required: false,
    description: 'Personal or juristic type',
    example: PersonalType.PERSONAL,
  })
  @IsEnum(PersonalType)
  @IsOptional()
  personalType?: PersonalType;

  @ApiProperty({
    enum: PersonalTaxIdType,
    required: false,
    description: 'Tax ID type',
    example: PersonalTaxIdType.ID_CARD,
  })
  @IsEnum(PersonalTaxIdType)
  @IsOptional()
  personalTaxIdType?: PersonalTaxIdType;

  @ApiProperty({
    required: false,
    description: 'Tax identification number',
    example: '1234567890123',
  })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({
    enum: BranchType,
    required: false,
    description: 'Branch type',
    example: BranchType.HEAD_OFFICE,
  })
  @IsEnum(BranchType)
  @IsOptional()
  branchType?: BranchType;

  @ApiProperty({
    required: false,
    description: 'Branch number',
    example: '00001',
  })
  @IsString()
  @IsOptional()
  branchNumber?: string;

  @ApiProperty({
    required: false,
    description: 'Juristic type identifier',
    example: '1',
  })
  @IsString()
  @IsOptional()
  juristicTypeId?: string;

  @ApiProperty({
    required: false,
    description: 'Contact email address',
    example: 'contact@example.com',
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;
}

export class SaveBuyerAddressDto extends OmitType(UpdateBuyerAddressDto, [
  'zipcodeId',
  'cisNumber',
]) {
  constructor(partial: Partial<SaveBuyerAddressDto>) {
    super();
    Object.assign(this, partial);
  }
}
