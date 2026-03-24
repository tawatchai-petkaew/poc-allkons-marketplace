import {
  Entity,
  Index,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { Merchant } from './merchant.entity';
import { Role } from './roles.entity';

@Entity('user_merchants_merchant')
@Index('idx_user_merchants_user_merchant', ['userId', 'merchantId'])
@Index('idx_user_merchants_merchant_id', ['merchantId'])
@Index('IDX_user_merchants_user_id', ['userId'])
@Index('IDX_user_merchants_role_id', ['roleId'])
@Index('IDX_user_merchants_merchant_user', ['merchantId', 'userId'])
@Index('IDX_user_merchants_created_at', ['createdAt'])
export class UserMerchant {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  merchantId: number;

  @Column({ nullable: true })
  lastAccessedAt: Date;

  @Column({ nullable: true })
  roleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Merchant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => Role, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Role;

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
