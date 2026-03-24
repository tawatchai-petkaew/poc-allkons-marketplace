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

import { Article } from './article.entity';
import { BannerMerchant } from './banner-merchant.entity';
import { BannerPromotion } from './banner-promotion.entity';
import { Cart } from './cart.entity';
import { Customer } from './customer.entity';
import { FileUpload } from './file-upload.entity';
import { ImageUploadFolder } from './image-upload-folder.entity';
import { MerchantProduct } from './merchant-product.entity';
import { MerchantCategory } from './merchant-category.entity';
import { MerchantIcon } from './merchant-icon.entity';
import { MerchantLogo } from './merchant-logo.entity';
import { MerchantPdpa } from './merchant-pdpa.entity';
import { MerchantPolicy } from './merchant-policy.entity';
import { MerchantTranslation } from './merchant-translation.entity';
import { Order } from './order.entity';
import { OrganizationContact } from './organization-contact.entity';
import { ProductBrand } from './product-brand.entity';
import { ProductCategory } from './product-category.entity';
import { Product } from './product.entity';
import { Store } from './store.entity';
import { UserAddress } from './user-address.entity';
import { UserMerchant } from './user-merchant.entity';
import { Organization } from './organiztion.entity';

export enum MerchantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive',
}

export enum MerchantCustomerStatus {
  VISITOR = 'VISITOR',
  CUSTOMER = 'CUSTOMER',
}

export enum MerchantBranchType {
  HEAD_OFFICE = 'HEAD_OFFICE',
  BRANCH = 'BRANCH',
}

export enum SubDomainStatus {
  RESERVED = 'reserved',
  READY = 'ready',
  ACTIVE = 'active',
  FAIL = 'fail',
}

@Entity()
@Index('idx_merchant', ['slug'])
@Index('IDX_merchant_store_created', ['storeId', 'createdAt'])
@Index('idx_merchant_uuid', ['uuid'], { unique: true })
export class Merchant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', generated: 'uuid' })
  uuid: string;

  // @Index({ unique: true })
  @Column({ unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: SubDomainStatus,
    default: SubDomainStatus.RESERVED,
  })
  subdomainStatus: SubDomainStatus;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  email: string;

  @Column('text', { array: true, nullable: true })
  keyword: string[];

  @Column({
    type: 'enum',
    enum: MerchantStatus,
    default: MerchantStatus.ACTIVE,
  })
  status: MerchantStatus;

  @Column({ unique: true, nullable: true })
  domain: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Cis number for merchant, used for linking with CIS system',
  })
  cisNumber: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Organization ID that this merchant belongs to',
  })
  organizeId: number;

  @Column({
    type: 'enum',
    enum: MerchantCustomerStatus,
    default: MerchantCustomerStatus.VISITOR,
    comment: 'Status of the customer profile for the merchant',
  })
  customerStatus: MerchantCustomerStatus;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Name of the merchant',
  })
  merchantName: string;

  @Column({
    type: 'enum',
    enum: MerchantBranchType,
    default: MerchantBranchType.HEAD_OFFICE,
    comment: 'Type of the merchant branch, HEAD_OFFICE or BRANCH',
  })
  merchantBranchType: MerchantBranchType;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Branch code of the merchant if it is a BRANCH type',
  })
  merchantBranchCode: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Relationship type of the merchant in the organization is BRANCH',
  })
  relationshipTypeStore: string;

  @Column({ type: 'int', nullable: true })
  storeId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => MerchantCategory,
    (merchantCategory) => merchantCategory.merchant,
  )
  merchantCategory: MerchantCategory;

  @OneToMany(
    () => MerchantTranslation,
    (merchantTranslations) => merchantTranslations.merchant,
  )
  merchantTranslations: MerchantTranslation[];

  @OneToMany(
    () => ImageUploadFolder,
    (imageUploadFolders) => imageUploadFolders.merchant,
  )
  imageUploadFolders: ImageUploadFolder[];

  @OneToMany(() => Product, (products) => products.merchant)
  products: Product[];

  @OneToMany(
    () => MerchantProduct,
    (merchantProducts) => merchantProducts.merchant,
  )
  merchantProducts: MerchantProduct[];

  @OneToMany(
    () => MerchantCategory,
    (merchantCategories) => merchantCategories.merchant,
  )
  merchantCategories: MerchantCategory[];

  @OneToMany(
    () => ProductCategory,
    (productCategories) => productCategories.merchant,
  )
  productCategories: ProductCategory[];

  @OneToMany(() => ProductBrand, (productBrands) => productBrands.merchant)
  productBrands: ProductBrand[];

  @OneToMany(() => Customer, (customers) => customers.merchant)
  customers: Customer[];

  @OneToMany(() => Order, (orders) => orders.merchant)
  orders: Order[];

  @OneToMany(
    () => BannerMerchant,
    (bannerMerchants) => bannerMerchants.merchant,
  )
  bannerMerchants: BannerMerchant[];

  @OneToMany(
    () => BannerPromotion,
    (bannerPromotions) => bannerPromotions.merchant,
  )
  bannerPromotions: BannerPromotion[];

  @OneToMany(() => Article, (articles) => articles.merchant)
  articles: Article[];

  @OneToMany(() => Cart, (carts) => carts.merchant)
  carts: Cart[];

  @OneToMany(() => FileUpload, (fileUploads) => fileUploads.merchant)
  fileUploads: FileUpload[];

  @OneToOne(() => MerchantLogo, (merchantLogo) => merchantLogo.merchant)
  merchantLogo: MerchantLogo;

  @OneToOne(() => MerchantIcon, (merchantIcon) => merchantIcon.merchant)
  merchantIcon: MerchantIcon;

  @OneToOne(() => MerchantPolicy, (merchantPolicy) => merchantPolicy.merchant)
  merchantPolicy: MerchantPolicy;

  @OneToOne(() => MerchantPdpa, (merchantPdpa) => merchantPdpa.merchant)
  merchantPdpa: MerchantPdpa;

  @ManyToOne(() => Organization, (organization) => organization.merchants)
  @JoinColumn({ name: 'organizeId' })
  organization: Organization;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @OneToMany(() => UserAddress, (userAddress) => userAddress.merchant)
  userAddress: UserAddress[];

  @OneToMany(() => UserMerchant, (userMerchant) => userMerchant.merchant)
  userMerchant: UserMerchant[];

  @OneToMany(
    () => OrganizationContact,
    (organizationContact) => organizationContact.merchant,
  )
  organizationContact: OrganizationContact[];

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
