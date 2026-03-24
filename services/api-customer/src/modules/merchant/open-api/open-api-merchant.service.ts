import { Merchant } from '@/model';
import { MerchantTranslation } from '@/model/merchant-translation.entity';
import { RequestContextService } from '@/modules/request-context/request-context.service';
import { getByIdWithTranslation } from '@/utils/actionWithTranslation';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { MerchantDto } from '../dto/merchant.dto';

interface CustomRequest extends Request {
  merchant: Merchant;
}

@Injectable()
export class OpenApiMerchantService {
  constructor(
    @Inject('REQUEST') private readonly request: CustomRequest,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectRepository(MerchantTranslation)
    private readonly merchantTranslateRepo: Repository<MerchantTranslation>,
    private readonly contextService: RequestContextService
  ) {}

  public async getCurrentMerchant(): Promise<Merchant> {
    return await getByIdWithTranslation({
      id: this.request.merchant.id,
      parent: this.request.merchant,
      parentRepoClass: this.merchantRepo,
      parentDtoClass: MerchantDto,
      childRepoClass: this.merchantTranslateRepo,
      parentKeyForGetChild: 'merchant',
      locale: this.contextService.currentLang,
      relations: ['merchantCategory'],
      nestedParentChildWithTranslation: []
    });
  }
}
