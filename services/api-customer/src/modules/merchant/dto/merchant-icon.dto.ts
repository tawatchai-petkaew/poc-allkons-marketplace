import { IsOptional } from 'class-validator';

import { ImageUpload } from '@/model/image-upload.entity';
import { Merchant } from '@/model/merchant.entity';
import { MerchantIcon } from '@/model/merchant-icon.entity';

export class MerchantIconDto implements Readonly<MerchantIconDto> {
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

  public static from(dto: Partial<MerchantIconDto>) {
    const it = new MerchantIcon();
    it.id = dto.id;
    it.merchant = dto.merchant;
    it.imageUpload = dto.imageUpload;

    return it;
  }

  public static fromEntity(entity: MerchantIcon) {
    return this.from({
      id: entity.id,
      merchant: entity.merchant,
      imageUpload: entity.imageUpload
    });
  }

  public static toEntity(dto: Partial<MerchantIconDto>) {
    const it = new MerchantIcon();
    it.merchant = dto.merchant;
    it.imageUpload = dto.imageUpload;

    return it;
  }
}
