import { Matches, IsOptional, IsEmail, IsNotEmpty, IsArray, IsEnum } from 'class-validator';

import { Merchant } from '../../../model/merchant.entity';
import { ImageUpload } from '../../../model/image-upload.entity';

import { UserLocale, UserRole, UserInterfaceMode } from '../enum/user.enum';
import { UserGender, UserStatus } from '../../../model/enum/user.enum';
import { User } from '../../../model/user.entity';
import { RoleBusinessType } from '@/modules/register/enum/register.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  name: string;

  @IsNotEmpty()
  firstNameTh: string;

  @IsNotEmpty()
  lastNameTh: string;

  @IsOptional()
  middleNameTh: string;

  @IsOptional()
  firstNameEn: string;

  @IsOptional()
  lastNameEn: string;

  @IsOptional()
  middleNameEn: string;

  @IsOptional()
  tel: string;

  @IsOptional()
  countryCode: string;

  @IsOptional()
  status: UserStatus;

  @IsOptional()
  gender: UserGender;

  @IsOptional()
  birthDate: Date;

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

  @IsOptional()
  merchantIds: number[];

  @IsOptional()
  imageUpload: ImageUpload;

  @IsOptional()
  imageUploadId: number;

  @IsOptional()
  @IsArray()
  @IsEnum(RoleBusinessType, { each: true, message: 'Each businessType must be a valid RoleBusinessType' })
  businessType: string[];

  public static toEntity(dto: Partial<UpdateUserDto>) {
    const it = new User(dto);

    return it;
  }
}
