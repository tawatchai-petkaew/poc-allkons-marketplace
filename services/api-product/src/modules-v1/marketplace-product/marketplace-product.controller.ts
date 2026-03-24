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
  UseInterceptors,
} from '@nestjs/common';
import { MarketplaceProductService } from './marketplace-product.service';
import { ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { HttpCacheInterceptor } from '@/cache/custom-cache.interceptor';
import { HttpExceptionFilter } from '@/filter/http-exception.filter';

@ApiTags('Marketplace Product')
@Controller('v1/marketplace-product')
export class MarketplaceProductController {
  constructor(
    private readonly marketplaceProductService: MarketplaceProductService,
  ) {}

  @Get(':slug/relationProducts')
  async getRelationProduct(@Param('slug') slug: string): Promise<any> {
    return this.marketplaceProductService.getRelationProduct(slug);
  }

  @ApiNotFoundResponse({ description: 'Product not found' })
  @Get(':slug/productMerchants')
  async getProductMerchants(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<any> {
    return this.marketplaceProductService.getProductMerchants(
      slug,
      page,
      limit,
    );
  }

  @UseInterceptors(HttpCacheInterceptor)
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
        separator: ',',
      }),
    )
    productCategoryIds: Array<number>,
    @Query(
      'productBrandIds',
      new ParseArrayPipe({
        optional: true,
        items: Number,
        separator: ',',
      }),
    )
    productBrandIds: Array<number>,
    @Query(
      'productCatalogIds',
      new ParseArrayPipe({
        optional: true,
        items: Number,
        separator: ',',
      }),
    )
    productCatalogIds: Array<number>,
    @Query('orderBy') orderBy: string,
  ): Promise<any> {
    return this.marketplaceProductService
      .getAll(
        {
          page,
          limit,
        },
        withPagination,
        search,
        productCategoryIds,
        productBrandIds,
        productCatalogIds,
        orderBy,
      )
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }
}
