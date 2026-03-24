import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
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
export class ProductVariantCode extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  productVariantId: number;

  @Column({ nullable: true, length: 255 })
  skuCode: string;

  @Column({ nullable: true, length: 255 })
  type: string;

  @Column({
    type: 'enum',
    enum: ProductVariantCodeStatus,
    default: ProductVariantCodeStatus.ACTIVE,
  })
  status: ProductVariantCodeStatus;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, length: 255 })
  createdBy: string;

  @Column({ nullable: true, length: 255 })
  updatedBy: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.productVariantCodes,
  )
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

