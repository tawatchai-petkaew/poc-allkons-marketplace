export enum JuristicTypeCIS {
  JURISTIC = 'JURISTIC',
  INDIVIDUAL = 'INDIVIDUAL',
}
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { UserAddress } from './user-address.entity';
import { JuristicType } from './juristic-type.entity';
import { Store } from './store.entity';
import { OrganizationContact } from './organization-contact.entity';
import { OrganizationConsent } from './organization-consent.entity';
import { PhoneWhiteList } from './phone-white-list.entity';
import { Role } from './roles.entity';
import { UserOrganization } from './user-organization.entity';
import { Order } from './order.entity';
import { Cart } from './cart.entity';

export enum Type {
  HEAD_OFFICE = 'HEAD_OFFICE',
  BRANCH = 'BRANCH',
}

export enum kycStatus {
  NONE = 'NONE',
  WAIT_FOR_APPROVE = 'WAIT_FOR_APPROVE',
  REQUEST_MORE = 'REQUEST_MORE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

enum RoleBusinessType {
  AGENT = 'AGENT',
  BIXBOX = 'BIXBOX',
  MDT = 'MDT',
  ONL = 'ONL',
  FAC = 'FAC',
  CON = 'CON',
  CH = 'CH',
  DVP = 'DVP',
  DVP_HOTEL = 'DVP_HOTEL',
  DVP_CONNDO = 'DVP_CONNDO',
  DVP_APT = 'DVP_APT',
  DVP_DOR = 'DVP_DOR',
  DVP_SC = 'DVP_SC',
  DVP_GASSTATION = 'DVP_GASSTATION',
  DVP_AHD = 'DVP_AHD',
  ARC = 'ARC',
  ARC_LND_ARC = 'ARC_LND_ARC',
  ARC_ARC = 'ARC_ARC',
  ARC_ID = 'ARC_ID',
  ARC_PD = 'ARC_PD',
  ENG = 'ENG',
  ENG_CE = 'ENG_CE',
  ENG_ENV = 'ENG_ENV',
  ENG_ME = 'ENG_ME',
  ENG_EC = 'ENG_EC',
  IGFA = 'IGFA',
  IGFA_CN = 'IGFA_CN',
  IGFA_ID = 'IGFA_ID',
  IGFA_VN = 'IGFA_VN',
  IGFA_OTHER = 'IGFA_OTHER',
  BANK = 'BANK',
  NONE_BANK = 'NONE_BANK',
  GIL = 'GIL',
  OTHER = 'OTHER',
}

export enum OrganizationType {
  PERSONAL = 'PERSONAL',
  JURISTIC = 'JURISTIC',
  REGISTERED_INDIVIDUAL = 'REGISTERED_INDIVIDUAL',
}

export enum OrganizationCustomerStatus {
  VISITOR = 'VISITOR',
  CUSTOMER = 'CUSTOMER',
}

@Entity()
export class Organization extends BaseEntity {
  constructor(partial: Partial<Organization>) {
    super();
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', generated: 'uuid' })
  uuid: string;

  @Column({
    nullable: true,
  })
  taxId: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  idCard: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  registrationNumber: string;

  @Column({
    nullable: true,
    type: 'enum',
    default: 1,
    enum: JuristicTypeCIS,
  })
  organizeType: number;

  @Column({
    nullable: false,
  })
  organizeName: string;

  @Column({
    nullable: true,
  })
  organizeNameEN: string;

  @Column({
    nullable: true,
  })
  cisNumber: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Type,
    default: null,
  })
  type: Type;

  @Column({
    nullable: true,
    type: 'enum',
    enum: RoleBusinessType,
    array: true,
    default: [],
  })
  businessType: RoleBusinessType[];

  @Column({
    nullable: true,
    type: 'varchar',
  })
  remarkTypeOther: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  branchNumber: string;

  @Column({
    nullable: true,
    default: null,
  })
  branchName: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  relationshipType: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  mainPhoneNumber: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  otherPhoneNumber: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  mainEmail: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  highestAuthorityName: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  highestAuthorityPosition: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  highestAuthorityPhoneNumber: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  highestAuthorityEmail: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  contactName: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  contactPhoneNumber: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  contactEmail: string;

  @Column({
    type: 'enum',
    enum: kycStatus,
    default: kycStatus.NONE,
    nullable: true,
  })
  kycStatus: kycStatus;

  @Column({
    nullable: true,
    type: 'boolean',
    default: false,
  })
  contactShownHighestAuthority: boolean;

  @Column({
    type: 'int',
    nullable: true,
  })
  juristicTypeId: number;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'registration date',
  })
  registerDate: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  status: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: OrganizationType,
  })
  organizationType: OrganizationType;

  @Column({
    type: 'enum',
    enum: OrganizationCustomerStatus,
    default: OrganizationCustomerStatus.VISITOR,
    nullable: true,
  })
  customerStatus: OrganizationCustomerStatus;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isDopa: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isDbd: boolean;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'Firstname + Lastname',
  })
  isUseFullName: string;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'Commercial Name',
  })
  commercialName: string;

  @Column({
    nullable: true,
    default: null,
  })
  remarkKyc: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Reference to head office organization ID',
  })
  headOfficeId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Merchant, (merchant) => merchant.organization)
  merchants: Merchant[];

  @OneToMany(() => UserAddress, (userAddress) => userAddress.organization)
  userAddresses: UserAddress[];

  @ManyToOne(() => JuristicType)
  @JoinColumn({ name: 'juristicTypeId' })
  juristic: JuristicType;

  @OneToMany(() => Store, (store) => store.organization)
  store: Store[];

  @OneToMany(
    () => OrganizationContact,
    (organizationContact) => organizationContact.organization,
  )
  organizationContact: OrganizationContact[];

  @OneToMany(
    () => OrganizationConsent,
    (organizationConsent) => organizationConsent.organization,
  )
  organizationConsent: OrganizationConsent[];

  @OneToMany(
    () => UserOrganization,
    (userOrganization) => userOrganization.organization,
  )
  userOrganization: UserOrganization[];

  @OneToMany(() => Role, (role) => role.organizations)
  roles: Role[];

  @OneToMany(
    () => PhoneWhiteList,
    (phoneWhiteList) => phoneWhiteList.organization,
  )
  phoneWhiteList: PhoneWhiteList[];

  @OneToMany(() => Cart, (cart) => cart.organization)
  carts: Cart[];

  @ManyToOne(() => Organization, (organization) => organization.branches, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'headOfficeId' })
  headOffice: Organization;

  @OneToMany(() => Organization, (organization) => organization.headOffice)
  branches: Organization[];

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

  @OneToMany(() => Order, (orders) => orders.customer)
  orders: Order[];
}
