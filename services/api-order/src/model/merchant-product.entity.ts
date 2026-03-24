import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ImageUpload } from './image-upload.entity';
import { Merchant } from './merchant.entity';
import { ProductVariant } from './product-variant.entity';
import { MasterData } from './master-data.entity';
import { CartItem } from './cart-item.entity';

export enum MerchantProductStatus {
  SELLING = 'Selling',
  HIDDEN = 'Hidden',
  OUT_OF_STOCK = 'OutOfStock',
  NOT_APPROVED = 'NotApproved',
}

export enum MerchantProductEntityStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index('iX_merchant_product_imageUploadId', ['imageUploadId'])
@Index('iX_merchant_product_merchantId', ['merchantId'])
@Index('iX_merchant_product_productVariantId', ['productVariantId'])
@Index('iX_merchant_product_productTypeId', ['productTypeId'])
@Index('iX_merchant_product_merchantProductStatus', ['merchantProductStatus'])
@Index('iX_merchant_product_status', ['status'])
@Index('iX_merchant_product_createdAt', ['createdAt'])
@Index('iX_merchant_product_updatedAt', ['updatedAt'])
export class MerchantProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  merchantCustomName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUploadId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string;

  @Column()
  merchantId: number;

  @Column({ nullable: true })
  productVariantId: number;

  @Column({ nullable: true })
  quantity: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ default: false })
  isAcceptCash: boolean;

  @Column({ default: false })
  isAcceptCredit: boolean;

  @Column({ default: false })
  isAcceptPledge: boolean;

  @Column({ default: false })
  isAcceptCod: boolean;

  @Column({ default: false })
  isAcceptCreditCard: boolean;

  @Column({
    type: 'enum',
    enum: MerchantProductStatus,
    default: MerchantProductStatus.SELLING,
  })
  merchantProductStatus: MerchantProductStatus;

  @Column()
  productTypeId: number;

  @Column({
    type: 'enum',
    enum: MerchantProductEntityStatus,
    default: MerchantProductEntityStatus.ACTIVE,
  })
  status: MerchantProductEntityStatus;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  priceVat: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  priceExcludeVat: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  priceVatPercent: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  priceIncludeVat: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  specialPriceVat: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  specialPriceIncludeVat: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  specialPriceExcludeVat: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  specialPriceVatPercent: number;

  @Column({ type: 'int', nullable: true })
  prepareDays: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  updatedBy: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ImageUpload, { nullable: true })
  @JoinColumn({ name: 'imageUploadId' })
  imageUpload: ImageUpload;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(() => MasterData)
  @JoinColumn({ name: 'productTypeId' })
  productType: MasterData;

  @OneToMany(() => CartItem, (cartItem) => cartItem.merchantProduct)
  cartItems: CartItem[];

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
