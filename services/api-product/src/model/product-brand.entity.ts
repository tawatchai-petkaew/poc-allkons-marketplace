import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne
} from 'typeorm';

import { Product } from './product.entity';
import { ImageUpload } from './image-upload.entity';
import { Merchant } from './merchant.entity';
import { ProductBrandTranslation } from './product-brand-translation.entity';
import { BannerMerchant } from './banner-merchant.entity';
import { BannerPromotion } from './banner-promotion.entity';

export enum ProductBransStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive'
}

@Entity()
export class ProductBrand extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order: number;

  @Column({ default: false })
  isNoBrand: boolean;

  @Column({
    type: 'enum',
    enum: ProductBransStatus,
    default: ProductBransStatus.ACTIVE
  })
  status: ProductBransStatus;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @OneToMany(() => Product, (products) => products.productBrand)
  products: Product[];

  @OneToMany(
    () => ProductBrandTranslation,
    (productBrandTranslations) => productBrandTranslations.productBrand
  )
  productBrandTranslations: ProductBrandTranslation[];

  @OneToMany(
    () => BannerMerchant,
    (bannerMerchants) => bannerMerchants.productBrand
  )
  bannerMerchants: BannerMerchant[];

  @OneToMany(
    () => BannerPromotion,
    (bannerPromotions) => bannerPromotions.productBrand
  )
  bannerPromotions: BannerPromotion[];

  @ManyToOne(() => Merchant, (merchant) => merchant.imageUploadFolders)
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
