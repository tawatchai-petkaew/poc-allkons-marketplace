import { HttpCacheInterceptor } from '@/cache/custom-cache.interceptor';
import {
  Controller,
  Get,
  Param,
  UseFilters,
  HttpException,
  HttpStatus,
  UseInterceptors
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';

import { HttpExceptionFilter } from '../../filter/http-exception.filter';

import { FlashSalePublicService } from './flash-sale-public.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Flash Sale Public')
@Controller('flash-sale-public')
export class FlashSalePublicController {
  constructor(
    private readonly flashSalePublicService: FlashSalePublicService
  ) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(600)
  @UseFilters(new HttpExceptionFilter())
  @Get()
  showActive(): Promise<any> {
    return this.flashSalePublicService.activeFlashSale().catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(600)
  @Get(':id')
  @UseFilters(new HttpExceptionFilter())
  show(@Param('id') id: string): Promise<any> {
    return this.flashSalePublicService.showById(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
