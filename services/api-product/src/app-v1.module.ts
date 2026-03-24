import { Module } from '@nestjs/common';
import { BuyerProductCategoryModule } from './modules-v1/buyer-product-category/buyer-product-category.module';
import { MarketplaceProductCategoryModule } from './modules-v1/marketplace-product-category/marketplace-product-category.module';
import { MarketplaceProductModule } from './modules-v1/marketplace-product/marketplace-product.module';
import { ProductModule } from './modules-v1/product/product.module';
import { CategoryModule } from './modules-v1/category/category.module';
import { ImportProductModule } from './modules-v1/import-product/import-product.module';
import { TemplateModule } from './modules-v1/template/template.module';
import { MasterDataModule } from './modules-v1/master-data/master-data.module';
import { ProductPublicModule } from './modules-v1/product-public/product-public.module';
import { HistoryModule } from './modules-v1/history/history.module';
import { SearchIndexModule } from './modules-v1/search-index/search-index.module';
@Module({
  imports: [
    // API V1 Modules
    BuyerProductCategoryModule,
    MarketplaceProductCategoryModule,
    MarketplaceProductModule,
    ProductModule,
    CategoryModule,
    ImportProductModule,
    TemplateModule,
    MasterDataModule,
    ProductPublicModule,
    HistoryModule,
    SearchIndexModule,
  ],
  controllers: [],
  providers: [],
})
export class AppV1Module {}
