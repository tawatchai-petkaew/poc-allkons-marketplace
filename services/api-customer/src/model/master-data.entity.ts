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
  Unique,
} from 'typeorm';

import { MerchantProduct } from './merchant-product.entity';

export enum MasterDataType {
  PRODUCT_TYPE = 'ProductType',
  PAYMENT_METHOD = 'PaymentMethod',
  ORDER_STATUS = 'OrderStatus',
  SHIPPING_STATUS = 'ShippingStatus',
}

export enum MasterDataStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Unique(['type', 'code'])
@Index(['type'])
@Index(['code'])
@Index(['status'])
@Index(['type', 'status'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class MasterData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MasterDataType,
  })
  type: MasterDataType;

  @Column({ length: 128 })
  code: string;

  @Column({ length: 256 })
  name: string;

  @Column({ nullable: true, length: 256 })
  name_th: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  displayOrder: number;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: MasterDataStatus,
    nullable: true,
  })
  status: MasterDataStatus;

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
    () => MerchantProduct,
    (merchantProducts) => merchantProducts.productType,
  )
  merchantProducts: MerchantProduct[];

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

