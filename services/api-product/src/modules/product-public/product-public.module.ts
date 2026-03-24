import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPublicController } from './product-public.controller';
import { ProductPublicService } from './product-public.service';
import { ProductBrandTranslation } from '../../model/product-brand-translation.entity';
import { ProductBrand } from '../../model/product-brand.entity';
import { ProductCategoryTranslation } from '../../model/product-category-translation.entity';
import { ProductCategory } from '../../model/product-category.entity';
import { ProductTranslation } from '../../model/product-translation.entity';
import { Product } from '../../model/product.entity';
import { ProductItem } from '@/model/product-item.entity';
import { FlashSalePublicModule } from '../flash-sale-public/flash-sale-public.module';
import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Product,
      ProductTranslation,
      ProductCategory,
      ProductCategoryTranslation,
      ProductBrand,
      ProductBrandTranslation,
      ProductItem,
    ]),
    RequestContextModule,
    FlashSalePublicModule
  ],
  providers: [ProductPublicService],
  controllers: [ProductPublicController]
})
export class ProductPublicModule {}
