import { ApiProperty } from '@nestjs/swagger';

import { Country } from '../../model/country.entity';

export class CountryDto implements Readonly<CountryDto> {
  @ApiProperty({ required: true })
  id: number;

  @ApiProperty({ required: true })
  name: string;

  public static from(dto: Partial<CountryDto>) {
    const it = new CountryDto();
    it.id = dto.id;
    it.name = dto.name;

    return it;
  }

  public static fromEntity(entity: Country) {
    return this.from({
      id: entity.id,
      name: entity.name
    });
  }

  public static toEntity(dto: Partial<CountryDto>) {
    const it = new Country();
    it.name = dto.name;

    return it;
  }
}
