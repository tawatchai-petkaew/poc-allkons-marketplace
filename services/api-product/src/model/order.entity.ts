import {
  BaseEntity,
  Column,
  Generated,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';

import { CustomerAddress } from './customer-address.entity';
import { Customer } from './customer.entity';
import { Invoice } from './invoice.entity';
import { Merchant } from './merchant.entity';
import { OrderItem } from './order-item.entity';
import { SubOrder } from './sub-order.entity';
import { Organization } from './organization.entity';
import { Cart } from './cart.entity';
import { User } from './user.entity';
import { OrderPayment } from './order-payment.entity';

export enum OrderStatus {
  NEW = 'NEW',
  INPROGRESS = 'INPROGRESS',
  SUCCESS = 'SUCCESS',
  CANCEL = 'CANCEL',
  EXPIRE = 'EXPIRE',
  PENDING_PAYMENT = 'pendingPayment',
  PENDING_VERIFY = 'pendingVerify',
  PREPARE_PROUDCT = 'prepareProduct',
  SHIPPING = 'shipping',
  RETURN_PRODUCT = 'returnProduct',
}

export enum Channel {
  MOBILE_WEBSITE = 'mobileWebsite',
  IOS_APP = 'IosApp',
  ANDROID_APP = 'AndroidApp',
  DESKTOP_WEBSITE = 'desktopWebsite',
  ADMIN = 'admin',
}

export enum CancelReason {
  EDIT_ORDER_DETAIL = 'editOrderDetail',
  CHANGE_ADDRESS = 'changeAddress',
  CHANGE_PAYMENT = 'changePayment',
  EDIT_COUPON = 'editCoupon',
  PAYMENT_COMPLICATED = 'paymentComplicated',
  OTHER_OR_CHANGE_YOUR_MIND = 'otherOrChangeYourMind',
  NOT_TO_BUY = 'notToBuy',
  SELLER_NOT_RESPOND = 'sellerNotRespond',
  PRODUCT_OUT_OF_STOCK = 'productOutOfStock',
  NO_PAYMENT = 'noPayment',
  CAN_NOT_DELIVER_ON_TIME = 'canNotDeliverOnTime',
}

export enum CancelBy {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  SYSTEM = 'system',
}

export enum OrderType {
  ONLY_PRODUCT = 'onlyProduct',
  ONLY_SERVICE = 'onlyService',
  PRODUCT_AND_SERVICE = 'productAndService',
}

export enum DeliveryType {
  PICKUP = 'PICKUP',
  AGENT_SERVICE = 'AGENT_SERVICE',
}

export enum DeliveryReceiveType {
  SENDONCE = 'SENDONCE',
  GRADUALLY = 'GRADUALLY',
}
@Entity()
@Index('idx_order', ['userId', 'merchantId', 'organizationId', 'createdAt'])
@Index('idx_order_merchant_org', ['merchantId', 'organizationId'])
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: Channel,
    nullable: true,
  })
  channel: Channel;

  @Column()
  orderedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  cancelAt: Date;

  @Column({
    type: 'enum',
    enum: CancelReason,
    nullable: true,
  })
  cancelReason: CancelReason;

  @Column({
    type: 'enum',
    enum: CancelBy,
    nullable: true,
  })
  cancelBy: CancelBy;

  @Column('text', { nullable: true })
  note: string;

  @Column({ nullable: true })
  @Generated('uuid')
  publicUuid: string;

  @Column({ nullable: true })
  publicExpiredDate: Date;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.ONLY_PRODUCT,
  })
  orderType: OrderType;

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

  @ManyToOne(() => Merchant, (merchant) => merchant.orders)
  merchant: Merchant;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.orders)
  user: Customer;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer: Customer;

  @ManyToOne(() => CustomerAddress, (customerAddress) => customerAddress.orders)
  customerAddress: CustomerAddress;

  @OneToMany(() => OrderItem, (orderItems) => orderItems.order)
  orderItems: OrderItem[];

  @OneToOne(() => Invoice, (invoice) => invoice.order)
  invoice: Invoice;

  @OneToMany(() => OrderPayment, (orderPayment) => orderPayment.order)
  orderPayments: OrderPayment[];

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

  @OneToMany(() => SubOrder, (supOrder) => supOrder.order)
  subOrders: SubOrder[];

  @ManyToOne(() => Organization, (organization) => organization.orders)
  organization: Organization;

  @Column({ nullable: true })
  organizationId: number;

  @ManyToOne(() => Cart, (cart) => cart.orders)
  cart: Cart;

  @Column({ nullable: true })
  cartId: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  totalPrice: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  totalDeliveryPrice: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  grandTotal: number;

  @Column({ type: 'varchar', nullable: true })
  deliveryType: DeliveryType;

  @Column({ type: 'varchar', nullable: true })
  deliveryReceiveType: DeliveryReceiveType;
}
