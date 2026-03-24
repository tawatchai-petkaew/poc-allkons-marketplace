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
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderPaymentSlip } from './order-payment-slip.entity';
import { SubOrderPayment } from './sub-order-payment.entity';
import { Order } from './order.entity';

export enum PaymentMethod {
  PG_CREDIT_CARD = 'PG_CREDIT_CARD',
  PG_PROMPTPAY = 'PG_PROMPTPAY',
  PG_BILL = 'PG_BILL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_MERCHANT = 'CREDIT_MERCHANT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  CANCELED = 'CANCELED',
  NEW = 'NEW',
}

@Entity('order_payment')
@Index('idx_order_payment_orderId', ['orderId'])
export class OrderPayment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  payAmount: number;

  @Column({ type: 'enum', enum: PaymentStatus, nullable: false })
  status: PaymentStatus;

  @Column({ nullable: true })
  payTime: Date;

  @Column({ nullable: true })
  transactionCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  processingFeeNet: number;

  @Column()
  orderId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

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

  @ManyToOne(() => Order, (order) => order.orderPayments)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @OneToMany(
    () => OrderPaymentSlip,
    (orderPaymentSlip) => orderPaymentSlip.orderPayment,
  )
  orderPaymentSlips: OrderPaymentSlip[];

  @OneToMany(
    () => SubOrderPayment,
    (subOrderPayment) => subOrderPayment.orderPayment,
  )
  subOrderPayments: SubOrderPayment[];
}
