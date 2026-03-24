import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BannerPromotionPublicService } from './banner-promotion-public.service';
import { BannerPromotionPublicController } from './banner-promotion-public.controller';

import { BannerPromotion } from '../../model/banner-promotion.entity';

import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [TypeOrmModule.forFeature([BannerPromotion]), RequestContextModule],
  providers: [BannerPromotionPublicService],
  controllers: [BannerPromotionPublicController]
})
export class BannerPromotionPublicModule {}
