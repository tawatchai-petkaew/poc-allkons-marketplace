import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { SubDistrict } from '../../model/sub-district.entity';
import { District } from '../../model/district.entity';
import { SubDistrictDto } from './sub-district.dto';

export class CreateSubDistrictDto implements Readonly<CreateSubDistrictDto> {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name_th: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  name_en: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  zip_code: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  districtId: any;

  @IsOptional()
  district: District;

  public static from(dto: Partial<SubDistrictDto>) {
    const it = new SubDistrictDto();
    it.id = dto.id;
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.zip_code = dto.zip_code;
    it.district = dto.district;

    return it;
  }

  public static fromEntity(entity: SubDistrict) {
    return this.from({
      id: entity.id,
      name_th: entity.name_th,
      name_en: entity.name_en,
      zip_code: entity.zip_code,
      district: entity.district
    });
  }

  public static toEntity(dto: Partial<CreateSubDistrictDto>) {
    const it = new SubDistrict();
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.zip_code = dto.zip_code;
    it.district = dto.district;

    return it;
  }
}
