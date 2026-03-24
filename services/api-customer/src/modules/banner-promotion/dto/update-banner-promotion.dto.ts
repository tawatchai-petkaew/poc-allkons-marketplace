import { IsOptional } from 'class-validator';

import { Product } from '../../../model/product.entity';
import { Merchant } from '../../../model/merchant.entity';
import { BannerPromotion } from '../../../model/banner-promotion.entity';
import { ImageUpload } from '../../../model/image-upload.entity';
import { Article } from '../../../model/article.entity';

import { BannerMerchantType } from '../enum/banner-promotion.enum';

import { BannerPromotionDto } from './banner-promotion.dto';

export class UpdateBannerPromotionDto
  implements Readonly<UpdateBannerPromotionDto>
{
  @IsOptional()
  id: number;

  @IsOptional()
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
  imageUpload: ImageUpload;

  @IsOptional()
  imageUploadId: number;

  @IsOptional()
  merchant: Merchant;

  public static from(dto: Partial<BannerPromotionDto>) {
    const it = new BannerPromotion();
    it.id = dto.id;
    it.imageUpload = dto.imageUpload;
    it.type = dto.type;
    it.isOpenNewWindow = dto.isOpenNewWindow;
    it.url = dto.url;
    it.product = dto.product;
    it.article = dto.article;

    return {
      ...it,
    };
  }

  public static fromEntity(entity: BannerPromotion) {
    return this.from({
      id: entity.id,
      imageUpload: entity.imageUpload,
      type: entity.type,
      isOpenNewWindow: entity.isOpenNewWindow,
      url: entity.url,
      product: entity.product,
      article: entity.article,
    });
  }

  public static toEntity(dto: Partial<UpdateBannerPromotionDto>) {
    const it = new BannerPromotion();
    it.imageUpload = dto.imageUpload;
    it.type = dto.type;
    it.isOpenNewWindow = dto.isOpenNewWindow;
    it.url = dto.url;
    it.product = dto.product;
    it.article = dto.article;

    return it;
  }
}
