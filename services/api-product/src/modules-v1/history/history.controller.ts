import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  Delete,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { HistorySearchProductService } from './history.service';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import {
  HistorySearchProductResponseDto,
  addHistorySearchProductDto,
  deleteHistorySearchProductByIdDto,
} from './dto/historySearchProduct.dto';
import { AuthUser } from '@/types/request.types';
import { CurrentUser } from '@/decorators/request.decorator';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { HttpExceptionFilter } from 'allkons-api-helper';

@Controller('v1/history')
export class HistoryController {
  constructor(
    private readonly historySearchProduct: HistorySearchProductService,
  ) {}

  @Get('search/products/by-user')
  @UseInterceptors(new ResponseInterceptor())
  //   @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard)
  async getHistorySearchProduct(
    @CurrentUser() user: AuthUser,
  ): Promise<HistorySearchProductResponseDto[]> {
    return this.historySearchProduct.getHistorySearchProduct(user);
  }

  @Post('search/products/by-user')
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard)
  async postHistorySearchProduct(
    @CurrentUser() user: AuthUser,
    @Body() body: addHistorySearchProductDto,
  ): Promise<HistorySearchProductResponseDto> {
    return this.historySearchProduct.postHistorySearchProduct(user, body);
  }

  @Delete('search/products/by-user')
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard)
  async deleteHistorySearchProductById(
    @CurrentUser() user: AuthUser,
    @Body() body: deleteHistorySearchProductByIdDto,
  ): Promise<{ data: string }> {
    return this.historySearchProduct.deleteHistorySearchProductById(user, body);
  }

  @Delete('search/products/by-user/search-all')
  @UseInterceptors(new ResponseInterceptor())
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(ActJwtGuard)
  async deleteHistorySearchAllProductById(
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: string }> {
    return this.historySearchProduct.deleteHistorySearchAllProductById(user);
  }
}
