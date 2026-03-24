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
  Unique,
  UpdateDateColumn,
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
@Unique('UQ_master_data_type_code', ['type', 'code'])
@Index('iX_master_data_type', ['type'])
@Index('iX_master_data_code', ['code'])
@Index('iX_master_data_status', ['status'])
@Index('iX_master_data_type_status', ['type', 'status'])
@Index('iX_master_data_createdAt', ['createdAt'])
@Index('iX_master_data_updatedAt', ['updatedAt'])
export class MasterData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MasterDataType,
  })
  type: MasterDataType;

  @Column({ type: 'varchar', length: 128 })
  code: string;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  name_th: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  displayOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: MasterDataStatus,
    nullable: true,
  })
  status: MasterDataStatus;

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

