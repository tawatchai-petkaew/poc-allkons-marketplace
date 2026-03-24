import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MerchantCategory } from '../../model/merchant-category.entity';
import { MerchantCategoryService } from './merchant-category.service';
import { MerchantCategoryController } from './merchant-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MerchantCategory])],
  providers: [MerchantCategoryService],
  controllers: [MerchantCategoryController]
})
export class MerchantCategoryModule {}
