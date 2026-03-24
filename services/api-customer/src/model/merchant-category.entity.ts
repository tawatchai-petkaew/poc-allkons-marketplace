import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Merchant } from './merchant.entity';
import { Category } from './category.entity';

export enum MerchantCategoryStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity('merchant_category')
@Index('IX_merchant_category_merchantId', ['merchantId'])
@Index('IX_merchant_category_categoryId', ['categoryId'])
@Index('IX_merchant_category_status', ['status'])
@Index('UQ_merchant_category_merchant_category', ['categoryId', 'merchantId'], {
  unique: true,
})
export class MerchantCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  nameEn: string;

  @Column({ nullable: true })
  merchantId: number;

  @Column({ nullable: true })
  categoryId: number;

  @Column({
    type: 'enum',
    enum: MerchantCategoryStatus,
    default: MerchantCategoryStatus.ACTIVE,
  })
  status: MerchantCategoryStatus;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Merchant, (merchant) => merchant.merchantCategories)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;
  @ManyToOne(() => Category, (category) => category.merchantCategories)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

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

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;
}
