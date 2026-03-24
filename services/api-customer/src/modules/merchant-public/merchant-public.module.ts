import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MerchantPublicController } from './merchant-public.controller';
import { MerchantPublicService } from './merchant-public.service';

import { MerchantTranslation } from '@/model/merchant-translation.entity';
import { Merchant } from '@/model/merchant.entity';
import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      MerchantTranslation,
    ]),
    RequestContextModule,
  ],
  controllers: [MerchantPublicController],
  providers: [MerchantPublicService],
  exports: [MerchantPublicService],
})
export class MerchantPublicModule {}
