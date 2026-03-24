import { IsNotEmpty, IsOptional } from 'class-validator';

import { Merchant } from '../../../model/merchant.entity';
import { Cart } from '../../../model/cart.entity';
import { Customer } from '../../../model/customer.entity';
import { CartItem } from '../../../model/cart-item.entity';

export class CartDto implements Readonly<CartDto> {
  @IsNotEmpty()
  id: number;

  @IsOptional()
  merchant: Merchant;

  @IsOptional()
  customer: Customer;

  @IsOptional()
  cartItems: CartItem[];

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

  public static fromEntity(entity: any) {
    return this.from({
      id: entity.id,
      customer: entity.customer,
      cartItems: entity.cartItems,
      merchant: entity.merchant,
    });
  }
}
