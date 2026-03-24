import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BannerPromotion } from '../../model/banner-promotion.entity';
import { Merchant } from '../../model/merchant.entity';

import { RequestContextService } from '../request-context/request-context.service';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BannerPromotionDto } from './dto/banner-promotion.dto';
import { AutoTrace } from 'allkons-api-helper';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class BannerPromotionPublicService {
  constructor(
    @InjectRepository(BannerPromotion)
    private readonly bannerPromotionRepo: Repository<BannerPromotion>,
    private readonly contextService: RequestContextService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async getAll(): Promise<any> {
    const merchant: Merchant = await this.contextService.currentMerchantOnSlug();
    const cacheKey = `bannerPromotions:${merchant.id}`;

    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) return { data: cached };

    const bannerPromotions = await this.bannerPromotionRepo.find({
      where: {
        merchant: merchant,
      },
      order: {
        id: 'ASC',
      },
      relations: ['imageUpload'],
    });

    const bannerPromotionsData = bannerPromotions.map((e) =>
      BannerPromotionDto.fromEntity(e),
    );

    await this.cacheManager.set(cacheKey, bannerPromotionsData, 60 * 1000 * 1); // cache 1 min
    return {
      data: bannerPromotionsData,
    };
  }

  public async showById(id: number): Promise<any> {
    const merchant: Merchant = await this.contextService.currentMerchantOnSlug();

    const bannerPromotion = await this.bannerPromotionRepo.findOne(id, {
      where: {
        merchant: merchant,
      },
      relations: [
        'product',
        'article',
        'productBrand',
        'productCategory',
        'productCatalog',
        'imageUpload',
      ],
    });

    const bannerPromotionData = BannerPromotionDto.fromEntity(bannerPromotion);

    return {
      data: bannerPromotionData,
    };
  }
}
