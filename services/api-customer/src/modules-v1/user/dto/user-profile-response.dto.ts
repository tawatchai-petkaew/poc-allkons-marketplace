import { Expose, Type } from 'class-transformer';

export class MerchantProfileDto {
  @Expose()
  id: number;

  @Expose()
  uuid: string;

  @Expose()
  slug: string;

  @Expose()
  organizeId: number;

  @Expose()
  organizeUuid: string;

  @Expose()
  lastAccessedAt: Date;
}

export class UserProfileResponseDto {
  @Expose()
  id: number;

  @Expose()
  uuid: string;

  @Expose()
  name: string;

  @Expose()
  tel: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  locale: string;

  @Expose()
  interfaceMode: string;

  @Expose()
  onBoardingStep: string;

  @Expose()
  createdInAuth: boolean;

  @Expose()
  @Type(() => MerchantProfileDto)
  merchants: MerchantProfileDto[];

  @Expose()
  profileImageUrl: string;
}
