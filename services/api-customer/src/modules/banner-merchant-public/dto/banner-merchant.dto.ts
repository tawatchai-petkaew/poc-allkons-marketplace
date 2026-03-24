import { IsNotEmpty, IsOptional } from 'class-validator';

import { Product } from '../../../model/product.entity';
import { Merchant } from '../../../model/merchant.entity';
import { BannerMerchantDesktop } from '../../../model/banner-merchant-desktop.entity';
import { BannerMerchantApplication } from '../../../model/banner-merchant-application.entity';
import { BannerMerchant } from '../../../model/banner-merchant.entity';
import { Article } from '../../../model/article.entity';

import { BannerMerchantType } from '../enum/banner-merchant.enum';

export class BannerMerchantDto implements Readonly<BannerMerchantDto> {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  type: BannerMerchantType;

  @IsOptional()
  isOpenNewWindow: boolean;

  @IsOptional()
  url: string;

  @IsOptional()
  product: Product;

  @IsOptional()
  article: Article;

  @IsOptional()
  bannerMerchantDesktop: BannerMerchantDesktop;

  @IsOptional()
  bannerMerchantApplication: BannerMerchantApplication;

  @IsNotEmpty()
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
}
