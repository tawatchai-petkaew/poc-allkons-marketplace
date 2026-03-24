import { IsNotEmpty, IsOptional } from 'class-validator';

import { Merchant } from '../../../model/merchant.entity';
import { Cart } from '../../../model/cart.entity';
import { Customer } from '../../../model/customer.entity';
import { CartItem } from '../../../model/cart-item.entity';

import { CartDto } from './cart.dto';
import { CartItemDto } from './cart-item.dto';

export class UpdateCartDto implements Readonly<UpdateCartDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  merchant: Merchant;

  @IsOptional()
  customer: Customer;

  @IsOptional()
  cartItems: CartItem[];

  @IsOptional()
  cartItemAttributes: CartItemDto[];

  public static from(dto: Partial<CartDto>) {
    const it = new Cart();
    it.id = dto.id;
    it.customer = dto.customer;
    it.cartItems = dto.cartItems;
    it.merchant = dto.merchant;

    return {
      ...it,
    };
  }

  public static fromEntity(entity: Cart) {
    return this.from({
      id: entity.id,
      customer: entity.customer,
      cartItems: entity.cartItems,
      merchant: entity.merchant,
    });
  }

  public static toEntity(dto: Partial<UpdateCartDto>) {
    const it = new Cart();
    it.customer = dto.customer;
    it.cartItems = dto.cartItems;
    it.merchant = dto.merchant;

    return it;
  }
}
