import {
  Put,
  Delete,
  Param,
  Controller,
  UseFilters,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';

import { MerchantCategoryService } from './merchant-category.service';
import { CreateMerchantCategoryDto } from './dto/create-merchant-category.dto';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';
import { UpdateMerchantCategoryDto } from './dto/update-merchant-category.dto';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

@Controller('merchant-category')
export class MerchantCategoryController {
  constructor(
    private readonly merchantCategoryService: MerchantCategoryService,
  ) {}

  @UseGuards(ActJwtGuard)
  @Post()
  create(@Body() dto: CreateMerchantCategoryDto) {
    return this.merchantCategoryService.create(dto);
  }

  // @UseGuards(ActJwtGuard)
  @Get()
  @UseFilters(new HttpExceptionFilter())
  showAll() {
    return this.merchantCategoryService.showAll();
  }

  @UseGuards(ActJwtGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMerchantCategoryDto) {
    return this.merchantCategoryService.update(+id, dto);
  }

  @UseGuards(ActJwtGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.merchantCategoryService.delete(+id);
  }
}
