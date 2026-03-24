import { ApiProperty } from '@nestjs/swagger';

import { MerchantCategory } from '../../../model/merchant-category.entity';

export class MerchantCategoryDto implements Readonly<MerchantCategoryDto> {
  @ApiProperty({ required: true })
  id: number;

  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: true })
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

  public static toEntity(dto: Partial<MerchantCategoryDto>) {
    const it = new MerchantCategory();
    it.name = dto.name;
    it.nameEn = dto.nameEn;

    return it;
  }
}
