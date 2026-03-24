import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';

@Controller('v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @UseInterceptors(new ResponseInterceptor())
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get('sub-categories')
  @UseInterceptors(new ResponseInterceptor())
  async findSubCategoriesAll() {
    return this.categoryService.findSubCategoriesAll();
  }

  @Get('children')
  @UseInterceptors(new ResponseInterceptor())
  async findChildrenById(@Query('categoryId') categoryId: string) {
    const parsedCategoryId = parseInt(categoryId);
    return this.categoryService.findChildrenById(parsedCategoryId);
  }

  @Get('category-tree')
  @UseInterceptors(new ResponseInterceptor())
  async getCategoryTree(@Query('categoryId') categoryId: string) {
    return this.categoryService.getCurrentCategoryTree(categoryId);
  }

  @Get('hierarchy')
  @UseInterceptors(new ResponseInterceptor())
  async getCategoryHierarchies(
    @Query('productVariantIds') productVariantIds: string,
  ) {
    const productVariantIdArray = productVariantIds
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    return this.categoryService.getCategoryHierarchies(productVariantIdArray);
  }
}
