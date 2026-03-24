import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class updateMerchantInfoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  merchantName: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  status: boolean;
}
