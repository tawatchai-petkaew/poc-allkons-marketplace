import { IsNotEmpty } from 'class-validator';

import { CreateBannerMerchantDto } from './create-banner-merchant.dto';

export class BatchBannerMerchantDto
  implements Readonly<BatchBannerMerchantDto> {
  @IsNotEmpty()
  bannerMerchantAttributes: CreateBannerMerchantDto[];
}
