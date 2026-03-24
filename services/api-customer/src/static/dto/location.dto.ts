import { ApiProperty } from '@nestjs/swagger';

export class LocationDto implements Readonly<LocationDto> {
  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: true })
  code: string;

  @ApiProperty({ required: true })
  local: Array<string>;

  @ApiProperty({ required: true })
  utc: string;

  @ApiProperty({ required: true })
  currencyIsoCode: string;

  @ApiProperty({ required: true })
  currencySymbol: string;

  @ApiProperty({ required: true })
  timezone: string;

  public static from(dto: Partial<LocationDto>) {
    const it = new LocationDto();
    it.name = dto.name;
    it.code = dto.code;
    it.local = dto.local;
    it.utc = dto.utc;
    it.currencyIsoCode = dto.currencyIsoCode;
    it.currencySymbol = dto.currencySymbol;
    it.timezone = dto.timezone;

    return it;
  }
}
