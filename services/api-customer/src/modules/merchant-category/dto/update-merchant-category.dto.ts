import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { MerchantCategory } from '../../../model/merchant-category.entity';
import { MerchantCategoryDto } from './merchant-category.dto';

export class UpdateMerchantCategoryDto
  implements Readonly<UpdateMerchantCategoryDto> {
  @ApiProperty({ required: true })
  @IsOptional()
  name: string;

  @IsOptional()
  nameEn: string;

  public static from(dto: Partial<MerchantCategoryDto>) {
    const it = new MerchantCategoryDto();
    it.id = dto.id;
    it.name = dto.name;
    it.nameEn = dto.nameEn;

    return it;
  }

  public static fromEntity(entity: MerchantCategory) {
    return this.from({
      id: entity.id,
      name: entity.name,
      nameEn: entity.nameEn
    });
  }

  public static toEntity(dto: Partial<UpdateMerchantCategoryDto>) {
    const it = new MerchantCategory();
    it.name = dto.name;
    it.nameEn = dto.nameEn;

    return it;
  }
}
