import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseFilters,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';

import { AuthCenterGuard, JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';
import { SentryInterceptor } from '../../sentry/sentry.interceptor';

import { CartPublicService } from './cart-public.service';
import { CartItemDto } from './dto/cart-item.dto';
import { CartDto } from './dto/cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiHeader, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { GetCartQueryDto } from './dto/get-cart-query.dto';
import { DeleteCartItemsDto } from './dto/delete-cart-items.dto';

@UseInterceptors(SentryInterceptor)
@Controller('cart-public')
@ApiTags('Cart Public')
export class CartPublicController {
  constructor(private readonly cartPublicService: CartPublicService) {}

  @ApiHeaders([
    {
      name: 'currentmerchantslug',
      description: 'Current merchant slug',
      required: true,
    },
  ])
  @UseGuards(AuthCenterGuard)
  @Get()
  async show(@Request() req, @Query() query: GetCartQueryDto): Promise<any> {
    return await this.cartPublicService.get(query, req.user.userId);
  }

  @UseGuards(AuthCenterGuard)
  @Get('count')
  async showCount(): Promise<{ data: number }> {
    return await this.cartPublicService.getCount();
  }

  @UseGuards(AuthCenterGuard)
  @Put(':id')
  @UseFilters(new HttpExceptionFilter())
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateCartDto,
    @I18n() i18n: I18nContext,
  ): Promise<CartDto> {
    return await this.cartPublicService
      .update(+id, dto, req.user.userId, i18n)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @ApiHeader({
    name: 'currentmerchantslug',
    description: 'Current merchant slug',
    required: true,
  })
  @UseGuards(AuthCenterGuard)
  @Post('cartItem')
  @UseFilters(new HttpExceptionFilter())
  async createCartItem(
    @Request() req,
    @Body() dto: CartItemDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    return await this.cartPublicService
      .createCartItem(dto, req.user.userId, i18n)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(AuthCenterGuard)
  @Put('cartItem/:id')
  @UseFilters(new HttpExceptionFilter())
  async updateCartItem(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CartItemDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    return await this.cartPublicService
      .updateCartItem(+id, dto, req.user.userId, i18n)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cartItem')
  async delete(
    @Body() dto: DeleteCartItemsDto,
  ): Promise<{ data: { deletedIds: number[] } }> {
    return await this.cartPublicService.deleteCartItem(dto.ids);
  }
}
