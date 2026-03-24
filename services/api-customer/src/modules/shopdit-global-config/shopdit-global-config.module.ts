import { Module } from '@nestjs/common';
import { ShopditGlobalConfigService } from './shopdit-global-config.service';
import { ShopditGlobalConfigController } from './shopdit-global-config.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShopditGlobalConfig } from '../../model/shopdit-global-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopditGlobalConfig])],
  providers: [ShopditGlobalConfigService],
  controllers: [ShopditGlobalConfigController]
})
export class ShopditGlobalConfigModule {}
