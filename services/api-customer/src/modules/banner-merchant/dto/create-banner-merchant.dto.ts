import { IsNotEmpty, IsOptional } from 'class-validator';

import { Product } from '../../../model/product.entity';
import { Merchant } from '../../../model/merchant.entity';
import { BannerMerchantDesktop } from '../../../model/banner-merchant-desktop.entity';
import { BannerMerchantApplication } from '../../../model/banner-merchant-application.entity';
import { BannerMerchant } from '../../../model/banner-merchant.entity';
import { Article } from '../../../model/article.entity';

import { BannerMerchantDto } from './banner-merchant.dto';
import { BannerMerchantDesktopDto } from './banner-merchant-desktop.dto';
import { BannerMerchantApplicationDto } from './banner-merchant-application.dto';

import { BannerMerchantType } from '../enum/banner-merchant.enum';

export class CreateBannerMerchantDto
  implements Readonly<CreateBannerMerchantDto>
{
  @IsNotEmpty()
  type: BannerMerchantType;

  @IsOptional()
  isOpenNewWindow: boolean;

  @IsOptional()
  url: string;

  @IsOptional()
  product: Product;

  @IsOptional()
  productId: number;

  @IsOptional()
  article: Article;

  @IsOptional()
  articleId: number;

  @IsOptional()
  productBrandId: number;

  @IsOptional()
  productCategoryId: number;

  @IsOptional()
  productCatalogId: number;

  @IsOptional()
  bannerMerchantDesktop: BannerMerchantDesktop;

  @IsOptional()
  bannerMerchantDesktopAttributes: BannerMerchantDesktopDto;

  @IsOptional()
  bannerMerchantApplication: BannerMerchantApplication;

  @IsOptional()
  bannerMerchantApplicationAttributes: BannerMerchantApplicationDto;

  @IsOptional()
  merchant: Merchant;

  public static from(dto: Partial<BannerMerchantDto>) {
    const it = new BannerMerchant();
    it.id = dto.id;
    it.type = dto.type;
    it.isOpenNewWindow = dto.isOpenNewWindow;
    it.url = dto.url;
    it.product = dto.product;
    it.article = dto.article;
    it.bannerMerchantDesktop = dto.bannerMerchantDesktop;
    it.bannerMerchantApplication = dto.bannerMerchantApplication;

    return {
      ...it,
    };
  }

  public static fromEntity(entity: BannerMerchant) {
    return this.from({
      id: entity.id,
      type: entity.type,
      isOpenNewWindow: entity.isOpenNewWindow,
      url: entity.url,
      product: entity.product,
      article: entity.article,
      bannerMerchantDesktop: entity.bannerMerchantDesktop,
      bannerMerchantApplication: entity.bannerMerchantApplication,
      merchant: null,
    });
  }

  public static toEntity(dto: Partial<CreateBannerMerchantDto>) {
    const it = new BannerMerchant();
    it.type = dto.type;
    it.isOpenNewWindow = dto.isOpenNewWindow;
    it.url = dto.url;
    it.product = dto.product;
    it.article = dto.article;
    it.bannerMerchantDesktop = dto.bannerMerchantDesktop;
    it.bannerMerchantApplication = dto.bannerMerchantApplication;

    return it;
  }
}
