import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { Province } from './province.entity';
import { District } from './district.entity';
import { SubDistrict } from './sub-district.entity';
import { DraftUser } from './draft-user.entity';

export enum AddressTypeEnum {
  ID_CARD = 'ID_CARD',
  CURRENT = 'CURRENT',
  TAX_INVOICE = 'TAX_INVOICE',
}

@Entity()
@Index(['addressType', 'draftUserId'], { unique: true })
export class DraftUserAddress extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AddressTypeEnum,
  })
  addressType: AddressTypeEnum;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  provinceId: number;

  @Column({ nullable: true })
  districtId: number;

  @Column({ nullable: true })
  subDistrictId: number;

  @Column({
    type: 'enum',
    enum: AddressTypeEnum,
    default: null,
    nullable: true,
  })
  isSameAddress: AddressTypeEnum;

  @Column()
  draftUserId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => DraftUser, (draftUser) => draftUser.draftUserAddresses)
  @JoinColumn({ name: 'draftUserId' })
  draftUser: DraftUser;

  @ManyToOne(() => Country, (country) => country.draftUserAddresses)
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @ManyToOne(() => Province, (province) => province.draftUserAddresses)
  @JoinColumn({ name: 'provinceId' })
  province: Province;

  @ManyToOne(() => District, (district) => district.draftUserAddresses)
  @JoinColumn({ name: 'districtId' })
  district: District;

  @ManyToOne(() => SubDistrict, (subDistrict) => subDistrict.draftUserAddresses)
  @JoinColumn({ name: 'subDistrictId' })
  subDistrict: SubDistrict;

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
