import { ProductCategory } from '@/model/product-category.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestContextModule } from '@/modules/request-context/request-context.module';
import { BuyerProductCategoryController } from './buyer-product-category.controller';
import { BuyerProductCategoryService } from './buyer-product-category.service';
import { Category } from '@/model/category.entity';
import { MerchantCategoryView } from '@/model/merchant-category-view.entity';

@Module({
  imports: [
    RequestContextModule,
    TypeOrmModule.forFeature([ProductCategory, Category, MerchantCategoryView]),
  ],
  controllers: [BuyerProductCategoryController],
  providers: [BuyerProductCategoryService],
})
export class BuyerProductCategoryModule {}
