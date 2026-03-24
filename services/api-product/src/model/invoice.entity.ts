import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ImageUpload } from './image-upload.entity';
import { Order } from './order.entity';

export enum PaymentMethodType {
  BANK_ACCOUNT = 'bankAccount',
  PROMPTPAY = 'promptpay',
  CASH = 'cash',
  OMISE = 'omise',
  PAYPAL = 'paypal',
  SHOPDITPAY_CREDIT_CARD = 'shopditpayCreditCard',
  SHOPDITPAY_LINEPAY = 'shopditpayLinepay',
  SHOPDITPAY_AIRPAY = 'shopditpayAirpay',
  SHOPDITPAY_SCB_EASY = 'shopditpayScbEasy',
  SHOPDITPAY_BBL = 'shopditpayBbl',
  SHOPDITPAY_BAYBANK = 'shopditpayBaybank',
  SHOPDITPAY_TRUEMONEY = 'shopditpayTruemoney',
}

export enum Status {
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  CANCEL = 'cancel',
  EXPIRE = 'expire',
}

@Entity()
export class Invoice extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  totalPrice: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  productPrice: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  productDiscountPrice: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  shipmentPrice: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  shopditPoint: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  earnShopditPoint: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PROCESSING,
  })
  status: Status;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    nullable: true,
  })
  paymentMethodType: PaymentMethodType;

  @Column({ nullable: true })
  paymentAt: Date;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  timePaymentAt: string;

  @Column({ default: true })
  isVerify: boolean;

  @Column({ nullable: true })
  paymentMethodName: string;

  @Column({ nullable: true })
  paymentMethodNumber: string;

  @Column({ nullable: true })
  paymentMethodBankSlug: string;

  @Column({ nullable: true })
  paymentMethodQRCodeImage: string;

  @Column({ nullable: true })
  couponName: string;

  @Column({ nullable: true })
  couponCode: string;

  @Column({ nullable: true, type: 'float', default: 0.0 })
  couponDiscount: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @OneToOne(() => Order, (order) => order.invoice)
  @JoinColumn()
  order: Order;

  @ManyToOne(() => ImageUpload, (imageUpload) => imageUpload.invoices)
  imageUpload: ImageUpload;

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
