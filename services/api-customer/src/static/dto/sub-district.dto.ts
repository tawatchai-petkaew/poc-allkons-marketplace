import { ApiProperty } from '@nestjs/swagger';

import { SubDistrict } from '../../model/sub-district.entity';
import { District } from '../../model/district.entity';

export class SubDistrictDto implements Readonly<SubDistrictDto> {
  @ApiProperty({ required: true })
  id: number;

  name_th: any;
  name_en: any;
  zip_code: any;
  districtId: any;
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

  public static toEntity(dto: Partial<SubDistrictDto>) {
    const it = new SubDistrict();
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.zip_code = dto.zip_code;
    it.district = dto.district;

    return it;
  }
}
