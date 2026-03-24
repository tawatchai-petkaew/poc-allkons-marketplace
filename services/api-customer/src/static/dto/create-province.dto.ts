import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { Province } from '../../model/province.entity';
import { Country } from '../../model/country.entity';
import { ProvinceDto } from './province.dto';

export class CreateProvinceDto implements Readonly<CreateProvinceDto> {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name_th: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  name_en: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  code: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNotEmpty()
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

  public static toEntity(dto: Partial<CreateProvinceDto>) {
    const it = new Province();
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.code = dto.code;
    it.country = dto.country;

    return it;
  }
}
