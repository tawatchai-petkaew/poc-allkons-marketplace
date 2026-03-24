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

import { BannerPromotionPublicService } from './banner-promotion-public.service';
import { BannerPromotionDto } from './dto/banner-promotion.dto';

@Controller('banner-promotion-public')
export class BannerPromotionPublicController {
  constructor(
    private readonly bannerPromotionPublicService: BannerPromotionPublicService
  ) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(600)
  @Get()
  showAll(): Promise<any> {
    return this.bannerPromotionPublicService.getAll();
  }
  @UseInterceptors(HttpCacheInterceptor)
  // @CacheTTL(600)
  @Get(':id')
  @UseFilters(new HttpExceptionFilter())
  show(@Param('id') id: string): Promise<BannerPromotionDto> {
    return this.bannerPromotionPublicService.showById(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
