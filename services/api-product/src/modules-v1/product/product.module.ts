import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './services/product.service';
import { ExportProductService } from './services/export-product.service';
import { ManageProductService } from './services/manage-product.service';
import { ProductController } from './product.controller';
import { ProductMatchingModule } from '../product-matching/product-matching.module';
import { RequestContextModule } from '@/modules/request-context/request-context.module';
import { S3Module } from '@/modules-v1/s3/s3.module';
import { MerchantProduct } from '@/model/merchant-product.entity';
import { MerchantImage } from '@/model/merchant-image.entity';
import { ImageUpload } from '@/model/image-upload.entity';
import { Merchant } from '@/model/merchant.entity';
import { Product } from '@/model/product.entity';
import { ProductVariant } from '@/model/product-variant.entity';
import { Category } from '@/model/category.entity';
import { ProductVariantImage } from '@/model/product-variant-image.entity';
import { UserMerchant } from '@/model/user-merchant.entity';
import { MerchantCategory } from '@/model/merchant-category.entity';
import { User } from '@/model/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MerchantProduct,
      MerchantImage,
      ImageUpload,
      Merchant,
      Product,
      ProductVariant,
      Category,
      ProductVariantImage,
      UserMerchant,
      MerchantCategory,
      User,
    ]),
    RequestContextModule,
    ProductMatchingModule,
    S3Module,
  ],
  controllers: [ProductController],
  providers: [ProductService, ExportProductService, ManageProductService],
  exports: [ProductService],
})
export class ProductModule { }
