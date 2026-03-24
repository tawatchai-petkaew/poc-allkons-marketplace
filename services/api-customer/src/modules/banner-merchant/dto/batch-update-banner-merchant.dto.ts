import { IsNotEmpty } from 'class-validator';

import { UpdateBannerMerchantDto } from './update-banner-merchant.dto';

export class BatchUpdateBannerMerchantDto
  implements Readonly<BatchUpdateBannerMerchantDto> {
  @IsNotEmpty()
  bannerMerchantAttributes: UpdateBannerMerchantDto[];
}
