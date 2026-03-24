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

import { ImageUpload } from './image-upload.entity';
import { CategoryTag } from './category-tag.entity';
import { ProductCategory } from './product-category.entity';
import { ProductVariantCategory } from './product-variant-category.entity';
import { Product } from './product.entity';
import { MerchantCategory } from './merchant-category.entity';

export enum CategoryStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index('iX_category_status', ['status'])
@Index('iX_category_imageUploadId', ['imageUploadId'])
@Index('iX_category_parentCategoryId', ['parentCategoryId'])
@Index('iX_category_createdAt', ['createdAt'])
@Index('iX_category_updatedAt', ['updatedAt'])
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  d365CategoryCode: string;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @Column({ type: 'int', nullable: true })
  imageUploadId: number;

  @Column({ type: 'varchar', nullable: true })
  parentCategoryId: string;

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

  @ManyToOne(() => ImageUpload, { nullable: true })
  @JoinColumn({ name: 'imageUploadId' })
  imageUpload: ImageUpload;

  children: Category[];
  subCategories: Category[];

  @OneToMany(() => Product, (products) => products.category)
  products: Product[];

  @OneToMany(
    () => MerchantCategory,
    (merchantCategories) => merchantCategories.category,
  )
  merchantCategories: MerchantCategory[];

  @OneToMany(() => CategoryTag, (categoryTags) => categoryTags.category)
  categoryTags: CategoryTag[];

  @OneToMany(
    () => ProductVariantCategory,
    (productVariantCategories) => productVariantCategories.category,
  )
  productVariantCategories: ProductVariantCategory[];

  @OneToMany(
    () => ProductCategory,
    (productCategories) => productCategories.category,
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
