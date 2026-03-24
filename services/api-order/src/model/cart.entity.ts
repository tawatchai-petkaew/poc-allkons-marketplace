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

import { CartItem } from './cart-item.entity';
import { Customer } from './customer.entity';
import { Merchant } from './merchant.entity';
import { Order } from './order.entity';
import { Organization } from './organiztion.entity';
import { UserOrganization } from './user-organization.entity';
import { User } from './user.entity';

@Entity()
@Index('idx_cart', ['merchant', 'organization'])
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => Merchant, (merchant) => merchant.carts)
  merchant: Merchant;

  @OneToOne(() => Customer, (customer) => customer.cart)
  @JoinColumn()
  customer: Customer;

  @OneToMany(() => CartItem, (cartItems) => cartItems.cart)
  cartItems: CartItem[];

  @ManyToOne(
    () => UserOrganization,
    (userOrganization) => userOrganization.carts,
  )
  userOrganization: UserOrganization;

  @ManyToOne(() => User, (user) => user.carts)
  user: User;

  @ManyToOne(() => Organization, (organization) => organization.carts)
  organization: Organization;

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

  @OneToMany(() => Order, (order) => order.cart)
  orders: Order[];
}
