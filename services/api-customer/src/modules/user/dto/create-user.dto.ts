import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, Matches, IsOptional } from 'class-validator';

import { UserStatus } from '../../../model/enum/user.enum';
import { Merchant } from '../../../model/merchant.entity';
import { UserLocale, UserRole, UserInterfaceMode } from '../enum/user.enum';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsOptional()
  password: string;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  name: string;

  @IsOptional()
  tel: string;

  @IsOptional()
  status: UserStatus;

  @IsOptional()
  countryCode: string;

  @IsOptional()
  @Matches(
    `^${Object.values(UserRole)
      .filter((v) => typeof v !== 'number')
      .join('|')}$`,
    'i'
  )
  role: UserRole;

  @IsOptional()
  @Matches(
    `^${Object.values(UserLocale)
      .filter((v) => typeof v !== 'number')
      .join('|')}$`,
    'i'
  )
  locale: UserLocale;

  @IsOptional()
  @Matches(
    `^${Object.values(UserInterfaceMode)
      .filter((v) => typeof v !== 'number')
      .join('|')}$`,
    'i'
  )
  interfaceMode: UserInterfaceMode;

  @IsOptional()
  merchants: Merchant[];

  @IsNotEmpty()
  merchantIds: number[];
}
