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
  OneToOne,
  Index,
  JoinColumn,
} from 'typeorm';

import { Article } from './article.entity';
import { BannerMerchantApplication } from './banner-merchant-application.entity';
import { BannerMerchantDesktop } from './banner-merchant-desktop.entity';
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
  URL = 'url',
}

@Entity()
@Index('IDX_banner_merchant_merchant_id', ['merchantId'])
export class BannerMerchant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BannerMerchantType,
    nullable: true,
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

  @Column({ nullable: true })
  merchantId: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => Merchant, (merchant) => merchant.bannerMerchants)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => Product, (product) => product.bannerMerchants)
  product: Product;

  @ManyToOne(
    () => ProductCategory,
    (productCategory) => productCategory.bannerMerchants,
  )
  productCategory: ProductCategory;

  @ManyToOne(() => ProductBrand, (productBrand) => productBrand.bannerMerchants)
  productBrand: ProductBrand;

  @ManyToOne(
    () => ProductCatalog,
    (productCatalog) => productCatalog.bannerMerchants,
  )
  productCatalog: ProductCatalog;

  @ManyToOne(() => Article, (article) => article.bannerMerchants)
  article: Article;

  @OneToOne(
    () => BannerMerchantDesktop,
    (bannerMerchantDesktop) => bannerMerchantDesktop.bannerMerchant,
  )
  bannerMerchantDesktop: BannerMerchantDesktop;

  @OneToOne(
    () => BannerMerchantApplication,
    (bannerMerchantApplication) => bannerMerchantApplication.bannerMerchant,
  )
  bannerMerchantApplication: BannerMerchantApplication;

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
