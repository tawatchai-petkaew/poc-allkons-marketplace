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
  OneToMany
} from 'typeorm';

import { ProductFlashSale } from './product-flash-sale.entity';
import { OrderItem } from './order-item.entity';
import { ProductItem } from './product-item.entity';

@Entity()
export class ProductFlashSaleItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true, type: 'float' })
  price: number;

  @Column({ nullable: true, type: 'float' })
  bigUnitPrice: number;

  @Column({ nullable: false, default: 0 })
  soldQuantity: number;

  @Column({ nullable: false, default: 0 })
  bigUnitSoldQuantity: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => ProductFlashSale,
    (productFlashSale) => productFlashSale.productFlashSaleItems
  )
  productFlashSale: ProductFlashSale;

  @ManyToOne(
    () => ProductItem,
    (productItem) => productItem.productFlashSaleItems
  )
  productItem: ProductItem;

  @OneToMany(() => OrderItem, (orderItems) => orderItems.productFlashSaleItem)
  orderItems: OrderItem[];

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
