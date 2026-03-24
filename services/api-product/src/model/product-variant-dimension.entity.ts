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
import { ProductDimension } from './product-dimension.entity';

@Entity()
@Index('iX_product_variant_dimension_productVariantId', ['productVariantId'])
@Index('iX_product_variant_dimension_productDimensionId', ['productDimensionId'])
@Index('iX_product_variant_dimension_createdAt', ['createdAt'])
@Index('iX_product_variant_dimension_updatedAt', ['updatedAt'])
export class ProductVariantDimension extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @Column()
  productDimensionId: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  value: string;

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

  @ManyToOne(() => ProductVariant, (productVariant) => productVariant.productVariantDimensions)
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(() => ProductDimension, (productDimension) => productDimension.productVariantDimensions)
  @JoinColumn({ name: 'productDimensionId' })
  productDimension: ProductDimension;

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

