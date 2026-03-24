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
  OneToMany,
} from 'typeorm';
import { Article } from './article.entity';

import { BannerMerchantApplication } from './banner-merchant-application.entity';
import { BannerMerchantDesktop } from './banner-merchant-desktop.entity';
import { BannerPromotion } from './banner-promotion.entity';
import { Customer } from './customer.entity';
import { ImageUploadFolder } from './image-upload-folder.entity';
import { Invoice } from './invoice.entity';
import { MerchantIcon } from './merchant-icon.entity';
import { MerchantLogo } from './merchant-logo.entity';
import { ProductBrand } from './product-brand.entity';
import { ProductCategory } from './product-category.entity';
import { ProductCatalog } from './product-catalog.entity';
import { ProductImage } from './product-image.entity';
import { ProductItem } from './product-item.entity';
import { User } from './user.entity';

@Entity()
export class ImageUpload extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  imageName: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  size: string;

  @Column()
  url: string;

  @Column({ default: false })
  onDeletePermanent: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => ImageUploadFolder,
    (imageUploadFolder) => imageUploadFolder.imageUploads,
  )
  imageUploadFolder: ImageUploadFolder;

  @OneToMany(() => ProductImage, (productImage) => productImage.imageUpload)
  productImages: ProductImage[];

  @OneToMany(() => ProductBrand, (productBrands) => productBrands.imageUpload)
  productBrands: ProductBrand[];

  @OneToMany(
    () => ProductCatalog,
    (productCatalogs) => productCatalogs.imageUpload,
  )
  productCatalogs: ProductCatalog[];

  @OneToMany(
    () => ProductCategory,
    (productCategories) => productCategories.imageUpload,
  )
  productCategories: ProductCategory[];

  @OneToMany(() => MerchantLogo, (merchantLogos) => merchantLogos.imageUpload)
  merchantLogos: MerchantLogo[];

  @OneToMany(() => MerchantIcon, (merchantIcons) => merchantIcons.imageUpload)
  merchantIcons: MerchantIcon[];

  @OneToMany(
    () => BannerPromotion,
    (bannerPromotions) => bannerPromotions.imageUpload,
  )
  bannerPromotions: BannerPromotion[];

  @OneToMany(
    () => BannerMerchantDesktop,
    (bannerMerchantDesktops) => bannerMerchantDesktops.imageUpload,
  )
  bannerMerchantDesktops: BannerMerchantDesktop[];

  @OneToMany(
    () => BannerMerchantApplication,
    (bannerMerchantApplications) => bannerMerchantApplications.imageUpload,
  )
  bannerMerchantApplications: BannerMerchantApplication[];

  @OneToMany(() => ProductItem, (productItems) => productItems.imageUpload)
  productItems: ProductItem[];

  @OneToMany(() => Article, (articles) => articles.imageUpload)
  articles: Article[];

  @OneToMany(() => Invoice, (invoices) => invoices.imageUpload)
  invoices: Invoice[];

  @OneToMany(() => User, (users) => users.imageUpload)
  users: User[];

  @OneToMany(() => Customer, (customers) => customers.imageUpload)
  customers: Customer[];

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

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
