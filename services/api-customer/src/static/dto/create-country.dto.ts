import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { Country } from '../../model/country.entity';
import { CountryDto } from './country.dto';

export class CreateCountryDto implements Readonly<CreateCountryDto> {
  @ApiProperty({ required: true })
  @IsNotEmpty()
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

  public static toEntity(dto: Partial<CreateCountryDto>) {
    const it = new Country();
    it.name = dto.name;

    return it;
  }
}
