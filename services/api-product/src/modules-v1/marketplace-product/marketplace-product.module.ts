import { Module } from '@nestjs/common';
import { MarketplaceProductService } from './marketplace-product.service';
import { MarketplaceProductController } from './marketplace-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/model/product.entity';
import { ProductTranslation } from '@/model/product-translation.entity';
import { ProductCategory } from '@/model/product-category.entity';
import { ProductBrand } from '@/model/product-brand.entity';
import { ProductBrandTranslation } from '@/model/product-brand-translation.entity';
import { ProductCategoryTranslation } from '@/model/product-category-translation.entity';
import { FlashSalePublicModule } from '@/modules/flash-sale-public/flash-sale-public.module';
import { RequestContextModule } from '@/modules/request-context/request-context.module';
import { MerchantProduct } from '@/model/merchant-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductTranslation,
      ProductCategory,
      ProductBrand,
      ProductBrandTranslation,
      ProductCategoryTranslation,
      MerchantProduct,
    ]),
    RequestContextModule,
    FlashSalePublicModule,
  ],
  controllers: [MarketplaceProductController],
  providers: [MarketplaceProductService],
  exports: [MarketplaceProductService],
})
export class MarketplaceProductModule {}
