import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, IsOptional } from 'class-validator';

import { User } from '../../../model/user.entity';
import { Merchant } from '../../../model/merchant.entity';
import { ImageUpload } from '../../../model/image-upload.entity';

import { UserLocale, UserRole, UserInterfaceMode } from '../enum/user.enum';
import {
  OnBoardingStep,
  UserGender,
  UserStatus
} from '../../../model/enum/user.enum';

export class UserDto implements Readonly<UserDto> {
  @ApiProperty({ required: true })
  id: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsOptional()
  password: string;

  @IsOptional()
  name: string;

  @IsOptional()
  tel: string;

  @IsOptional()
  countryCode: string;

  @IsOptional()
  status: UserStatus;

  @IsOptional()
  gender: UserGender;

  @IsOptional()
  imageUpload: ImageUpload;

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

  merchants: Merchant[];

  @IsOptional()
  onBoardingStep: OnBoardingStep;

  public static from(dto: Partial<UserDto>) {
    const it = new UserDto();
    it.id = dto.id;
    it.email = dto.email;
    it.locale = dto.locale;
    it.role = dto.role;
    it.name = dto.name;
    it.tel = dto.tel;
    it.countryCode = dto.countryCode;
    it.interfaceMode = dto.interfaceMode;
    it.status = dto.status;
    it.gender = dto.gender;
    it.birthDate = dto.birthDate;
    it.imageUpload = dto.imageUpload;
    it.merchants = dto.merchants;
    it.onBoardingStep = dto.onBoardingStep;

    return it;
  }

  public static fromEntity(entity: User) {
    return this.from({
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      tel: entity.tel,
      countryCode: entity.countryCode,
      locale: entity.locale,
      interfaceMode: entity.interfaceMode,
      status: entity.status,
      gender: entity.gender,
      birthDate: entity.birthDate,
      imageUpload: entity.imageUpload,
      merchants: entity.merchants,
      onBoardingStep: entity.onBoardingStep
    });
  }

  public static toEntity(dto: Partial<UserDto>) {
    const it = new User(dto);

    return it;
  }
}
