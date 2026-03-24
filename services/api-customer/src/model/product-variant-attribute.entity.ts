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
import { ProductAttributeMaster } from './product-attribute-master.entity';

export enum ProductVariantAttributeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index(['productVariantId'])
@Index(['productAttributeMasterId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductVariantAttribute extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @Column()
  productAttributeMasterId: number;

  @Column({ length: 256 })
  stringValue: string;

  @Column({ nullable: true, type: 'decimal', precision: 18, scale: 2 })
  numberValue: number;

  @Column({
    type: 'enum',
    enum: ProductVariantAttributeStatus,
    default: ProductVariantAttributeStatus.ACTIVE,
  })
  status: ProductVariantAttributeStatus;

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
    (productVariant) => productVariant.productVariantAttributes,
  )
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(
    () => ProductAttributeMaster,
    (productAttributeMaster) =>
      productAttributeMaster.productVariantAttributes,
  )
  @JoinColumn({ name: 'productAttributeMasterId' })
  productAttributeMaster: ProductAttributeMaster;

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

