import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  BeforeUpdate,
  OneToOne,
} from 'typeorm';

import * as bcrypt from 'bcryptjs';

import { Merchant } from './merchant.entity';
import { Customer } from './customer.entity';
import { ImageUpload } from './image-upload.entity';
import {
  OnBoardingStep,
  RegisterStatus,
  RegisterStep,
  UserGender,
  UserStatus,
} from './enum/user.enum';
import { Transform } from 'class-transformer';
import { UserConsent } from './user-consent.entity';
import { UserAddress } from './user-address.entity';
import { UserOrganization } from './user-organization.entity';
import { OrganizationContact } from './organization-contact.entity';
import { Order } from './order.entity';
import { Cart } from './cart.entity';
import { DraftUser } from './draft-user.entity';

export enum UserLocale {
  TH = 'th',
  EN = 'en',
  CN = 'cn',
  TW = 'tw',
  ZH_TW = 'zh_TW',
  ZH_CN = 'zh_CN',
  FR = 'fr',
  ES = 'es',
}

export enum RoleBusinessType {
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
export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'superAdmin',
  CUSTOMER = 'customer',
}

export enum UserInterfaceMode {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum kycStatus {
  NONE = 'NONE',
  WAIT_FOR_APPROVE = 'WAIT_FOR_APPROVE',
  REQUEST_MORE = 'REQUEST_MORE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum MaritalStatus {
  CELIBATE = 'CELIBATE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

@Entity()
@Index('idx_user_name_search', ['firstNameTh', 'lastNameTh'])
@Index('idx_user_name_search_en', ['firstNameEn', 'lastNameEn'])
@Index('idx_user_tel_search', ['countryCode', 'tel'])
export class User extends BaseEntity {
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  firstNameTh: string;

  @Column({ nullable: true })
  lastNameTh: string;

  @Column({ nullable: true })
  middleNameTh: string;

  @Column({ nullable: true })
  firstNameEn: string;

  @Column({ nullable: true })
  lastNameEn: string;

  @Column({ nullable: true })
  middleNameEn: string;

  @Transform((value) => {
    if (value && typeof value === 'string') {
      return bcrypt.hash(value, 8);
    }

    return value;
  })
  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  originalPassword: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserLocale,
    default: UserLocale.TH,
  })
  locale: UserLocale;

  @Column({
    type: 'enum',
    enum: UserInterfaceMode,
    default: UserInterfaceMode.LIGHT,
  })
  interfaceMode: UserInterfaceMode;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    nullable: true,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender: UserGender;

  @Column({
    type: 'enum',
    enum: OnBoardingStep,
    nullable: true,
  })
  onBoardingStep: OnBoardingStep;

  @Column({
    nullable: true,
  })
  birthDate: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  cisNumber: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  idCard: string;

  @Column({
    type: 'enum',
    enum: kycStatus,
    default: kycStatus.NONE,
    nullable: true,
  })
  kycStatus: kycStatus;

  @Column({
    type: 'enum',
    enum: MaritalStatus,
    default: null,
    nullable: true,
  })
  maritalStatus: MaritalStatus;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isSeller: boolean;

  @Column({
    nullable: true,
    type: 'enum',
    enum: RoleBusinessType,
    array: true,
    default: [],
  })
  businessType: RoleBusinessType[];

  @Column({ nullable: true })
  remarkKyc: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdInAuth: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  username: string;

  @Column({
    type: 'enum',
    enum: RegisterStatus,
    default: RegisterStatus.IN_PROGRESS,
    nullable: true,
  })
  registerStatus: RegisterStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  authRefreshToken: string;

  @Column({
    type: 'enum',
    enum: RegisterStep,
    default: RegisterStep.NONE_REGISTER,
  })
  registerStep: RegisterStep;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Merchant)
  @JoinTable()
  merchants: Merchant[];

  @OneToMany(() => Customer, (customers) => customers.user)
  customers: Customer[];

  @ManyToOne(() => ImageUpload, (imageUpload) => imageUpload.users)
  imageUpload: ImageUpload;

  @OneToMany(() => UserConsent, (userConsent) => userConsent.user)
  userConsents: UserConsent[];

  @OneToMany(() => UserAddress, (userAddress) => userAddress.user)
  userAddresses: UserAddress[];

  @OneToMany(
    () => UserOrganization,
    (userOrganization) => userOrganization.user,
  )
  userOrganizations: UserOrganization[];

  @OneToMany(
    () => OrganizationContact,
    (organizationContact) => organizationContact.user,
  )
  organizationContact: OrganizationContact[];

  @OneToMany(() => Order, (orders) => orders.user)
  orders: Order[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToOne(() => DraftUser, (draftUser) => draftUser.user)
  draftUser: DraftUser;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 8);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
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
