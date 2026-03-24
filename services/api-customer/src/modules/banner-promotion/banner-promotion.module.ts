import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BannerPromotionService } from './banner-promotion.service';
import { BannerPromotionController } from './banner-promotion.controller';

import { Product } from '../../model/product.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { BannerPromotion } from '../../model/banner-promotion.entity';
import { Article } from '../../model/article.entity';

import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BannerPromotion, Product, Article, ImageUpload]),
    RequestContextModule,
  ],
  providers: [BannerPromotionService],
  controllers: [BannerPromotionController],
})
export class BannerPromotionModule {}
