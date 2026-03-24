import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Province } from './province.entity';
import { District } from './district.entity';
import { SubDistrict } from './sub-district.entity';
import { Project } from './project.entity';
import { Organization } from './organiztion.entity';
import { User } from './user.entity';

export enum AddressStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'inActive',
  DELETED = 'deleted',
}

export enum AddressTypeCis {
  SHIPPING_ADDRESS = 'SHIPPING_ADDRESS',
  WORK_SITE_ADDRESS = 'WORK_SITE_ADDRESS',
  TAX_INVOICE_ADDRESS = 'TAX_INVOICE_ADDRESS',
}

@Entity('user_customer_address')
export class UserCustomerAddressEntity extends BaseEntity {
  constructor(partial: Partial<Project>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  userId: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  organizeId: number;

  @Column({
    type: 'enum',
    enum: AddressTypeCis,
    enumName: 'user_customer_address_addresstype_enum',
  })
  addressType: AddressTypeCis;

  @Column({ type: 'varchar', length: 255 })
  contactName: string;

  @Column({ type: 'varchar', length: 10 })
  contactPhoneNumber: string;

  @Column({ type: 'int' })
  countryId: number;

  @Column({ type: 'int' })
  provinceId: number;

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'provinceId' })
  province: Province;

  @Column({ type: 'int' })
  districtId: number;

  @ManyToOne(() => District)
  @JoinColumn({ name: 'districtId' })
  district: District;

  @Column({ type: 'int' })
  subDistrictId: number;

  @ManyToOne(() => SubDistrict)
  @JoinColumn({ name: 'subDistrictId' })
  subDistrict: SubDistrict;

  @Column({ type: 'varchar', length: 255 })
  countryName: string;

  @Column({ type: 'varchar', length: 255 })
  provinceName: string;

  @Column({ type: 'varchar', length: 255 })
  districtName: string;

  @Column({ type: 'varchar', length: 255 })
  subDistrictName: string;

  @Column({ type: 'varchar', length: 20 })
  zipcodeName: string;

  @Column({ type: 'int', nullable: true, default: null })
  projectId: number;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 255 })
  addressName: string;

  @Column({ type: 'text' })
  addressInfo: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  latitude: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  longitude: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizeId' })
  organization: Organization;

  @Column({
    type: 'enum',
    enum: AddressStatus,
    default: AddressStatus.ACTIVE,
  })
  status: AddressStatus;

  @Column({ type: 'varchar', nullable: true })
  cisNumber: string;
}
