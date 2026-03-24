import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { MerchantTaxInvoiceItem } from './merchant-tax-invoice-item.entity';

export enum MerchantTaxInvoiceType {
  SUBSCRIPTION_PACKAGE = 'subscriptionPackage',
  MERCHANT_EXPENSE_BILL = 'merchantExpenseBill',
}

@Entity()
export class MerchantTaxInvoice extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MerchantTaxInvoiceType,
  })
  type: MerchantTaxInvoiceType;

  @Column({ unique: true })
  number: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ nullable: true })
  companyBranch: string;

  @Column({ nullable: true })
  companyAddress: string;

  @Column({ nullable: true })
  postCodeCompanyAddress: string;

  @Column({ nullable: true })
  provinceCompanyAddress: string;

  @Column({ nullable: true })
  districtCompanyAddress: string;

  @Column({ nullable: true })
  subdistrictCompanyAddress: string;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  amount: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  amountWithoutVat: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  discount: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  preAmountWithVat: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  vat: number;

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

  @OneToMany(
    () => MerchantTaxInvoiceItem,
    (merchantTaxInvoiceItems) => merchantTaxInvoiceItems.merchantTaxInvoice,
  )
  merchantTaxInvoiceItems: MerchantTaxInvoiceItem[];

}
