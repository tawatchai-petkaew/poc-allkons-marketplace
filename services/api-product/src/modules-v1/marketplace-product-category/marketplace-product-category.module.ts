import { Module } from '@nestjs/common';
import { MarketplaceProductCategoryService } from './marketplace-product-category.service';
import { MarketplaceProductCategoryController } from './marketplace-product-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from '@/model/product-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategory])],
  controllers: [MarketplaceProductCategoryController],
  providers: [MarketplaceProductCategoryService],
  exports: [MarketplaceProductCategoryService],
})
export class MarketplaceProductCategoryModule {}
