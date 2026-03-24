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
  ManyToOne,
} from 'typeorm';

import { Stock } from './stock.entity';

export enum StockTransactionType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
}

@Entity()
export class StockTransaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: number;

  @Column({
    type: 'enum',
    enum: StockTransactionType,
  })
  type: StockTransactionType;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => Stock, (stock) => stock.stockTransactions)
  stock: Stock;

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
