import { IsNotEmpty, IsOptional } from 'class-validator';

import { Merchant } from '@/model/merchant.entity';
import { MerchantTranslation } from '@/model/merchant-translation.entity';
import { MerchantCategory } from '@/model/merchant-category.entity';
import { ImageUploadFolder } from '@/model/image-upload-folder.entity';
import { MerchantIcon } from '@/model/merchant-icon.entity';
import { MerchantLogo } from '@/model/merchant-logo.entity';

import { MerchantDto } from './merchant.dto';
import { MerchantLogoDto } from './merchant-logo.dto';
import { MerchantIconDto } from './merchant-icon.dto';
import { UserLocale } from '@/model/user.entity';

export class CreateMerchantDto implements Readonly<CreateMerchantDto> {
  @IsNotEmpty()
  slug: string;

  @IsNotEmpty()
  locale: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  tel: string;

  @IsOptional()
  highlight: string;

  @IsOptional()
  keyword: string[];

  @IsOptional()
  email: string;

  @IsOptional()
  contactAddress: string;

  @IsNotEmpty()
  merchantCategoryId: number;

  @IsOptional()
  merchantCategory: MerchantCategory;

  @IsOptional()
  imageUploadFolders: ImageUploadFolder[];

  @IsOptional()
  merchantLogo: MerchantLogo;

  @IsOptional()
  merchantLogoAttributes: MerchantLogoDto;

  @IsOptional()
  merchantIcon: MerchantIcon;

  @IsOptional()
  merchantIconAttributes: MerchantIconDto;

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
  expiredDate: Date;

  @IsOptional()
  currentSubscriptionPackageSlug: string;

  @IsOptional()
  currentSubscriptionPackageStartDate: Date;

  @IsOptional()
  currentSubscriptionPackageTotalNumberOfDay: number;

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
  urlGoogleMap: string;

  @IsOptional()
  defaultLocale: UserLocale;

  @IsOptional()
  isEnableCache: boolean;

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
    it.locationName = dto.locationName;
    it.locationCode = dto.locationCode;
    it.availableLocale = dto.availableLocale;
    it.locationCurrencyIsoCode = dto.locationCurrencyIsoCode;
    it.locationCurrencySymbol = dto.locationCurrencySymbol;
    it.locationUTC = dto.locationUTC;
    it.locationTimezone = dto.locationTimezone;
    it.defaultLocale = dto.defaultLocale;
    it.urlGoogleMap = dto.urlGoogleMap;

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
      status: entity.status,
      name: translation && translation.name ? translation.name : '',
      description:
        translation && translation.description ? translation.description : '',
    });
  }

  public static toEntity(dto: Partial<CreateMerchantDto>) {
    const it = new Merchant();
    it.slug = dto.slug;
    it.tel = dto.tel;
    it.keyword = dto.keyword;
    it.email = dto.email;
    it.merchantLogo = dto.merchantLogo;
    it.merchantIcon = dto.merchantIcon;

    return it;
  }
}
