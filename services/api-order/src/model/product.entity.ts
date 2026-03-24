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
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BannerMerchant } from './banner-merchant.entity';
import { BannerPromotion } from './banner-promotion.entity';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { Merchant } from './merchant.entity';
import { ProductBrand } from './product-brand.entity';
import { ProductFlashSale } from './product-flash-sale.entity';
import { ProductImage } from './product-image.entity';
import { ProductItem } from './product-item.entity';
import { ProductProductCatalog } from './product-product-catalog.entity';
import { ProductTranslation } from './product-translation.entity';
import { ProductDimension } from './product-dimension.entity';
import { ProductTag } from './product-tag.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductVariantCategory } from './product-variant-category.entity';
import { ProductCategory } from './product-category.entity';

export enum ProductStatus {
  AVAILABLE = 'available',
  DRAFT = 'draft',
  SOON = 'soon',
  DISCONTINUED = 'discontinued',
}

export enum ProductRelationStatus {
  ON_CATEGORY = 'onCategory',
  ALL_CATEGORY = 'allCategory',
  CUSTOM = 'custom',
}

export enum ProductKind {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  SET = 'set',
  SERVICE = 'service',
}

export enum status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

export enum ProductStatusLegacy {
  DRAFT = 'Draft',
  WAITING_FOR_APPROVAL = 'WaitingForApproval',
  WAITING_FOR_PRIC = 'WaitingForPric',
  ACTIVE = 'Active',
  HIDDEN = 'Hidden',
  INACTIVE = 'Inactive',
  OUT_OF_STOCK = 'OutOfStock',
  PENDING = 'Pending',
}

@Entity()
@Index(['slug', 'merchant'])
@Index('idx_get_new_product', ['merchant', 'type', 'isNew', 'createdAt'], {
  where: '"isNew" = true AND "type" = \'available\'',
})
@Index('idx_get_product_by_slug', ['merchant', 'slug'])
@Index('idx_relation_products', ['merchant', 'productCategory'])
// Performance optimization indexes
@Index('idx_product_merchant_type', ['merchant', 'type'])
@Index('idx_product_sold_quantity', ['soldQuantity'])
@Index('idx_product_is_recommend', ['isRecommend', 'soldQuantity'])
@Index('idx_product_is_popular', ['isPopular', 'soldQuantity'])
@Index('idx_product_created_at', ['createdAt'])
@Index('idx_product_category_id', ['productCategory'])
@Index('idx_product_brand_id', ['productBrand'])
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  slug: string;

  @Column({ default: 0, type: 'float' })
  minFinalProductPrice: number;

  @Column({ default: 0, type: 'float' })
  maxFinalProductPrice: number;

  @Column({ nullable: true })
  barCode: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  piecePerBigUnit: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  weightSize: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  widthSize: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  lengthSize: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  heightSize: number;

  @Column({ nullable: false, default: 0 })
  soldQuantity: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  type: ProductStatus;

  @Column({
    type: 'enum',
    enum: ProductKind,
    nullable: true,
  })
  kind: ProductKind;

  @Column({ nullable: true })
  isRecommend: boolean;

  @Column({ nullable: true })
  isPopular: boolean;

  @Column({ nullable: true })
  isNew: boolean;

  @Column({ default: false })
  isPackage: boolean;

  @Column({
    type: 'enum',
    enum: ProductRelationStatus,
    default: ProductRelationStatus.ON_CATEGORY,
  })
  relationStatus: ProductRelationStatus;

  @Column('text', { array: true, nullable: true })
  valueCustomRelationStatus: string[];

  @Column({ default: false })
  isContactOnly: boolean;

  @Column({ default: false })
  isHideProductPrice: boolean;

  @Column({ nullable: true })
  telContact: string;

  @Column({ nullable: true })
  emailContact: string;

  @Column({ nullable: true })
  lineContact: string;

  @Column({ nullable: true })
  facebookContact: string;

  @Column({ nullable: true })
  instagramContact: string;

  @Column({ nullable: true })
  urlGoogleMap: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 4096, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  d365Sku: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  d365ItemCode: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  skuUUID: string;

  @Column({
    type: 'enum',
    enum: status,
    nullable: true,
    default: status.ACTIVE,
  })
  status: status;

  @Column({ nullable: true })
  productTM: boolean;

  @Column({
    type: 'enum',
    enum: ProductStatusLegacy,
    nullable: true,
    default: ProductStatusLegacy.DRAFT,
  })
  productStatus: ProductStatusLegacy;

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

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @Column({ nullable: true })
  productCategoryId: number;

  @Column({ nullable: true })
  brandId: number;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(
    () => ProductCategory,
    (productCategory) => productCategory.products,
  )
  @JoinColumn({ name: 'productCategoryId' })
  productCategory: ProductCategory;

  @ManyToOne(() => ProductBrand, (productBrand) => productBrand.products)
  productBrand: ProductBrand;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Index()
  @ManyToOne(() => Merchant, (merchant) => merchant.products)
  merchant: Merchant;

  @OneToMany(
    () => ProductTranslation,
    (productTranslations) => productTranslations.product,
  )
  productTranslations: ProductTranslation[];

  @OneToMany(() => ProductItem, (productItems) => productItems.product)
  productItems: ProductItem[];

  @OneToMany(() => ProductImage, (productImages) => productImages.product)
  productImages: ProductImage[];

  @OneToMany(() => BannerMerchant, (bannerMerchants) => bannerMerchants.product)
  bannerMerchants: BannerMerchant[];

  @OneToMany(
    () => BannerPromotion,
    (bannerPromotions) => bannerPromotions.product,
  )
  bannerPromotions: BannerPromotion[];

  @OneToMany(
    () => ProductFlashSale,
    (productFlashSales) => productFlashSales.product,
  )
  productFlashSales: ProductFlashSale[];

  @OneToMany(
    () => ProductProductCatalog,
    (ProductProductCatalog) => ProductProductCatalog.product,
  )
  productProductCatalogs: ProductProductCatalog[];

  @OneToMany(
    () => ProductDimension,
    (productDimensions) => productDimensions.product,
  )
  productDimensions: ProductDimension[];

  @OneToMany(() => ProductTag, (productTags) => productTags.product)
  productTags: ProductTag[];

  @OneToMany(() => ProductVariant, (productVariants) => productVariants.product)
  productVariants: ProductVariant[];

  @OneToMany(
    () => ProductVariantCategory,
    (productVariantCategories) => productVariantCategories.product,
  )
  productVariantCategories: ProductVariantCategory[];

  @OneToMany(
    () => ProductCategory,
    (productCategories) => productCategories.product,
  )
  productCategories: ProductCategory[];

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
