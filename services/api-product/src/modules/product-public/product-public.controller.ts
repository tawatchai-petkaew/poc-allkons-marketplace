import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Query,
  UseFilters,
  UseInterceptors
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { ProductPublicService } from './product-public.service';

import { HttpCacheInterceptor } from '@/cache/custom-cache.interceptor';
import { HttpExceptionFilter } from '../../filter/http-exception.filter'
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Product Public')
@Controller('product-public')
export class ProductPublicController {
  constructor(private readonly productPublicService: ProductPublicService) {}

  @UseInterceptors(HttpCacheInterceptor)
  // @CacheTTL(600)
  @Get()
  @UseFilters(new HttpExceptionFilter())
  showAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination') withPagination: string,
    @Query('search') search: string,
    @Query(
      'productCategoryIds',
      new ParseArrayPipe({
        optional: true,
        items: Number,
        separator: ','
      })
    )
    productCategoryIds: Array<number>,
    @Query(
      'productBrandIds',
      new ParseArrayPipe({
        optional: true,
        items: Number,
        separator: ','
      })
    )
    productBrandIds: Array<number>,
    @Query(
      'productCatalogIds',
      new ParseArrayPipe({
        optional: true,
        items: Number,
        separator: ','
      })
    )
    productCatalogIds: Array<number>,
    @Query('orderBy') orderBy: string
  ): Promise<any> {
    return this.productPublicService
      .getAll(
        {
          page,
          limit
        },
        withPagination,
        search,
        productCategoryIds,
        productBrandIds,
        productCatalogIds,
        orderBy
      )
      .catch((err) => {
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
  @Get('bestSeller')
  @UseFilters(new HttpExceptionFilter())
  showAllBestSeller(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination', new DefaultValuePipe('true')) withPagination: string
  ): Promise<any> {
    return this.productPublicService
      .getBestSeller(
        {
          page,
          limit
        },
        withPagination
      )
      .catch((err) => {
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
  @Get('new')
  @UseFilters(new HttpExceptionFilter())
  showAllNew(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination', new DefaultValuePipe('true')) withPagination: string
  ): Promise<any> {
    return this.productPublicService
      .getNew(
        {
          page,
          limit
        },
        withPagination
      )
      .catch((err) => {
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
  @Get('discount')
  @UseFilters(new HttpExceptionFilter())
  showAllDiscount(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination', new DefaultValuePipe('true')) withPagination: string
  ): Promise<any> {
    return this.productPublicService
      .getDiscount(
        {
          page,
          limit
        },
        withPagination
      )
      .catch((err) => {
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
  @Get('recommend')
  @UseFilters(new HttpExceptionFilter())
  showAllRecommed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination', new DefaultValuePipe('true')) withPagination: string
  ): Promise<any> {
    return this.productPublicService
      .getRecommend(
        {
          page,
          limit
        },
        withPagination
      )
      .catch((err) => {
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
  @Get(':slug')
  show(@Param('slug') slug: string): Promise<any> {
    return this.productPublicService.showBySlug(slug);
  }

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(600)
  @Get(':slug/relationProducts')
  @UseFilters(new HttpExceptionFilter())
  showRelationProducts(@Param('slug') slug: string): Promise<any> {
    return this.productPublicService.getRelationProduct(slug).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
