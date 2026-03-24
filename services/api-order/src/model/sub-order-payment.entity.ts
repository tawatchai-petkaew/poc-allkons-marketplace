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
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderPayment } from './order-payment.entity';
import { FileUpload } from './file-upload.entity';
import { SubOrder } from './sub-order.entity';

@Entity('sub_order_payment')
@Index('idx_sub_order_payment_subOrderId', ['subOrderId'])
@Index('idx_sub_order_payment_orderPaymentId', ['orderPaymentId'])
export class SubOrderPayment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderPaymentId: number;

  @Column()
  subOrderId: number;

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

  @ManyToOne(
    () => OrderPayment,
    (orderPayment) => orderPayment.subOrderPayments,
  )
  @JoinColumn({ name: 'orderPaymentId' })
  orderPayment: OrderPayment;

  @ManyToOne(() => SubOrder, (subOrder) => subOrder.subOrderPayments)
  @JoinColumn({ name: 'subOrderId' })
  subOrder: SubOrder;
}
