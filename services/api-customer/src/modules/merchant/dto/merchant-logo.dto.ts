import { IsOptional } from 'class-validator';

import { ImageUpload } from '@/model/image-upload.entity';
import { MerchantLogo } from '@/model/merchant-logo.entity';
import { Merchant } from '@/model/merchant.entity';

export class MerchantLogoDto implements Readonly<MerchantLogoDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  merchant: Merchant;

  @IsOptional()
  merchantId: number;

  @IsOptional()
  imageUpload: ImageUpload;

  @IsOptional()
  imageUploadId: number;

  public static from(dto: Partial<MerchantLogoDto>) {
    const it = new MerchantLogo();
    it.id = dto.id;
    it.merchant = dto.merchant;
    it.imageUpload = dto.imageUpload;

    return it;
  }

  public static fromEntity(entity: MerchantLogo) {
    return this.from({
      id: entity.id,
      merchant: entity.merchant,
      imageUpload: entity.imageUpload
    });
  }

  public static toEntity(dto: Partial<MerchantLogoDto>) {
    const it = new MerchantLogo();
    it.merchant = dto.merchant;
    it.imageUpload = dto.imageUpload;

    return it;
  }
}
