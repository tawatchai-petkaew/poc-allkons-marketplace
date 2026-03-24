import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductCatalogPublicService } from './product-catalog-public.service';
import { ProductCatalogPublicController } from './product-catalog-public.controller';

import { ProductCatalog } from '../../model/product-catalog.entity';
import { Product } from '../../model/product.entity';
import { ProductTranslation } from '../../model/product-translation.entity';
import { ImageUpload } from '../../model/image-upload.entity';

import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCatalog,
      Product,
      ProductTranslation,
      ImageUpload,
    ]),
    RequestContextModule,
  ],
  providers: [ProductCatalogPublicService],
  controllers: [ProductCatalogPublicController],
})
export class ProductCatalogPublicModule {}
