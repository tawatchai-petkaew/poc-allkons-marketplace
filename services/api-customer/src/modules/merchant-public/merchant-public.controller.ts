import {
  Controller,
  Get,
  UseFilters,
  HttpException,
  HttpStatus,
  UseInterceptors,
  CacheTTL
} from '@nestjs/common';

import { HttpExceptionFilter } from '@/filter/http-exception.filter';
import { I18n, I18nContext } from 'nestjs-i18n';

import { MerchantPublicService } from './merchant-public.service';

@Controller('merchant-public')
export class MerchantPublicController {
  constructor(private readonly merchantPublicService: MerchantPublicService) {}

  @CacheTTL(600)
  @Get()
  @UseFilters(new HttpExceptionFilter())
  get(@I18n() i18n: I18nContext): Promise<any> {
    return this.merchantPublicService.get().catch((err) => {
      throw new HttpException(
        {
          message: i18n.t(err.message)
        },
        err?.status || HttpStatus.BAD_REQUEST
      );
    });
  }
}
