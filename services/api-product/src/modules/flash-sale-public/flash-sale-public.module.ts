import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FlashSalePublicService } from './flash-sale-public.service';
import { FlashSalePublicController } from './flash-sale-public.controller';

import { FlashSale } from '../../model/flash-sale.entity';
import { Product } from '../../model/product.entity';
import { ProductTranslation } from '../../model/product-translation.entity';

import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlashSale, Product, ProductTranslation]),
    RequestContextModule
  ],
  providers: [FlashSalePublicService],
  controllers: [FlashSalePublicController],
  exports: [FlashSalePublicService]
})
export class FlashSalePublicModule {}
