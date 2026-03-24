import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
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

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 256, nullable: true })
  updatedBy: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

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

