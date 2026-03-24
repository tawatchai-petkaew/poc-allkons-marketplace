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
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';

import { ImageUpload } from './image-upload.entity';
import { Merchant } from './merchant.entity';
import { BannerMerchant } from './banner-merchant.entity';
import { BannerPromotion } from './banner-promotion.entity';
import { ProductProductCatalog } from './product-product-catalog.entity';

export enum ProductCatalogStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive',
}

export enum ProductCatalogMainStatus {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

@Entity()
@Index('IDX_product_catalog_merchant_id', ['merchantId'])
@Index('IDX_product_catalog_status', ['status'])
@Index('IDX_product_catalog_main_status', ['mainStatus'])
@Index('IDX_product_catalog_name', ['name'])
export class ProductCatalog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ProductCatalogStatus,
    default: ProductCatalogStatus.ACTIVE,
  })
  status: ProductCatalogStatus;

  @Column({
    type: 'enum',
    enum: ProductCatalogMainStatus,
    default: ProductCatalogMainStatus.SECONDARY,
  })
  mainStatus: ProductCatalogMainStatus;

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

  @OneToMany(
    () => ProductProductCatalog,
    (productProductCatalogs) => productProductCatalogs.productCatalog,
  )
  productProductCatalogs: ProductProductCatalog[];
  @OneToMany(
    () => BannerMerchant,
    (bannerMerchants) => bannerMerchants.productCatalog,
  )
  bannerMerchants: BannerMerchant[];

  @OneToMany(
    () => BannerPromotion,
    (bannerPromotions) => bannerPromotions.productCatalog,
  )
  bannerPromotions: BannerPromotion[];

  @ManyToOne(() => Merchant, (merchant) => merchant.imageUploadFolders)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => ImageUpload, (imageUpload) => imageUpload.productCatalogs)
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
