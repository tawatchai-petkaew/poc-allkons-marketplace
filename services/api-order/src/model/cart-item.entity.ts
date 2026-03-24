import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Cart } from './cart.entity';
import { ProductItem } from './product-item.entity';
import { MerchantProduct } from './merchant-product.entity';

@Entity()
@Index('idx_cart_count', ['cart'])
@Index('idx_cart_created_at', ['createdAt'])
export class CartItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  unit: string;

  @Column({ name: 'merchantProductId', nullable: true })
  merchantProductId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  cart: Cart;

  @ManyToOne(() => ProductItem, (productItem) => productItem.cartItems)
  productItem: ProductItem;

  @ManyToOne(
    () => MerchantProduct,
    (merchantProduct) => merchantProduct.cartItems,
  )
  @JoinColumn({ name: 'merchantProductId' })
  merchantProduct: MerchantProduct;

  @BeforeInsert()
  createdAtWithTimezone() {
    const currentDate = new Date();
    this.createdAt = new Date(currentDate.getTime());
    this.updatedAt = new Date(currentDate.getTime());
  }

  @BeforeUpdate()
  updatedAtWithTimezone() {
    const currentDate = new Date();
    this.updatedAt = new Date(currentDate.getTime());
  }
}
