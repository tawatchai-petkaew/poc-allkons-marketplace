import {
  Controller,
  Get,
  Param,
  Query,
  UseFilters,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductPublicService } from './product-public.service';
import { SearchProductQueryDto } from './dto/search-product.dto';
import { ApiHeader, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { SearchProductResponseDto } from './dto/search-product-response.dto';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';
import { VariantOptionsResponseDto } from './dto/variant-options-response.dto';
import { ProductVariantDocumentDto } from './dto/product-variant-documents-response.dto';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { AllExceptionsFilter } from '@/filter/all-exceptions.filter';
import { ProductService } from '../product/services/product.service';

@Controller('v1/product-public')
export class ProductPublicController {
  constructor(
    private readonly productPublicService: ProductPublicService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Search Merchant Products' })
  @ApiOkResponse({ type: SearchProductResponseDto })
  @UseInterceptors(ResponseInterceptor)
  @UseFilters(AllExceptionsFilter)
  @ApiHeader({
    name: 'currentmerchantslug',
    description: 'currentmerchantslug',
    required: true,
  })
  async searchBuyerProducts(
    @Query() query: SearchProductQueryDto,
  ): Promise<{ data: SearchProductResponseDto }> {
    return this.productPublicService.search(query);
  }

  @Get('variant-by-sku')
  @ApiOperation({
    summary: 'Get Product Variant by SKU',
    description:
      'Get product variant details by SKU including product info and selected dimensions',
  })
  @ApiOkResponse({ type: ProductVariantResponseDto })
  @UseInterceptors(ResponseInterceptor)
  @UseFilters(AllExceptionsFilter)
  @ApiHeader({
    name: 'currentmerchantslug',
    description: 'currentmerchantslug',
    required: true,
  })
  async getProductVariantBySku(@Query('sku') sku: string) {
    return this.productPublicService.getProductVariantBySku(sku);
  }

  @Get(':productId/variant-options')
  @ApiOperation({
    summary: 'Get Product Variant Options',
    description:
      'Get all available dimension options for a product (grouped and deduplicated)',
  })
  @ApiOkResponse({ type: VariantOptionsResponseDto })
  @UseInterceptors(ResponseInterceptor)
  @UseFilters(AllExceptionsFilter)
  @ApiHeader({
    name: 'currentmerchantslug',
    description: 'currentmerchantslug',
    required: true,
  })
  async getProductVariantOptions(@Param('productId') productId: string) {
    return this.productPublicService.getProductVariantOptions(
      parseInt(productId, 10),
    );
  }

  @Get('variant/:productVariantId/documents')
  @ApiOperation({
    summary: 'Get Product Variant Documents',
    description:
      'Get all documents for a product variant by ID, including document type and file details',
  })
  @ApiOkResponse({ type: [ProductVariantDocumentDto] })
  @UseInterceptors(ResponseInterceptor)
  @UseFilters(AllExceptionsFilter)
  @ApiHeader({
    name: 'currentmerchantslug',
    description: 'currentmerchantslug',
    required: true,
  })
  async getProductVariantDocuments(
    @Param('productVariantId', ParseIntPipe) productVariantId: number,
  ) {
    return this.productPublicService.getProductVariantDocuments(
      productVariantId,
    );
  }

  @ApiOperation({
    summary: 'Get Product Images by Variant IDs',
    description:
      'Get oldest product image for each productVariantId (one image per variant)',
  })
  @Get('variant/images')
  @UseInterceptors(ResponseInterceptor)
  @UseFilters(AllExceptionsFilter)
  @ApiHeader({
    name: 'currentmerchantslug',
    description: 'currentmerchantslug',
    required: true,
  })
  async getProductImagesByVariantIds(
    @Query('productVariantIds') productVariantIds: string,
  ) {
    const variantIdArray = productVariantIds
      ? productVariantIds
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      : [];

    return this.productService.getProductImagesByVariantIds(variantIdArray);
  }
}
