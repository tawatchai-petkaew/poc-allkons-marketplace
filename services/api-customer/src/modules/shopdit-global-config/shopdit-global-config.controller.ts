import { HttpCacheInterceptor } from '@/cache/custom-cache.interceptor';
import {
  Body,
  CacheTTL,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors
} from '@nestjs/common';

import { ShopditGlobalConfigService } from './shopdit-global-config.service';

@Controller('shopdit-global-config')
export class ShopditGlobalConfigController {
  constructor(
    private readonly shopditGlobalConfigService: ShopditGlobalConfigService
  ) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(600)
  @Get()
  show(): Promise<any> {
    return this.shopditGlobalConfigService.get();
  }

  @Post()
  createOrUpdate(@Body() dto: any): Promise<any> {
    return this.shopditGlobalConfigService.createOrUpdate(dto).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
