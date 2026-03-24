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

import { Product } from './product.entity';
import { Country } from './country.entity';
import { MerchantProduct } from './merchant-product.entity';
import { ProductVariantAttribute } from './product-variant-attribute.entity';
import { ProductVariantCategory } from './product-variant-category.entity';
import { ProductVariantCode } from './product-variant-code.entity';
import { ProductVariantDimension } from './product-variant-dimension.entity';
import { ProductVariantDocument } from './product-variant-document.entity';
import { ProductVariantImage } from './product-variant-image.entity';
import { ProductVariantTag } from './product-variant-tag.entity';

export enum ProductVariantProductStatus {
  DRAFT = 'Draft',
  WAITING_FOR_APPROVAL = 'WaitingForApproval',
  WAITING_FOR_PRIC = 'WaitingForPric',
  ACTIVE = 'Active',
  HIDDEN = 'Hidden',
  INACTIVE = 'Inactive',
  OUT_OF_STOCK = 'OutOfStock',
  PENDING = 'Pending',
}

export enum ProductVariantStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index(['countryId'])
@Index(['productStatus'])
@Index(['status'])
@Index(['productId'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductVariant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 128 })
  alias: string;

  @Column({ nullable: true, length: 128 })
  sku: string;

  @Column({ nullable: true, length: 128 })
  d365Sku: string;

  @Column({ nullable: true, length: 128 })
  d365ItemCode: string;

  @Column({ nullable: true, length: 128 })
  barcode: string;

  @Column({ nullable: true, length: 128 })
  internalBarcode: string;

  @Column({ nullable: true, length: 128 })
  d365Barcode: string;

  @Column({ nullable: true, length: 128 })
  internalBarcodD356: string;

  @Column({ nullable: true, length: 128 })
  salesUnit: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'text' })
  howToUseText: string;

  @Column({ nullable: true, type: 'text' })
  suggestionText: string;

  @Column({ nullable: true, type: 'text' })
  cautionText: string;

  @Column({ nullable: true, length: 500 })
  urlVideo: string;

  @Column({ nullable: true, length: 200 })
  series: string;

  @Column({ nullable: true, length: 100 })
  model: string;

  @Column({ nullable: true, length: 50 })
  material: string;

  @Column({ nullable: true, length: 100 })
  tIS: string;

  @Column({ nullable: true, length: 50 })
  guarantee: string;

  @Column({ nullable: true, length: 500 })
  detailGuarantee: string;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  packageWidth: number;

  @Column({ nullable: true, type: 'text' })
  packageWidthUnit: string;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  packageHeight: number;

  @Column({ nullable: true, type: 'text' })
  packageHeightUnit: string;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  packageDepth: number;

  @Column({ nullable: true, type: 'text' })
  packageDepthUnit: string;

  @Column({ nullable: true, type: 'text' })
  packageShape: string;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  productWidth: number;

  @Column({ nullable: true, type: 'text' })
  productWidthUnit: string;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  productHeight: number;

  @Column({ nullable: true, type: 'text' })
  productHeightUnit: string;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  productDepth: number;

  @Column({ nullable: true, type: 'text' })
  productDepthUnit: string;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  grossWeight: number;

  @Column({ nullable: true, type: 'text' })
  grossWeightUnit: string;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  netWeight: number;

  @Column({ nullable: true, type: 'text' })
  netWeightUnit: string;

  @Column({
    type: 'enum',
    enum: ProductVariantProductStatus,
    default: ProductVariantProductStatus.DRAFT,
  })
  productStatus: ProductVariantProductStatus;

  @Column({
    type: 'enum',
    enum: ProductVariantStatus,
    default: ProductVariantStatus.ACTIVE,
  })
  status: ProductVariantStatus;

  @Column({ nullable: true })
  productId: number;

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

  @ManyToOne(() => Product, (product) => product.productVariants)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Country, (country) => country.productVariants)
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @OneToMany(
    () => MerchantProduct,
    (merchantProducts) => merchantProducts.productVariant,
  )
  merchantProducts: MerchantProduct[];

  @OneToMany(
    () => ProductVariantAttribute,
    (productVariantAttributes) => productVariantAttributes.productVariant,
  )
  productVariantAttributes: ProductVariantAttribute[];

  @OneToMany(
    () => ProductVariantCategory,
    (productVariantCategories) => productVariantCategories.productVariant,
  )
  productVariantCategories: ProductVariantCategory[];

  @OneToMany(
    () => ProductVariantCode,
    (productVariantCodes) => productVariantCodes.productVariant,
  )
  productVariantCodes: ProductVariantCode[];

  @OneToMany(
    () => ProductVariantDimension,
    (productVariantDimensions) => productVariantDimensions.productVariant,
  )
  productVariantDimensions: ProductVariantDimension[];

  @OneToMany(
    () => ProductVariantDocument,
    (productVariantDocuments) => productVariantDocuments.productVariant,
  )
  productVariantDocuments: ProductVariantDocument[];

  @OneToMany(
    () => ProductVariantImage,
    (productVariantImages) => productVariantImages.productVariant,
  )
  productVariantImages: ProductVariantImage[];

  @OneToMany(
    () => ProductVariantTag,
    (productVariantTags) => productVariantTags.productVariant,
  )
  productVariantTags: ProductVariantTag[];

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

