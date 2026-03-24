import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { Province } from '../../model/province.entity';
import { District } from '../../model/district.entity';
import { DistrictDto } from './district.dto';

export class CreateDistrictDto implements Readonly<CreateDistrictDto> {
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
  provinceId: any;

  @IsOptional()
  province: Province;

  public static from(dto: Partial<DistrictDto>) {
    const it = new DistrictDto();
    it.id = dto.id;
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.code = dto.code;
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

  public static toEntity(dto: Partial<CreateDistrictDto>) {
    const it = new District();
    it.name_th = dto.name_th;
    it.name_en = dto.name_en;
    it.code = dto.code;
    it.province = dto.province;

    return it;
  }
}
