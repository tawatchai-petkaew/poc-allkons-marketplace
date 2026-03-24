import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BannerMerchantService } from './banner-merchant.service';
import { BannerMerchantController } from './banner-merchant.controller';

import { BannerMerchant } from '../../model/banner-merchant.entity';
import { Product } from '../../model/product.entity';
import { BannerMerchantDesktop } from '../../model/banner-merchant-desktop.entity';
import { BannerMerchantApplication } from '../../model/banner-merchant-application.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { Article } from '../../model/article.entity';

import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BannerMerchant,
      Product,
      BannerMerchantDesktop,
      BannerMerchantApplication,
      Article,
      ImageUpload,
    ]),
    RequestContextModule,
  ],
  providers: [BannerMerchantService],
  controllers: [BannerMerchantController],
})
export class BannerMerchantModule {}
