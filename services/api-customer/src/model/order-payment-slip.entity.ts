import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderPayment } from './order-payment.entity';
import { FileUpload } from './file-upload.entity';

@Entity('order_payment_slip')
export class OrderPaymentSlip extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderPaymentId: number;

  @Column()
  fileUploadId: number;

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

  @ManyToOne(() => OrderPayment, (orderPayment) => orderPayment.orderPaymentSlips)
  @JoinColumn({ name: 'orderPaymentId' })
  orderPayment: OrderPayment;

  @ManyToOne(() => FileUpload, (fileUpload) => fileUpload.orderPaymentSlips)
  @JoinColumn({ name: 'fileUploadId' })
  fileUpload: FileUpload;
}