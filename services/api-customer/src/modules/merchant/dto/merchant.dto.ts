import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

import { Merchant } from '@/model/merchant.entity';
import { MerchantCategory } from '@/model/merchant-category.entity';
import { MerchantTranslation } from '@/model/merchant-translation.entity';
import { MerchantLogo } from '@/model/merchant-logo.entity';
import { MerchantIcon } from '@/model/merchant-icon.entity';
import { UserLocale } from '@/modules/user/enum/user.enum';
import { Organization } from '@/model/organization.entity';

export enum MerchantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive',
}
export class MerchantDto implements Readonly<MerchantDto> {
  id: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  slug: string;

  @IsNotEmpty()
  locale: string;

  name: string;
  description: string;
  tel: string;
  highlight: string;
  keyword: string[];

  @IsEmail()
  email: string;

  merchantLogo: MerchantLogo;
  merchantIcon: MerchantIcon;

  merchantCategory: MerchantCategory;
  organization: Organization;
  status: MerchantStatus;
  verified: boolean;
  expiredDate: Date;
  createdAt: Date;
  currentSubscriptionPackageSlug: string;
  currentSubscriptionPackageStartDate: Date;
  currentSubscriptionPackagePrice: number;
  currentSubscriptionPackageTotalNumberOfDay: number;
  commision: number;
  marketplaceCommision: number;
  discountCommision: number;
  platformCommision: number;
  shopditpayCreditCardCommision: number;
  shopditpayLinepayCommision: number;
  shopditpayAirpayCommision: number;
  shopditpayScbEasyCommision: number;
  shopditpayBblCommision: number;
  shopditpayBaybankCommision: number;
  shopditpayTruemoneyCommision: number;
  shopditPayMerchantId: string;
  appsFlyerAppleId: string;
  appsFlyerOnelinkId: string;
  deeplinkHostUrl: string;
  chatContract: string;
  merchantWebUrl: string;
  isFinishMerchantGuide: boolean;
  locationName: string;
  locationCode: string;
  availableLocale: string[];
  urlGoogleMap: string;

  primaryColor: string;

  contactAddress: string;
  postCodeContactAddress: string;
  provinceContactAddress: string;
  districtContactAddress: string;
  subdistrictContactAddress: string;
  lineSocialContact: string;
  facebookSocialContact: string;
  youtubeSocialContact: string;
  instagramSocialContact: string;
  companyName: string;
  companyId: string;
  companyBranch: string;
  companyAddress: string;
  postCodeCompanyAddress: string;
  provinceCompanyAddress: string;
  districtCompanyAddress: string;
  subdistrictCompanyAddress: string;

  @IsNotEmpty()
  isEnableSES: boolean;

  @IsNotEmpty()
  isEnableGoogleAi: boolean;

  @IsNotEmpty()
  isEnableCache: boolean;

  @IsNotEmpty()
  isEnableOtpLogin: boolean;

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
  merchantWallet: string;

  @IsOptional()
  shopditProductWhitelists: string[];

  @IsNotEmpty()
  isEditOrderTime: boolean;

  @IsNotEmpty()
  orderExpireTime: number;

  @IsNotEmpty()
  orderSuccessTime: number;

  public static from(dto: Partial<MerchantDto>) {
    const it = new MerchantDto();
    it.id = dto.id;
    it.slug = dto.slug;
    it.name = dto.name;
    it.description = dto.description;
    it.tel = dto.tel;
    it.highlight = dto.highlight;
    it.keyword = dto.keyword;
    it.email = dto.email;
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
    it.status = dto.status;
    it.verified = dto.verified;
    it.expiredDate = dto.expiredDate;
    it.createdAt = dto.createdAt;
    it.currentSubscriptionPackageSlug = dto.currentSubscriptionPackageSlug;
    it.currentSubscriptionPackageStartDate =
      dto.currentSubscriptionPackageStartDate;
    it.currentSubscriptionPackagePrice = dto.currentSubscriptionPackagePrice;
    it.currentSubscriptionPackageTotalNumberOfDay =
      dto.currentSubscriptionPackageTotalNumberOfDay;
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
    it.primaryColor = dto.primaryColor;
    it.shopditPayMerchantId = dto.shopditPayMerchantId;
    it.appsFlyerAppleId = dto.appsFlyerAppleId;
    it.appsFlyerOnelinkId = dto.appsFlyerOnelinkId;
    it.deeplinkHostUrl = dto.deeplinkHostUrl;
    it.chatContract = dto.chatContract;
    it.isFinishMerchantGuide = dto.isFinishMerchantGuide;
    it.isEnableSES = dto.isEnableSES;
    it.locationName = dto.locationName;
    it.locationCode = dto.locationCode;
    it.availableLocale = dto.availableLocale;
    it.locationCurrencyIsoCode = dto.locationCurrencyIsoCode;
    it.locationCurrencySymbol = dto.locationCurrencySymbol;
    it.locationUTC = dto.locationUTC;
    it.locationTimezone = dto.locationTimezone;
    it.defaultLocale = dto.defaultLocale;
    it.urlGoogleMap = dto.urlGoogleMap;
    it.isEnableGoogleAi = dto.isEnableGoogleAi;
    it.isEnableCache = dto.isEnableCache;
    it.isEnableOtpLogin = dto.isEnableOtpLogin;
    it.merchantWallet = dto.merchantWallet;
    it.shopditProductWhitelists = dto.shopditProductWhitelists;
    it.isEditOrderTime = dto.isEditOrderTime;
    it.orderExpireTime = dto.orderExpireTime;
    it.orderSuccessTime = dto.orderSuccessTime;
    it.organization = dto.organization;

    return {
      ...it,
      merchantWebUrl: dto.merchantWebUrl,
    };
  }

  public static fromEntity(
    entity: Merchant,
    translation: MerchantTranslation,
  ): MerchantDto {
    return this.from({
      id: entity.id,
      slug: entity.slug,
      tel: entity.tel,
      keyword: entity.keyword,
      email: entity.email,
      merchantLogo: entity.merchantLogo,
      merchantIcon: entity.merchantIcon,
      organization: entity.organization,
      status: entity.status,
      createdAt: entity.createdAt,
      name: translation && translation.name ? translation.name : '',
      description:
        translation && translation.description ? translation.description : '',
      merchantWebUrl: `https://${entity.slug}.myshopdit.com`,
    });
  }

  public static toEntity(dto: Partial<MerchantDto>) {
    const it = new Merchant();
    it.slug = dto.slug;
    it.tel = dto.tel;
    it.email = dto.email;
    it.keyword = dto.keyword;
    it.merchantLogo = dto.merchantLogo;
    it.merchantIcon = dto.merchantIcon;
    it.status = dto.status;
    dto.currentSubscriptionPackageTotalNumberOfDay;
    return it;
  }
}
