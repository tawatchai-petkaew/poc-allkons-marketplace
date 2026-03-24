import {
  BaseEntity,
  Column,
  Generated,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  Index,
} from 'typeorm';

import { Order } from './order.entity';

import { SubOrderDocument } from './sub-order-document.entity';
import { OrderItem } from './order-item.entity';
import { District } from './district.entity';
import { Province } from './province.entity';
import { SubDistrict } from './sub-district.entity';
import { Country } from './country.entity';
import { SubOrderPayment } from './sub-order-payment.entity';

export enum DeliveryTime {
  ANYTIME = 'ANYTIME',
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
}

export enum DeliveryBy {
  AGENT = 'AGENT',
  OUTSOURCE = 'OUTSOURCE',
}

export enum SubOrderStatus {
  NEW = 'NEW', // รอเลือกชำระ
  WAITING_DELIVERY_FEE = 'WAITING_DELIVERY_FEE', // รอค่าจัดส่ง
  PENDING_PAYMENT = 'PENDING_PAYMENT', // ที่ต้องชำระ
  PENDING_VERIFY = 'PENDING_VERIFY', // รอร้านค้าตรวจสอบการชำระ
  PREPARE_PRODUCT = 'PREPARE_PRODUCT', // เตรียมสินค้า || ที่ต้องจัดส่ง
  DELIVERY = 'DELIVERY', // กำลังจัดส่ง || ที่ต้องได้รับ
  SUCCESS = 'SUCCESS', // สำเร็จแล้ว
  CANCEL = 'CANCEL', // ยกเลิก
  EXPIRED = 'EXPIRED', // หมดอายุ
}

@Entity('sub_order')
@Index('idx_sub_order_number', ['subOrderNumber'])
@Index('idx_sub_order_orderId', ['orderId'])
@Index('idx_sub_order_status', ['status'])
@Index('idx_sub_order_orderid_status', ['orderId', 'status'])
export class SubOrder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text' })
  subOrderNumber: string;

  @Column({
    type: 'enum',
    enum: SubOrderStatus,
    default: SubOrderStatus.NEW,
  })
  status: SubOrderStatus;

  @Column()
  orderId: number;

  @ManyToOne(() => Order, (order) => order.subOrders)
  order: Order;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.subOrder)
  orderItems: OrderItem[];

  @Column({ nullable: true })
  refPONumber: string;

  @Column({ type: 'date', nullable: true })
  deliveryDate: string;

  @Column({ type: 'enum', enum: DeliveryTime, nullable: true })
  deliveryTime: DeliveryTime;

  @Column({ type: 'enum', enum: DeliveryBy, nullable: true })
  deliveryBy: DeliveryBy;

  @Column({ type: 'int', default: 0 })
  deliveryPrice: number;

  @Column({ type: 'text', nullable: true })
  deliveryNote: string;

  @OneToMany(() => SubOrderDocument, (file) => file.subOrder, {
    cascade: true,
  })
  documents: File[];

  @Column({ type: 'text', nullable: false })
  receiverName: string;

  @Column({ type: 'text', nullable: false })
  receiverPhone: string;

  @Column({ type: 'text', nullable: true })
  projectName: string;

  @Column({ type: 'text', nullable: false })
  addressName: string;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: 'int' })
  countryId: number;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @Column({ type: 'int' })
  provinceId: number;

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'provinceId' })
  province: Province;

  @Column({ type: 'int' })
  districtId: number;

  @ManyToOne(() => District)
  @JoinColumn({ name: 'districtId' })
  district: District;

  @Column({ type: 'int' })
  subDistrictId: number;

  @ManyToOne(() => SubDistrict)
  @JoinColumn({ name: 'subDistrictId' })
  subDistrict: SubDistrict;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  @OneToMany(
    () => SubOrderPayment,
    (subOrderPayment) => subOrderPayment.subOrder,
  )
  subOrderPayments: SubOrderPayment[];
}
