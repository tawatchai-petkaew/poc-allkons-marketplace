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
@Index(['imageUploadId'])
@Index(['merchantId'])
@Index(['storeProductId'])
@Index(['productVariantId'])
@Index(['productTypeId'])
@Index(['merchantProductStatus'])
@Index(['status'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class MerchantProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 256 })
  merchantCustomName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  imageUploadId: number;

  @Column({ nullable: true, length: 255 })
  thumbnail: string;

  @Column()
  merchantId: number;

  @Column()
  storeProductId: number;

  @Column({ nullable: true })
  productVariantId: number;

  @Column({ nullable: true, type: 'int' })
  quantity: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  price: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  specialPrice: number;

  @Column({ nullable: true, type: 'timestamp' })
  startDate: Date;

  @Column({ nullable: true, type: 'timestamp' })
  endDate: Date;

  @Column()
  isAcceptCash: boolean;

  @Column()
  isAcceptCredit: boolean;

  @Column()
  isAcceptPledge: boolean;

  @Column()
  isAcceptCod: boolean;

  @Column()
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

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 4 })
  priceVat: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 4 })
  priceExcludeVat: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 4 })
  priceVatPercent: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 4 })
  priceIncludeVat: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 4 })
  specialPriceVat: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 4 })
  specialPriceIncludeVat: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 4 })
  specialPriceExcludeVat: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 4 })
  specialPriceVatPercent: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, length: 256 })
  createdBy: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, length: 256 })
  updatedBy: string;

  @ManyToOne(() => ImageUpload, (imageUpload) => imageUpload.merchantProducts)
  @JoinColumn({ name: 'imageUploadId' })
  imageUpload: ImageUpload;

  @ManyToOne(() => Merchant, (merchant) => merchant.merchantProducts)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.merchantProducts,
  )
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(() => MasterData, (masterData) => masterData.merchantProducts)
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
