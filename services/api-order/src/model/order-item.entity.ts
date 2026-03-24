import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';

import { Order } from './order.entity';
import { ProductFlashSale } from './product-flash-sale.entity';
import { ProductFlashSaleItem } from './product-flash-sale-item.entity';
import { ProductItem } from './product-item.entity';
import { SubOrder } from './sub-order.entity';

export enum OrderItemType {
  PRODUCT = 'product',
  VOUCHER = 'voucher',
}

@Entity()
@Index('idx_order_item_subOrderId', ['subOrderId'])
@Index('idx_order_item_orderId', ['orderId'])
@Index('idx_order_item_productItemId', ['productItemId'])
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  unit: string;

  @Column({ nullable: true })
  smallUnitQuantity: number;

  @Column({ nullable: true })
  bigUnitQuantity: number;

  @Column({ nullable: false, default: 0, type: 'float' })
  price: number;

  @ManyToOne(() => ProductItem, (productItem) => productItem.orderItems)
  productItem: ProductItem;

  @Column({ nullable: true })
  productItemId: number;

  @ManyToOne(
    () => ProductFlashSaleItem,
    (productFlashSaleItem) => productFlashSaleItem.orderItems,
  )
  productFlashSaleItem: ProductFlashSaleItem;

  @Column({ nullable: true })
  productItemSlug: string;

  @Column({ nullable: true })
  productItemName: string;

  @Column({ nullable: true })
  productItemImageUrl: string;

  @Column({ nullable: true })
  isBigUnit: boolean;

  @Column({ nullable: true })
  onFlashSale: boolean;

  @Column({ nullable: true })
  onFlashSaleName: string;

  @Column({
    type: 'enum',
    enum: OrderItemType,
    default: OrderItemType.PRODUCT,
  })
  orderItemType: OrderItemType;

  @Column({ nullable: true })
  voucherQuantity: number;

  @Column({ nullable: true })
  voucherExpiredDays: number;

  @Column({ nullable: true })
  voucherUsedPerUser: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;

  @Column({ nullable: true })
  orderId: number;

  @ManyToOne(() => SubOrder, (subOrder) => subOrder.orderItems)
  subOrder: Order;

  @Column({ nullable: true })
  subOrderId: number;

  @ManyToOne(
    () => ProductFlashSale,
    (productFlashSale) => productFlashSale.orderItems,
  )
  productFlashSale: ProductFlashSale;

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
