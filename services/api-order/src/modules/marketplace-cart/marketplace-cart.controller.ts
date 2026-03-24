import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MarketplaceCartService } from './marketplace-cart.service';
import { AuthCenterGuard } from '@/auth/jwt-auth.guard';
import { GetCartQueryDto } from '@/modules/cart-public/dto/get-cart-query.dto';

import { DeleteCartItemsDto } from './dto/get-carts-query.dto';
import { CartItemDto } from '@/modules/cart-public/dto/cart-item.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiTags } from '@nestjs/swagger';

@Controller('marketplace-cart')
@ApiTags('Marketplace Cart')
export class MarketplaceCartController {
  constructor(
    private readonly marketplaceCartService: MarketplaceCartService,
  ) {}

  @UseGuards(AuthCenterGuard)
  @Get('count')
  showCount(): Promise<{ data: number }> {
    return this.marketplaceCartService.getCount();
  }

  @UseGuards(AuthCenterGuard)
  @Get('carts')
  getCart(@Query() query: GetCartQueryDto) {
    return this.marketplaceCartService.getCarts(query);
  }

  @UseGuards(AuthCenterGuard)
  @Put('cart-item/:cartItemId')
  getCartItemList(
    @Request() req,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: CartItemDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.marketplaceCartService.updateCartItem({
      id: +cartItemId,
      dto,
      userId: req.user.userId,
      i18n,
    });
  }

  @UseGuards(AuthCenterGuard)
  @Post('cart-item/batch-delete')
  deleteCartItems(
    @Body() { ids }: DeleteCartItemsDto,
  ): Promise<{ data: { deletedIds: number[] } }> {
    return this.marketplaceCartService.deleteCartItems(ids);
  }
}
