import { IsNotEmpty } from 'class-validator';

import { UpdateBannerPromotionDto } from './update-banner-promotion.dto';

export class BatchUpdateBannerPromotionDto
  implements Readonly<BatchUpdateBannerPromotionDto> {
  @IsNotEmpty()
  bannerPromotionAttributes: UpdateBannerPromotionDto[];
}
