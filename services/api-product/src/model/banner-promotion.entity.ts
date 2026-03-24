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
  Index,
  JoinColumn
} from 'typeorm';

import { Article } from './article.entity';
import { ImageUpload } from './image-upload.entity';
import { Merchant } from './merchant.entity';
import { ProductBrand } from './product-brand.entity';
import { ProductCategory } from './product-category.entity';
import { ProductCatalog } from './product-catalog.entity';
import { Product } from './product.entity';

export enum BannerMerchantType {
  NON_LINK = 'nonLink',
  BLOG = 'article',
  PRODUCT = 'product',
  PRODUCT_CATEGORY = 'productCategory',
  PRODUCT_BRAND = 'productBrand',
  PRODUCT_CATALOG = 'productCatalog',
  URL = 'url'
}

@Entity()
@Index('IDX_banner_promotion_merchant_id', ['merchantId'])
export class BannerPromotion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BannerMerchantType,
    nullable: true
  })
  type: BannerMerchantType;

  @Column({ nullable: true })
  isOpenNewWindow: boolean;

  @Column({ nullable: true })
  url: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @Column({ nullable: true })
  merchantId: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.bannerPromotions)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => Product, (product) => product.bannerPromotions)
  product: Product;

  @ManyToOne(
    () => ProductCategory,
    (productCategory) => productCategory.bannerPromotions
  )
  productCategory: ProductCategory;

  @ManyToOne(
    () => ProductBrand,
    (productBrand) => productBrand.bannerPromotions
  )
  productBrand: ProductBrand;

  @ManyToOne(
    () => ProductCatalog,
    (productCatalog) => productCatalog.bannerMerchants
  )
  productCatalog: ProductCatalog;

  @ManyToOne(() => ImageUpload, (imageUpload) => imageUpload.bannerPromotions)
  imageUpload: ImageUpload;

  @ManyToOne(() => Article, (article) => article.bannerPromotions)
  article: Article;

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
