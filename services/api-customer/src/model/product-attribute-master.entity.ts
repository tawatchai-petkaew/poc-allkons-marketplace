import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProductVariantAttribute } from './product-variant-attribute.entity';

export enum ProductAttributeType {
  INTEGER = 'Integer',
  DECIMAL = 'Decimal',
  STRING = 'String',
  BOOLEAN = 'Boolean',
}

export enum ProductAttributeMasterStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index(['attributeType'])
@Index(['status'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductAttributeMaster extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 256 })
  name: string;

  @Column({ nullable: true, length: 2048 })
  description: string;

  @Column({
    type: 'enum',
    enum: ProductAttributeType,
    default: ProductAttributeType.INTEGER,
  })
  attributeType: ProductAttributeType;

  @Column()
  displayOrder: number;

  @Column({
    type: 'enum',
    enum: ProductAttributeMasterStatus,
    default: ProductAttributeMasterStatus.ACTIVE,
  })
  status: ProductAttributeMasterStatus;

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

  @OneToMany(
    () => ProductVariantAttribute,
    (productVariantAttributes) => productVariantAttributes.productAttributeMaster,
  )
  productVariantAttributes: ProductVariantAttribute[];

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

