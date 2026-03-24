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
@Index(['productVariantId'])
@Index(['productId'])
@Index(['brandId'])
@Index(['categoryId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['updatedAt'])
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

  @Column({ nullable: true, length: 100 })
  hierarchy: string;

  @Column({ nullable: true, length: 100 })
  categoryD365: string;

  @Column({ nullable: true, length: 100 })
  categoryM: string;

  @Column({ nullable: true, length: 100 })
  categorySupplier: string;

  @Column({
    type: 'enum',
    enum: ProductVariantCategoryStatus,
    default: ProductVariantCategoryStatus.ACTIVE,
  })
  status: ProductVariantCategoryStatus;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, length: 256 })
  createdBy: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, length: 256 })
  updatedBy: string;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.productVariantCategories,
  )
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(() => Product, (product) => product.productVariantCategories)
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

