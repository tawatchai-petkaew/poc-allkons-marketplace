import { HttpCacheInterceptor } from '@/cache/custom-cache.interceptor';
import {
  Controller,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  Get,
  Param,
  UseFilters,
  HttpException,
  HttpStatus,
  UseGuards,
  ParseBoolPipe,
  UseInterceptors,
  CacheTTL
} from '@nestjs/common';

import { HttpExceptionFilter } from '../../filter/http-exception.filter';

import { ArticlePublicService } from './article-public.service';
import { ArticleDto } from './dto/article.dto';

@Controller('article-public')
export class ArticlePublicController {
  constructor(private readonly articlePublicService: ArticlePublicService) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(600)
  @Get()
  showAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination') withPagination: string,
    @Query('name') name: string,
    @Query('tag') tag: string
  ): Promise<any> {
    return this.articlePublicService.getAll(
      {
        page,
        limit
      },
      withPagination,
      name,
      tag
    );
  }

  @UseInterceptors(HttpCacheInterceptor)
  // @CacheTTL(1800)
  @Get(':id')
  @UseFilters(new HttpExceptionFilter())
  show(@Param('id') id: string): Promise<ArticleDto> {
    return this.articlePublicService.showById(id).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
