import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Merchant } from './merchant.entity';
import { Store } from './store.entity';
import { User } from './user.entity';

export enum Platform {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  MARKETPLACE = 'MARKETPLACE',
}

export enum ContactType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
}

export enum UsagePurposeType {
  NONE_SPECIFIED = 'NONE_SPECIFIED',
  KYC_CONTACT = 'KYC_CONTACT',
}

@Entity('organization_contact')
export class OrganizationContact extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  cisNumber: string;

  @Column({
    type: 'enum',
    enum: Platform,
    nullable: true,
  })
  platform: Platform;

  @Column({
    type: 'enum',
    enum: ContactType,
    nullable: true,
  })
  contactType: ContactType;

  @Column({
    type: 'enum',
    enum: UsagePurposeType,
    nullable: true,
  })
  usagePurposeType: UsagePurposeType;

  @Column({ type: 'varchar', nullable: true, comment: 'email or phone' })
  contact: string;

  @Column({ type: 'boolean', default: true })
  activeStatus: boolean;

  @Column({ type: 'boolean', default: false })
  isVerify: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: false })
  isKycDocument: boolean;

  @Column({ type: 'int', nullable: true })
  organizeId: number;

  @Column({ type: 'int', nullable: true })
  organizeBranchId: number;

  @Column({ type: 'int', nullable: true })
  storeId: number;

  @Column({ type: 'int', nullable: true })
  merchantId: number;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relationships
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizeId' })
  organization: Organization;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @BeforeInsert()
  private beforeInsert(): void {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  private beforeUpdate(): void {
    this.updatedAt = new Date();
  }
}
