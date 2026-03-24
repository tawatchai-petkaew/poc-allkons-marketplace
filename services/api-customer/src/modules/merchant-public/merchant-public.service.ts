import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MerchantTranslation } from '@/model/merchant-translation.entity';
import { Merchant } from '@/model/merchant.entity';
import { RequestContextService } from '@/modules/request-context/request-context.service';
import { getByIdWithTranslation } from '@/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MerchantDto } from '../merchant/dto/merchant.dto';
import { AutoTrace } from 'allkons-api-helper';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class MerchantPublicService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectRepository(MerchantTranslation)
    private readonly merchantTranslateRepo: Repository<MerchantTranslation>,
    private readonly contextService: RequestContextService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async get(): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const cacheKey = `merchants:${merchant.id}`;

    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) return { data: cached };
    const result = await getByIdWithTranslation({
      id: merchant.id,
      parent: merchant,
      parentRepoClass: this.merchantRepo,
      parentDtoClass: MerchantDto,
      childRepoClass: this.merchantTranslateRepo,
      parentKeyForGetChild: 'merchant',
      locale: this.contextService.currentLang,
      relations: ['merchantCategory'],
      nestedParentChildWithTranslation: [],
    });
    await this.cacheManager.set(cacheKey, result, 60 * 1000 * 1); // cache 1 min
    return {
      data: result,
    };
  }
}
