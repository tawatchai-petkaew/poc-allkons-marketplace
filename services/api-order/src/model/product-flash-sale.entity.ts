import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';

import { FlashSale } from './flash-sale.entity';
import { OrderItem } from './order-item.entity';
import { ProductFlashSaleItem } from './product-flash-sale-item.entity';
import { Product } from './product.entity';

@Entity()
export class ProductFlashSale extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.productFlashSales)
  product: Product;

  @ManyToOne(() => FlashSale, (flashSale) => flashSale.productFlashSales)
  flashSale: FlashSale;

  @OneToMany(() => OrderItem, (orderItems) => orderItems.productFlashSale)
  orderItems: OrderItem[];

  @OneToMany(
    () => ProductFlashSaleItem,
    (productFlashSaleItems) => productFlashSaleItems.productFlashSale,
  )
  productFlashSaleItems: ProductFlashSaleItem[];

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

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
