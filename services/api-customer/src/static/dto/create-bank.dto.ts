import { ApiProperty } from '@nestjs/swagger';

import { Bank } from '../../model/bank.entity';
import { BankDto } from './bank.dto';

export class CreateBankDto implements Readonly<CreateBankDto> {
  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: true })
  slug: string;

  public static from(dto: Partial<BankDto>) {
    const it = new BankDto();
    it.id = dto.id;
    it.name = dto.name;
    it.slug = dto.slug;

    return it;
  }

  public static fromEntity(entity: Bank) {
    return this.from({
      id: entity.id,
      name: entity.name,
      slug: entity.slug
    });
  }

  public static toEntity(dto: Partial<CreateBankDto>) {
    const it = new Bank();
    it.name = dto.name;
    it.slug = dto.slug;

    return it;
  }
}
