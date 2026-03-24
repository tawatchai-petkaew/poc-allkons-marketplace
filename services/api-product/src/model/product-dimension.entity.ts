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
@Index('iX_product_dimension_productId', ['productId'])
@Index('iX_product_dimension_productDimensionMasterId', ['productDimensionMasterId'])
@Index('iX_product_dimension_createdAt', ['createdAt'])
@Index('iX_product_dimension_updatedAt', ['updatedAt'])
export class ProductDimension extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  productDimensionMasterId: number;

  @Column({ type: 'varchar', length: 128, nullable: true })
  displayOrder: string;

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

  @ManyToOne(() => Product, (product) => product.productDimensions)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => ProductDimensionMaster, (productDimensionMaster) => productDimensionMaster.productDimensions)
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

