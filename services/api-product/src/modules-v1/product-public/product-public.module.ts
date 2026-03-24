import { Module } from '@nestjs/common';
import { ProductPublicService } from './product-public.service';
import { ProductPublicController } from './product-public.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantProduct } from '@/model/merchant-product.entity';
import { ProductVariant } from '@/model/product-variant.entity';
import { RequestContextModule } from '@/modules/request-context/request-context.module';
import { ProductVariantDimension } from '@/model/product-variant-dimension.entity';
import { ProductVariantImage } from '@/model/product-variant-image.entity';
import { ProductVariantDocument } from '@/model/product-variant-document.entity';
import { ProductModule } from '../product/product.module';
import { Category } from '@/model/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MerchantProduct,
      ProductVariant,
      ProductVariantDimension,
      ProductVariantImage,
      ProductVariantDocument,
      Category
    ]),
    RequestContextModule,
    ProductModule,
  ],
  controllers: [ProductPublicController],
  providers: [ProductPublicService],
})
export class ProductPublicModule {}
