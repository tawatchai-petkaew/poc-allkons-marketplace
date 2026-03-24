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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProductVariant } from './product-variant.entity';
import { Product } from './product.entity';
import { Brand } from './brand.entity';
import { Category } from './category.entity';

export enum ProductVariantCategoryStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index('iX_product_variant_category_productVariantId', ['productVariantId'])
@Index('iX_product_variant_category_productId', ['productId'])
@Index('iX_product_variant_category_brandId', ['brandId'])
@Index('iX_product_variant_category_categoryId', ['categoryId'])
@Index('iX_product_variant_category_status', ['status'])
@Index('iX_product_variant_category_createdAt', ['createdAt'])
@Index('iX_product_variant_category_updatedAt', ['updatedAt'])
export class ProductVariantCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @Column()
  productId: number;

  @Column()
  brandId: number;

  @Column()
  categoryId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  hierarchy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryD365: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryM: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categorySupplier: string;

  @Column({
    type: 'enum',
    enum: ProductVariantCategoryStatus,
    default: ProductVariantCategoryStatus.ACTIVE,
  })
  status: ProductVariantCategoryStatus;

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

  @ManyToOne(() => ProductVariant, (productVariant) => productVariant.productVariantCategories)
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Brand, (brand) => brand.productVariantCategories)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @ManyToOne(() => Category, (category) => category.productVariantCategories)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

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

