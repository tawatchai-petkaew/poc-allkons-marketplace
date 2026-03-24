import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
} from 'typeorm';

import { User } from './user.entity';
import { CustomerAddress } from './customer-address.entity';
import { Merchant } from './merchant.entity';
import { Order } from './order.entity';
import { Cart } from './cart.entity';
import { UserGender } from './enum/user.enum';
import { ImageUpload } from './image-upload.entity';

export enum CustomerStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'inActive',
}

@Entity()
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  registrationToken: string;

  @Column({ nullable: true })
  currentDeviceToken: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  email: string;

  @Column('text', { array: true, nullable: true })
  tag: string[];

  @Column('text', { nullable: true })
  notation: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender: UserGender;

  @Column({
    nullable: true,
  })
  birthDate: Date;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @OneToMany(
    () => CustomerAddress,
    (customerAddresses) => customerAddresses.customer,
  )
  customerAddresses: CustomerAddress[];

  @OneToMany(() => Order, (orders) => orders.customer)
  orders: Order[];

  @ManyToOne(() => User, (user) => user.customers)
  user: User;

  @ManyToOne(() => Merchant, (merchant) => merchant.customers)
  merchant: Merchant;

  @OneToOne(() => Cart, (cart) => cart.customer)
  cart: Cart;

  @ManyToOne(() => ImageUpload, (imageUpload) => imageUpload.customers)
  imageUpload: ImageUpload;

  @AfterLoad()
  sortItems() {
    if (this?.customerAddresses?.length) {
      this.customerAddresses.sort((a, b) => a.id - b.id);
    }
  }

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
