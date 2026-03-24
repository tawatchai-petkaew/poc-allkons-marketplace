import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
} from 'typeorm';

import { Merchant } from './merchant.entity';

@Entity()
export class MerchantPdpa extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  cookiesPolicy: string;

  @Column('text', { nullable: true })
  privacyPolicy: string;

  @Column('text', { nullable: true })
  termsOfServicePolicy: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @OneToOne(() => Merchant, (merchant) => merchant.merchantPdpa)
  @JoinColumn()
  merchant: Merchant;

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
