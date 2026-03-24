import { IsOptional } from 'class-validator';

import { BannerMerchantDesktop } from '../../../model/banner-merchant-desktop.entity';
import { BannerMerchant } from '../../../model/banner-merchant.entity';
import { ImageUpload } from '../../../model/image-upload.entity';

export class BannerMerchantDesktopDto
  implements Readonly<BannerMerchantDesktopDto> {
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

  public static from(dto: Partial<BannerMerchantDesktopDto>) {
    const it = new BannerMerchantDesktop();
    it.id = dto.id;
    it.bannerMerchant = dto.bannerMerchant;
    it.imageUpload = dto.imageUpload;

    return {
      ...it
    };
  }

  public static fromEntity(entity: BannerMerchantDesktop) {
    return this.from({
      id: entity.id,
      bannerMerchant: entity.bannerMerchant,
      imageUpload: entity.imageUpload
    });
  }

  public static toEntity(dto: Partial<BannerMerchantDesktopDto>) {
    const it = new BannerMerchantDesktop();
    it.bannerMerchant = dto.bannerMerchant;
    it.imageUpload = dto.imageUpload;

    return it;
  }
}
