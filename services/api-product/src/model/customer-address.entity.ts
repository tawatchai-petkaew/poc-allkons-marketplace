import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  OneToMany
} from 'typeorm';

import { Customer } from './customer.entity';
import { Order } from './order.entity';

@Entity()
export class CustomerAddress extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  postCodeAddress: string;

  @Column({ nullable: true })
  provinceAddress: string;

  @Column({ nullable: true })
  districtAddress: string;

  @Column({ nullable: true })
  subdistrictAddress: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.customerAddresses)
  customer: Customer;

  @OneToMany(() => Order, (orders) => orders.customerAddress)
  orders: Order[];

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
