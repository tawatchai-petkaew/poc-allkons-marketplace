import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { MerchantCategory } from '../../../model/merchant-category.entity';
import { MerchantCategoryDto } from './merchant-category.dto';

export class CreateMerchantCategoryDto
  implements Readonly<CreateMerchantCategoryDto> {
  @ApiProperty({ required: true })
  @IsNotEmpty()
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

  public static toEntity(dto: Partial<CreateMerchantCategoryDto>) {
    const it = new MerchantCategory();
    it.name = dto.name;
    it.nameEn = dto.nameEn;

    return it;
  }
}
