import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Country } from './country.entity';
import { Province } from './province.entity';
import { SubDistrict } from './sub-district.entity';
import { District } from './district.entity';
import { Organization } from './organiztion.entity';
import { Store } from './store.entity';
import { Merchant } from './merchant.entity';

export enum AddressTypeEnum {
  ID_CARD = 'ID_CARD',
  CURRENT = 'CURRENT',
  TAX_INVOICE = 'TAX_INVOICE',
}

@Entity()
export class UserAddress extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  organizationId: number;

  @Column({
    type: 'enum',
    enum: AddressTypeEnum,
    default: null,
    nullable: true,
  })
  addressType: AddressTypeEnum;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  provinceId: number;

  @Column({ nullable: true })
  districtId: number;

  @Column({ nullable: true })
  subDistrictId: number;

  @Column({ nullable: true })
  cisNumber: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: AddressTypeEnum,
    default: null,
  })
  usedAddress: AddressTypeEnum;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: false })
  isKycDocument: boolean;

  @Column({ type: 'int', nullable: true })
  organizeBranchId: number;

  @Column({ type: 'int', nullable: true })
  storeId: number;

  @Column({ type: 'int', nullable: true })
  merchantId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.userAddresses, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Organization, (organization) => organization.userAddresses, {
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @ManyToOne(() => Country, (country) => country.userAddresses, {
    onDelete: 'SET NULL',
  })
  country: Country;

  @ManyToOne(() => Province, (province) => province.userAddresses, {
    onDelete: 'SET NULL',
  })
  province: Province;

  @ManyToOne(() => District, (district) => district.userAddresses, {
    onDelete: 'SET NULL',
  })
  district: District;

  @ManyToOne(() => SubDistrict, (subDistrict) => subDistrict.userAddresses, {
    onDelete: 'SET NULL',
  })
  subDistrict: SubDistrict;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchantId' })
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
