import { User } from '@/model';
import { District } from '@/model/district.entity';
import { SubDistrict } from '@/model/sub-district.entity';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

@Exclude()
export class LocationResponseDto {
  @Expose()
  id: number;

  userId: number;

  countryId: number;

  provinceId: number;

  districtId: number;

  district: District;

  subDistrictId: number;

  subDistrict: SubDistrict;

  @Expose()
  countryName: string;

  @Expose()
  provinceName: string;

  @Expose()
  districtName: string;

  @Expose()
  subDistrictName: string;

  @Expose()
  zipcodeName: string;

  @Expose()
  addressName: string;

  @Expose()
  latitude?: string;

  @Expose()
  longitude?: string;

  @Expose()
  isDefault: boolean;

  @Expose()
  createdAt: Date;

  updatedAt: Date;

  user: User;
}

export class CreateLocationDto {
  @IsNotEmpty()
  countryName: string;

  @IsNotEmpty()
  provinceName: string;

  @IsNotEmpty()
  districtName: string;

  @IsNotEmpty()
  subDistrictName: string;

  @IsNotEmpty()
  zipcodeName: string;

  @IsNotEmpty()
  addressName: string;

  @IsNotEmpty()
  latitude: string;

  @IsNotEmpty()
  longitude: string;

  @IsOptional()
  isDefault: boolean = false;
}
