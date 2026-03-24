import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

import { BannerMerchant } from './banner-merchant.entity';
import { BannerPromotion } from './banner-promotion.entity';
import { ImageUpload } from './image-upload.entity';
import { Merchant } from './merchant.entity';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { ProductCategoryTranslation } from './product-category-translation.entity';

export enum ProductCategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive',
}

@Entity()
@Index(['path'])
@Index('idx_get_product_category', ['merchant', 'status', 'order'], {
  where: "status = 'active'",
})
@Index('IDX_product_category_merchant_id', ['merchantId'])
@Index('IDX_product_category_status', ['status'])
@Index('IDX_product_category_order', ['order'])
export class ProductCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order: number;

  @Column({
    type: 'enum',
    enum: ProductCategoryStatus,
    default: ProductCategoryStatus.ACTIVE,
  })
  status: ProductCategoryStatus;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  path: string;

  @Column({ type: 'varchar', nullable: true })
  skuId: string;

  @Column({ nullable: true })
  merchantId: number;

  // New columns from migration
  @Column({ nullable: true })
  productId: number;

  @Column({ nullable: true })
  categoryId: number;

  @Column({ nullable: true, length: 256 })
  createdBy: string;

  @Column({ nullable: true, length: 256 })
  updatedBy: string;

  @OneToMany(() => Product, (products) => products.productCategory)
  products: Product[];

  @ManyToOne(() => Product, (product) => product.productCategories)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Category, (category) => category.productCategories)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(
    () => ProductCategoryTranslation,
    (productCategoryTranslations) =>
      productCategoryTranslations.productCategory,
  )
  productCategoryTranslations: ProductCategoryTranslation[];

  @OneToMany(
    () => BannerMerchant,
    (bannerMerchants) => bannerMerchants.productCategory,
  )
  bannerMerchants: BannerMerchant[];

  @OneToMany(
    () => BannerPromotion,
    (bannerPromotions) => bannerPromotions.productCategory,
  )
  bannerPromotions: BannerPromotion[];

  @ManyToOne(() => Merchant, (merchant) => merchant.imageUploadFolders)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => ImageUpload, (imageUpload) => imageUpload.productBrands)
  imageUpload: ImageUpload;

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
