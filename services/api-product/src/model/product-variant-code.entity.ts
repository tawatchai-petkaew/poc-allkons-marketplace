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

export enum ProductVariantCodeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index('iX_product_variant_code_productVariantId', ['productVariantId'])
@Index('iX_product_variant_code_status', ['status'])
@Index('iX_product_variant_code_createdAt', ['createdAt'])
@Index('iX_product_variant_code_updatedAt', ['updatedAt'])
export class ProductVariantCode extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  productVariantId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  skuCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type: string;

  @Column({
    type: 'enum',
    enum: ProductVariantCodeStatus,
    default: ProductVariantCodeStatus.ACTIVE,
    nullable: true,
  })
  status: ProductVariantCodeStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ProductVariant, (productVariant) => productVariant.productVariantCodes, { nullable: true })
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

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

