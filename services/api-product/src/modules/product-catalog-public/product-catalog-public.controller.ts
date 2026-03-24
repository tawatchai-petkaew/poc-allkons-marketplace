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
  UseInterceptors
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';
import { ProductCatalogPublicService } from './product-catalog-public.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Product Catalog Public')
@Controller('product-catalog-public')
export class ProductCatalogPublicController {
  constructor(
    private readonly productCatalogPublicService: ProductCatalogPublicService
  ) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(600)
  @Get()
  showAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination') withPagination: string,
    @Query('name') name: string
  ): Promise<any> {
    return this.productCatalogPublicService.getAll(
      {
        page,
        limit
      },
      withPagination,
      name
    );
  }

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(600)
  @UseFilters(new HttpExceptionFilter())
  @Get('/primary')
  showPrimary(): Promise<any> {
    return this.productCatalogPublicService
      .primaryProductCatalog()
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
  @Get(':id')
  @UseFilters(new HttpExceptionFilter())
  show(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search') search: string,
    @Query('withPagination') withPagination: string,
    @Query('orderBy') orderBy: string
  ): Promise<any> {
    return this.productCatalogPublicService
      .showById(
        +id,
        {
          page,
          limit
        },
        withPagination,
        search,
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
}
