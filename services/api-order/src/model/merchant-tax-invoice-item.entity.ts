import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';

import { MerchantTaxInvoice } from './merchant-tax-invoice.entity';

@Entity()
export class MerchantTaxInvoiceItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  amount: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  totalAmount: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(
    () => MerchantTaxInvoice,
    (merchantTaxInvoice) => merchantTaxInvoice.merchantTaxInvoiceItems,
  )
  merchantTaxInvoice: MerchantTaxInvoice;
}
