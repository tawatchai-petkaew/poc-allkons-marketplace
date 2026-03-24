import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { MerchantDto } from './merchant.dto';
import { MerchantLogoDto } from './merchant-logo.dto';
import { MerchantIconDto } from './merchant-icon.dto';
import { UserLocale } from '@/modules/user/enum/user.enum';
import { MerchantCategory } from '@/model/merchant-category.entity';
import { Merchant } from '@/model/merchant.entity';
import { MerchantLogo } from '@/model/merchant-logo.entity';
import { MerchantIcon } from '@/model/merchant-icon.entity';
import { MerchantTranslation } from '@/model/merchant-translation.entity';

export enum MerchantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive',
}

export class UpdateMerchantDto implements Readonly<UpdateMerchantDto> {
  @ApiProperty({ required: true })
  slug: string;

  @IsOptional()
  locale: string;

  @IsOptional()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  tel: string;
  @IsOptional()
  email: string;
  @IsOptional()
  contactAddress: string;
  @IsOptional()
  merchantCategoryId: number;
  @IsOptional()
  merchantCategory: MerchantCategory;
  @IsOptional()
  postCodeContactAddress: string;
  @IsOptional()
  provinceContactAddress: string;
  @IsOptional()
  districtContactAddress: string;
  @IsOptional()
  subdistrictContactAddress: string;
  @IsOptional()
  lineSocialContact: string;
  @IsOptional()
  facebookSocialContact: string;
  @IsOptional()
  youtubeSocialContact: string;
  @IsOptional()
  instagramSocialContact: string;
  @IsOptional()
  companyName: string;
  @IsOptional()
  companyId: string;
  @IsOptional()
  companyBranch: string;
  @IsOptional()
  companyAddress: string;
  @IsOptional()
  postCodeCompanyAddress: string;
  @IsOptional()
  provinceCompanyAddress: string;
  @IsOptional()
  districtCompanyAddress: string;
  @IsOptional()
  subdistrictCompanyAddress: string;

  @IsOptional()
  verified: boolean;

  @IsOptional()
  primaryColor: string;

  @IsOptional()
  highlight: string;

  @IsOptional()
  keyword: string[];

  @IsOptional()
  merchantLogo: MerchantLogo;

  @IsOptional()
  merchantLogoAttributes: MerchantLogoDto;

  @IsOptional()
  merchantIcon: MerchantIcon;

  @IsOptional()
  merchantIconAttributes: MerchantIconDto;

  @IsOptional()
  expiredDate: Date;

  @IsOptional()
  commision: number;

  @IsOptional()
  marketplaceCommision: number;

  @IsOptional()
  discountCommision: number;

  @IsOptional()
  platformCommision: number;

  @IsOptional()
  shopditpayCreditCardCommision: number;

  @IsOptional()
  shopditpayLinepayCommision: number;

  @IsOptional()
  shopditpayAirpayCommision: number;

  @IsOptional()
  shopditpayScbEasyCommision: number;

  @IsOptional()
  shopditpayBblCommision: number;

  @IsOptional()
  shopditpayBaybankCommision: number;

  @IsOptional()
  shopditpayTruemoneyCommision: number;

  @IsOptional()
  shopditPayMerchantId: string;

  @IsOptional()
  appsFlyerAppleId: string;

  @IsOptional()
  appsFlyerOnelinkId: string;

  @IsOptional()
  deeplinkHostUrl: string;

  @IsOptional()
  chatContract: string;

  @IsOptional()
  isFinishMerchantGuide: boolean;

  @IsOptional()
  subsciptionPackageId: number;

  @IsOptional()
  currentSubscriptionPackageSlug: string;

  @IsOptional()
  currentSubscriptionPackageStartDate: Date;

  @IsOptional()
  currentSubscriptionPackagePrice: number;

  @IsOptional()
  currentSubscriptionPackageTotalNumberOfDay: number;

  @IsOptional()
  isEnableSES: boolean;

  @IsOptional()
  isEnableGoogleAi: boolean;

  @IsOptional()
  isEnableCache: boolean;

  @IsOptional()
  isEnableOtpLogin: boolean;

  @IsOptional()
  locationName: string;

  @IsOptional()
  locationCode: string;

  @IsOptional()
  availableLocale: string[];

  @IsOptional()
  locationCurrencyIsoCode: string;

  @IsOptional()
  locationCurrencySymbol: string;

  @IsOptional()
  locationUTC: string;

  @IsOptional()
  locationTimezone: string;

  @IsOptional()
  defaultLocale: UserLocale;

  @IsOptional()
  urlGoogleMap: string;

  @IsOptional()
  isEditOrderTime: boolean;

  @IsOptional()
  orderExpireTime: number;

  @IsOptional()
  orderSuccessTime: number;

