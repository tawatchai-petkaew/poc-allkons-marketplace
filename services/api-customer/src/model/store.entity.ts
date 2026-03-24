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
  OneToMany,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { UserAddress } from './user-address.entity';
import { OrganizationContact } from './organization-contact.entity';
import { Merchant } from './merchant.entity';

export enum StoreType {
  HEAD_OFFICE = 'HEAD_OFFICE',
  BRANCH = 'BRANCH',
}

export enum StoreCustomerStatus {
  VISITOR = 'VISITOR',
  CUSTOMER = 'CUSTOMER',
}

@Entity('store')
@Index('IDX_store_organize_created', ['organizeId', 'createdAt'])
export class Store extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true, comment: 'juristic_name' })
  storeBranchName: string;

  @Column({ type: 'varchar', nullable: true })
  storeBranchCode: string;

  @Column({ type: 'varchar', nullable: true, comment: 'OFFICE__BRAND' })
  customerProfileType: string;

  @Column({
    type: 'enum',
    enum: StoreCustomerStatus,
    nullable: true,
  })
  customerStatus: StoreCustomerStatus;

  @Column({
    type: 'enum',
    enum: StoreType,
    nullable: true,
    comment: 'organize_type in cis',
  })
  storeType: StoreType;

  @Column({ type: 'varchar', nullable: true, comment: 'CIS_NUMBER' })
  cisNumber: string;

  @Column({ type: 'int', nullable: true })
  organizeId: number;

  @Column({ type: 'int', nullable: true })
  organizeBranchId: number;

  @Column({ type: 'varchar', nullable: true, comment: 'BRANCH' })
  relationshipTypeOrganize: string;

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

  @OneToMany(() => UserAddress, (userAddress) => userAddress.store)
  userAddress: UserAddress[];

  @OneToMany(
    () => OrganizationContact,
    (organizationContact) => organizationContact.store,
  )
  organizationContact: OrganizationContact[];

  @OneToMany(() => Merchant, (merchant) => merchant.store)
  merchants: Merchant[];

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
