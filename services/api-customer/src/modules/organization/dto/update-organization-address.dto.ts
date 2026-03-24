import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOrganizationAddressDto {
  @IsNotEmpty()
  @IsString()
  taxId: string;

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
  zipCode?: number;
}