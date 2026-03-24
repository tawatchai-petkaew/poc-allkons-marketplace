import { ApiProperty } from '@nestjs/swagger';

import { Province } from '../../model/province.entity';
import { Country } from '../../model/country.entity';

export class ProvinceDto implements Readonly<ProvinceDto> {
  @ApiProperty({ required: true })
  id: number;

  name_th: any;
  name_en: any;
  code: any;
  countryId: any;
  country: Country;

  public static from(dto: Partial<ProvinceDto>) {
    const it = new ProvinceDto();
    it.id = dto.id;
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.code = dto.code;
    it.country = dto.country;

    return it;
  }

  public static fromEntity(entity: Province) {
    return this.from({
      id: entity.id,
      name_th: entity.name_th,
      name_en: entity.name_en,
      code: entity.code,
      country: entity.country
    });
  }

  public static toEntity(dto: Partial<ProvinceDto>) {
    const it = new Province();
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.code = dto.code;
    it.country = dto.country;

    return it;
  }
}
