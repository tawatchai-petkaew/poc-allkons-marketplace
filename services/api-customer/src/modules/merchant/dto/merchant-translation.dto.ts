import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { MerchantTranslation } from '@/model/merchant-translation.entity';
import { Merchant } from '@/model/merchant.entity';

export class MerchantTranslationDto
  implements Readonly<MerchantTranslationDto> {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  locale: string;

  @IsNotEmpty()
  name: string;

  id: number;
  description: string;

  @IsNotEmpty()
  merchant: Merchant;

  public static from(dto: Partial<MerchantTranslationDto>) {
    const it = new MerchantTranslationDto();
    it.locale = dto.locale;
    it.name = dto.name;
    it.description = dto.description;

    return it;
  }

  public static fromEntity(entity: MerchantTranslation) {
    return this.from({
      locale: entity.locale,
      name: entity.name,
      description: entity.description
    });
  }

  public static toEntity(dto: Partial<MerchantTranslationDto>) {
    const it = new MerchantTranslation();
    it.locale = dto.locale;
    it.name = dto.name;
    it.description = dto.description;
    it.merchant = dto.merchant;

    return it;
  }
}
