import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  Index,
} from 'typeorm';

import { ProductFlashSale } from './product-flash-sale.entity';

export enum FlashSaleStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'inActive',
}

@Entity()
@Index('IDX_flash_sale_merchant_id', ['merchantId'])
@Index('IDX_flash_sale_status', ['status'])
@Index('IDX_flash_sale_start_date', ['startDate'])
@Index('IDX_flash_sale_end_date', ['endDate'])
export class FlashSale extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: FlashSaleStatus,
    default: FlashSaleStatus.IN_ACTIVE,
  })
  status: FlashSaleStatus;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @Column({ nullable: true })
  merchantId: number;

  @OneToMany(
    () => ProductFlashSale,
    (productFlashSales) => productFlashSales.flashSale,
  )
  productFlashSales: ProductFlashSale[];

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
