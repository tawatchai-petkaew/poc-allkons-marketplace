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

import { Country } from './country.entity';
import { Product } from './product.entity';
import { MerchantProduct } from './merchant-product.entity';
import { ProductVariantAttribute } from './product-variant-attribute.entity';
import { ProductVariantCategory } from './product-variant-category.entity';
import { ProductVariantCode } from './product-variant-code.entity';
import { ProductVariantDocument } from './product-variant-document.entity';
import { ProductVariantDimension } from './product-variant-dimension.entity';
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
@Index('iX_product_variant_countryId', ['countryId'])
@Index('iX_product_variant_productStatus', ['productStatus'])
@Index('iX_product_variant_status', ['status'])
@Index('iX_product_variant_productId', ['productId'])
@Index('iX_product_variant_createdAt', ['createdAt'])
@Index('iX_product_variant_updatedAt', ['updatedAt'])
export class ProductVariant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 128, nullable: true })
  alias: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  sku: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  d365Sku: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  d365ItemCode: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  barcode: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  internalBarcode: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  d365Barcode: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  internalBarcodD356: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  salesUnit: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  howToUseText: string;

  @Column({ type: 'text', nullable: true })
  suggestionText: string;

  @Column({ type: 'text', nullable: true })
  cautionText: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  urlVideo: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  series: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  material: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tIS: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  guarantee: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  detailGuarantee: string;

  @Column({ nullable: true })
  countryId: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  packageWidth: number;

  @Column({ type: 'text', nullable: true })
  packageWidthUnit: string;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  packageHeight: number;

  @Column({ type: 'text', nullable: true })
  packageHeightUnit: string;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  packageDepth: number;

  @Column({ type: 'text', nullable: true })
  packageDepthUnit: string;

  @Column({ type: 'text', nullable: true })
  packageShape: string;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  productWidth: number;

  @Column({ type: 'text', nullable: true })
  productWidthUnit: string;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  productHeight: number;

  @Column({ type: 'text', nullable: true })
  productHeightUnit: string;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  productDepth: number;

  @Column({ type: 'text', nullable: true })
  productDepthUnit: string;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  grossWeight: number;

  @Column({ type: 'text', nullable: true })
  grossWeightUnit: string;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  netWeight: number;

  @Column({ type: 'text', nullable: true })
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

  @Column({ type: 'varchar', length: 256, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  updatedBy: string;

  @Column({ type: 'varchar', length: 128, nullable: true, name: 'skuUUID' })
  skuUuid: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @ManyToOne(() => Product, (product) => product.productVariants, {
    nullable: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

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
