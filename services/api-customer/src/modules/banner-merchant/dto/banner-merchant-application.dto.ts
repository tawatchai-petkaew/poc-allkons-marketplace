import { IsOptional } from 'class-validator';

import { BannerMerchantApplication } from '../../../model/banner-merchant-application.entity';
import { BannerMerchant } from '../../../model/banner-merchant.entity';
import { ImageUpload } from '../../../model/image-upload.entity';

export class BannerMerchantApplicationDto
  implements Readonly<BannerMerchantApplicationDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  bannerMerchant: BannerMerchant;

  @IsOptional()
  bannerMerchantId: number;

  @IsOptional()
  imageUpload: ImageUpload;

  @IsOptional()
  imageUploadId: number;

  public static from(dto: Partial<BannerMerchantApplicationDto>) {
    const it = new BannerMerchantApplication();
    it.id = dto.id;
    it.bannerMerchant = dto.bannerMerchant;
    it.imageUpload = dto.imageUpload;

    return {
      ...it
    };
  }

  public static fromEntity(entity: BannerMerchantApplication) {
    return this.from({
      id: entity.id,
      bannerMerchant: entity.bannerMerchant,
      imageUpload: entity.imageUpload
    });
  }

  public static toEntity(dto: Partial<BannerMerchantApplicationDto>) {
    const it = new BannerMerchantApplication();
    it.bannerMerchant = dto.bannerMerchant;
    it.imageUpload = dto.imageUpload;

    return it;
  }
}
