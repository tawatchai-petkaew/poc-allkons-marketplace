import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BannerMerchantPublicController } from './banner-merchant-public.controller';
import { BannerMerchantPublicService } from './banner-merchant-public.service';

import { BannerMerchant } from '../../model/banner-merchant.entity';

import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [TypeOrmModule.forFeature([BannerMerchant]), RequestContextModule],
  controllers: [BannerMerchantPublicController],
  providers: [BannerMerchantPublicService]
})
export class BannerMerchantPublicModule {}
