import { HttpCacheInterceptor } from '@/cache/custom-cache.interceptor';
import {
  Controller,
  Get,
  Param,
  UseFilters,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  CacheTTL
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';

import { BannerMerchantPublicService } from './banner-merchant-public.service';

import { BannerMerchantDto } from './dto/banner-merchant.dto';

@Controller('banner-merchant-public')
export class BannerMerchantPublicController {
  constructor(
    private readonly bannerMerchantPublicService: BannerMerchantPublicService
  ) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(600)
  @Get()
  showAll(): Promise<any> {
    return this.bannerMerchantPublicService.getAll();
  }

  @UseInterceptors(HttpCacheInterceptor)
  // @CacheTTL(600)
  @Get(':id')
  @UseFilters(new HttpExceptionFilter())
  show(@Param('id') id: string): Promise<BannerMerchantDto> {
    return this.bannerMerchantPublicService.showById(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
