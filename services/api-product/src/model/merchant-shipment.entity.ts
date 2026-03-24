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
} from 'typeorm';

export enum ShipmentType {
  PICKUP = 'pickup',
  TRANSPORT = 'transport',
  ONLINE = 'online',
}

export enum PaymentShipmentType {
  FREE = 'free',
  PAY_BEFORE_SHIPMENT = 'payBeforeShipment',
  PAY_AFTER_SHIPMENT = 'payAfterShipment',
}

export enum CalculateShipmentType {
  FIXED = 'fixed',
  CUSTOM = 'custom',
}

@Entity()
export class MerchantShipment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ShipmentType,
    default: ShipmentType.PICKUP,
  })
  shipmentType: ShipmentType;

  @Column({
    type: 'enum',
    enum: PaymentShipmentType,
    nullable: true,
  })
  paymentShipmentType: PaymentShipmentType;

  @Column({ nullable: true })
  duration: string;

  @Column({
    type: 'enum',
    enum: CalculateShipmentType,
    nullable: true,
  })
  calculateShipmentType: CalculateShipmentType;

  @Column({ nullable: true })
  fixedPrice: number;

  @Column()
  isActive: boolean;

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
}
