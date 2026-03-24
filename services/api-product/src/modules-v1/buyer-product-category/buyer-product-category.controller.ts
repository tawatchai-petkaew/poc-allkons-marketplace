import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import {
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BuyerProductCategoryService } from './buyer-product-category.service';
import {
  BuyerProductCategoryDto,
  BuyerProductCategoryDtoV1,
} from './dto/buyer-product-category.dto';
import { Category } from '@/model/category.entity';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { BuyerCategoryNode } from './interface/merchant-product-category.interface';

@Controller('v1/buyer-product-category-public')
@ApiTags('Buyer Product Category')
export class BuyerProductCategoryController {
  constructor(
    private readonly buyerProductCategoryService: BuyerProductCategoryService,
  ) {}

  @CacheTTL(600)
  @Get()
  @ApiHeader({
    name: 'currentMerchantSlug',
    description: 'Current merchant slug',
  })
  @ApiOkResponse({ type: [BuyerProductCategoryDto] })
  @UseInterceptors(new ResponseInterceptor())
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async getAll(): Promise<{ data: BuyerCategoryNode[] }> {
    return this.buyerProductCategoryService.getMerchantCategoryTree();
  }

  @Get('current-category-tree/:categoryId')
  @ApiHeader({
    name: 'currentMerchantSlug',
    description: 'Current merchant slug',
    required: true,
  })
  @ApiOkResponse({ type: [BuyerProductCategoryDtoV1] })
  async getCategoryTree(
    @Param('categoryId') categoryId: string,
  ): Promise<BuyerProductCategoryDtoV1> {
    return this.buyerProductCategoryService.getCurrentCategoryTree(categoryId);
  }

  @Get('sub-categories/:categoryId')
  @UseInterceptors(ResponseInterceptor)
  @ApiOkResponse({ type: [Category] })
  async getSubCategories(
    @Param('categoryId') categoryId: number,
  ): Promise<Category[]> {
    return this.buyerProductCategoryService.getSubCategories(categoryId);
  }
}
