import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
} from 'typeorm';

import { OrderItem } from './order-item.entity';
import { ImageUpload } from './image-upload.entity';
import { Product } from './product.entity';
import { ProductDiscount } from './product-discount.entity';
import { Stock } from './stock.entity';
import { CartItem } from './cart-item.entity';
import { ProductFlashSaleItem } from './product-flash-sale-item.entity';

@Entity()
@Index('idx_product_item_product', ['product'])
@Index('idx_product_item_discount', ['productDiscount'])
export class ProductItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  primaryOptionsValue: string;

  @Column({ nullable: true })
  secondaryOptionsValue: string;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  price: number;

  @Column({ nullable: true, type: 'float' })
  bigUnitPrice: number;

  @Column({ nullable: true, type: 'float', default: 0.0 })
  cost: number;

  @Column({ nullable: false, default: 0 })
  soldQuantity: number;

  @Column({ nullable: true })
  productItemIdTikTok: string;

  @Column({ nullable: true })
  productItemIdLazada: string;

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

  @OneToMany(() => OrderItem, (orderItems) => orderItems.productItem)
  orderItems: OrderItem[];

  @OneToMany(
    () => ProductFlashSaleItem,
    (productFlashSaleItems) => productFlashSaleItems.productItem,
  )
  productFlashSaleItems: ProductFlashSaleItem[];

  @OneToMany(() => CartItem, (cartItems) => cartItems.productItem)
  cartItems: CartItem[];

  @ManyToOne(() => ImageUpload, (imageUpload) => imageUpload.productItems)
  imageUpload: ImageUpload;

  @ManyToOne(() => Product, (product) => product.productItems)
  product: Product;

  @OneToOne(() => Stock, (stock) => stock.productItem)
  stock: Stock;

  @OneToOne(() => ProductDiscount)
  @JoinColumn()
  productDiscount: ProductDiscount;

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
