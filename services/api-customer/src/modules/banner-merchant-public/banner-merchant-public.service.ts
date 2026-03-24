import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BannerMerchant } from '../../model/banner-merchant.entity';
import { Merchant } from '../../model/merchant.entity';

import { RequestContextService } from '../request-context/request-context.service';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BannerMerchantDto } from './dto/banner-merchant.dto';
import { AutoTrace } from 'allkons-api-helper';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class BannerMerchantPublicService {
  constructor(
    @InjectRepository(BannerMerchant)
    private readonly bannerMerchantRepo: Repository<BannerMerchant>,
    private readonly contextService: RequestContextService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async getAll(): Promise<any> {
    try {
      const merchant: Merchant =
        await this.contextService.currentMerchantOnSlug();
      const cacheKey = `bannerMerchants:${merchant.id}`;

      const cached: any = await this.cacheManager.get(cacheKey);
      if (cached) return { data: cached };

      const bannerMerchants = await this.bannerMerchantRepo.find({
        where: {
          merchant: merchant,
        },
        order: {
          id: 'ASC',
        },
        relations: [
          'bannerMerchantDesktop',
          'bannerMerchantDesktop.imageUpload',
          'bannerMerchantApplication',
          'bannerMerchantApplication.imageUpload',
        ],
      });

      const bannerMerchantsData = bannerMerchants.map((e) =>
        BannerMerchantDto.fromEntity(e),
      );
      await this.cacheManager.set(cacheKey, bannerMerchantsData, 60 * 1000 * 1); // cache 1 min
      return {
        data: bannerMerchantsData,
      };
    } catch (error) {
      console.error('Error in getAll ee:', error);
      throw error;
    }
  }

  public async showById(id: number): Promise<any> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const bannerMerchant = await this.bannerMerchantRepo.findOne(id, {
      where: {
        merchant: merchant,
      },
      relations: [
        'product',
        'article',
        'productBrand',
        'productCategory',
        'productCatalog',
        'bannerMerchantDesktop',
        'bannerMerchantDesktop.imageUpload',
        'bannerMerchantApplication',
        'bannerMerchantApplication.imageUpload',
      ],
    });

    const bannerMerchantData = BannerMerchantDto.fromEntity(bannerMerchant);

    return {
      data: bannerMerchantData,
    };
  }
}
