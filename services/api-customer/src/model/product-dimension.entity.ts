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

import { Product } from './product.entity';
import { ProductDimensionMaster } from './product-dimension-master.entity';
import { ProductVariantDimension } from './product-variant-dimension.entity';

@Entity()
@Index(['productId'])
@Index(['productDimensionMasterId'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductDimension extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  productDimensionMasterId: number;

  @Column({ nullable: true, length: 128 })
  displayOrder: string;

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

  @ManyToOne(() => Product, (product) => product.productDimensions)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(
    () => ProductDimensionMaster,
    (productDimensionMaster) => productDimensionMaster.productDimensions,
  )
  @JoinColumn({ name: 'productDimensionMasterId' })
  productDimensionMaster: ProductDimensionMaster;

  @OneToMany(
    () => ProductVariantDimension,
    (productVariantDimensions) => productVariantDimensions.productDimension,
  )
  productVariantDimensions: ProductVariantDimension[];

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