  public static from(dto: Partial<MerchantDto>) {
    const it = new MerchantDto();
    it.id = dto.id;
    it.slug = dto.slug;
    it.name = dto.name;
    it.description = dto.description;
    it.tel = dto.tel;
    it.email = dto.email;
    it.highlight = dto.highlight;
    it.keyword = dto.keyword;
    it.merchantLogo = dto.merchantLogo;
    it.merchantIcon = dto.merchantIcon;
    it.contactAddress = dto.contactAddress;
    it.postCodeContactAddress = dto.postCodeContactAddress;
    it.provinceContactAddress = dto.provinceContactAddress;
    it.districtContactAddress = dto.districtContactAddress;
    it.subdistrictContactAddress = dto.subdistrictContactAddress;
    it.lineSocialContact = dto.lineSocialContact;
    it.facebookSocialContact = dto.facebookSocialContact;
    it.youtubeSocialContact = dto.youtubeSocialContact;
    it.instagramSocialContact = dto.instagramSocialContact;
    it.companyName = dto.companyName;
    it.companyId = dto.companyId;
    it.companyBranch = dto.companyBranch;
    it.companyAddress = dto.companyAddress;
    it.postCodeCompanyAddress = dto.postCodeCompanyAddress;
    it.provinceCompanyAddress = dto.provinceCompanyAddress;
    it.districtCompanyAddress = dto.districtCompanyAddress;
    it.subdistrictCompanyAddress = dto.subdistrictCompanyAddress;
    it.merchantCategory = dto.merchantCategory;
    it.verified = dto.verified;
    it.primaryColor = dto.primaryColor;
    it.expiredDate = dto.expiredDate;
    it.commision = dto.commision;
    it.marketplaceCommision = dto.marketplaceCommision;
    it.discountCommision = dto.discountCommision;
    it.platformCommision = dto.platformCommision;
    it.shopditpayCreditCardCommision = dto.shopditpayCreditCardCommision;
    it.shopditpayLinepayCommision = dto.shopditpayLinepayCommision;
    it.shopditpayAirpayCommision = dto.shopditpayAirpayCommision;
    it.shopditpayScbEasyCommision = dto.shopditpayScbEasyCommision;
    it.shopditpayBblCommision = dto.shopditpayBblCommision;
    it.shopditpayBaybankCommision = dto.shopditpayBaybankCommision;
    it.shopditpayTruemoneyCommision = dto.shopditpayTruemoneyCommision;
    it.shopditPayMerchantId = dto.shopditPayMerchantId;
    it.appsFlyerAppleId = dto.appsFlyerAppleId;
    it.appsFlyerOnelinkId = dto.appsFlyerOnelinkId;
    it.deeplinkHostUrl = dto.deeplinkHostUrl;
    it.chatContract = dto.chatContract;
    it.isFinishMerchantGuide = dto.isFinishMerchantGuide;
    it.currentSubscriptionPackageSlug = dto.currentSubscriptionPackageSlug;
    it.currentSubscriptionPackageStartDate =
      dto.currentSubscriptionPackageStartDate;
    it.currentSubscriptionPackagePrice = dto.currentSubscriptionPackagePrice;
    it.currentSubscriptionPackageTotalNumberOfDay =
      dto.currentSubscriptionPackageTotalNumberOfDay;
    it.isEnableSES = dto.isEnableSES;
    it.isEnableGoogleAi = dto.isEnableGoogleAi;
    it.isEnableCache = dto.isEnableCache;
    it.isEnableOtpLogin = dto.isEnableOtpLogin;
    it.locationName = dto.locationName;
    it.locationCode = dto.locationCode;
    it.availableLocale = dto.availableLocale;
    it.locationCurrencyIsoCode = dto.locationCurrencyIsoCode;
    it.locationCurrencySymbol = dto.locationCurrencySymbol;
    it.locationUTC = dto.locationUTC;
    it.locationTimezone = dto.locationTimezone;
    it.defaultLocale = dto.defaultLocale;
    it.urlGoogleMap = dto.urlGoogleMap;
    it.isEditOrderTime = dto.isEditOrderTime;
    it.orderExpireTime = dto.orderExpireTime;
    it.orderSuccessTime = dto.orderSuccessTime;

    return it;
  }

  public static fromEntity(
    entity: Merchant,
    translation: MerchantTranslation,
  ): MerchantDto {
    return this.from({
      id: entity.id,
      slug: entity.slug,
      tel: entity.tel,
      email: entity.email,
      keyword: entity.keyword,
      merchantLogo: entity.merchantLogo,
      merchantIcon: entity.merchantIcon,
      name: translation && translation.name ? translation.name : '',
      description:
        translation && translation.description ? translation.description : '',
    });
  }

  public static toEntity(dto: Partial<UpdateMerchantDto>) {
    const it = new Merchant();
    it.slug = dto.slug;
    it.tel = dto.tel;
    it.email = dto.email;
    it.keyword = dto.keyword;
    it.merchantLogo = dto.merchantLogo;
    it.merchantIcon = dto.merchantIcon;

    return it;
  }
}
