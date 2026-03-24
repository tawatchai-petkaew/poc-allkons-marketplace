import { IsOptional } from 'class-validator';

import { Cart } from '../../../model/cart.entity';
import { CartItem } from '../../../model/cart-item.entity';
import { ProductItem } from '../../../model/product-item.entity';
import { MerchantProduct } from '@/model/merchant-product.entity';

export class CartItemDto implements Readonly<CartItemDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  quantity: number;

  @IsOptional()
  unit: string;

  @IsOptional()
  cart: Cart;

  @IsOptional()
  productItem: ProductItem;

  @IsOptional()
  productItemId: number;

  @IsOptional()
  merchantProduct: MerchantProduct;

  @IsOptional()
  merchantProductId: number;

  public static from(dto: Partial<CartItemDto>) {
    const it = new CartItem();
    it.id = dto.id;
    it.quantity = dto.quantity;
    it.unit = dto.unit;
    it.cart = dto.cart;
    it.productItem = dto.productItem;
    it.merchantProduct = dto.merchantProduct;

    return {
      ...it,
    };
  }

  public static fromEntity(entity: CartItem) {
    return this.from({
      id: entity.id,
      quantity: entity.quantity,
      unit: entity.unit,
      productItem: entity.productItem,
      cart: entity.cart,
      merchantProduct: entity.merchantProduct,
      merchantProductId: entity.merchantProduct?.id, // Map ID for convenience
    });
  }

  public static toEntity(dto: Partial<CartItemDto>) {
    const it = new CartItem();
    it.quantity = dto.quantity;
    it.unit = dto.unit;
    it.cart = dto.cart;
    it.productItem = dto.productItem;

    if (dto.merchantProductId) {
      const ref = new MerchantProduct();
      ref.id = dto.merchantProductId;
      it.merchantProduct = ref;
    } else {
      it.merchantProduct = dto.merchantProduct;
    }

    return it;
  }
}
