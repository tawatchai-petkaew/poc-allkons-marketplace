import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarketplaceProductCategoryService } from './marketplace-product-category.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BuyerProductCategoryDto } from '../buyer-product-category/dto/buyer-product-category.dto';
import { MarketplaceProductCategoryResponseDto } from './dto/marketplace-product-category.dto';

@ApiTags('Marketplace Product Category')
@Controller('v1/marketplace-product-category')
export class MarketplaceProductCategoryController {
  constructor(
    private readonly marketplaceProductCategoryService: MarketplaceProductCategoryService,
  ) {}

  @Get()
  @ApiOkResponse({ type: MarketplaceProductCategoryResponseDto })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async getAll(): Promise<MarketplaceProductCategoryResponseDto> {
    return this.marketplaceProductCategoryService.getAll();
  }

  @Get(':ids')
  @ApiOkResponse({ type: [BuyerProductCategoryDto] })
  async getById(@Param('ids') ids: string ,@Query('responseType') responseType: 'nested' | 'flat' = 'flat'): Promise<BuyerProductCategoryDto[]> {
    return this.marketplaceProductCategoryService.getByIds(ids?.split(',').map(Number), responseType);
  }
}
