import { ApiProperty } from '@nestjs/swagger';

import { Province } from '../../model/province.entity';
import { District } from '../../model/district.entity';

export class DistrictDto implements Readonly<DistrictDto> {
  @ApiProperty({ required: true })
  id: number;

  name_th: any;
  name_en: any;
  code: any;
  provinceId: any;
  province: Province;

  public static from(dto: Partial<DistrictDto>) {
    const it = new DistrictDto();
    it.id = dto.id;
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.province = dto.province;

    return it;
  }

  public static fromEntity(entity: District) {
    return this.from({
      id: entity.id,
      name_th: entity.name_th,
      name_en: entity.name_en,
      code: entity.code,
      province: entity.province
    });
  }

  public static toEntity(dto: Partial<DistrictDto>) {
    const it = new District();
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.code = dto.code;
    it.province = dto.province;

    return it;
  }
}
