import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { StockTransaction } from './stock-transaction.entity';
import { Merchant } from './merchant.entity';
import { ProductItem } from './product-item.entity';

@Entity()
export class Stock extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  remaining: number;

  @Column({ default: false })
  isServiceProduct: boolean;

  @Column({ default: true })
  onValidateStock: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @OneToOne(() => ProductItem, (productItem) => productItem.stock)
  @JoinColumn()
  productItem: ProductItem;

  @OneToMany(
    () => StockTransaction,
    (stockTransactions) => stockTransactions.stock,
  )
  stockTransactions: StockTransaction[];

  @ManyToOne(() => Merchant, (merchant) => merchant.imageUploadFolders)
  merchant: Merchant;

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
