import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';

import { District } from './district.entity';
import { UserAddress } from './user-address.entity';
import { DraftUserAddress } from './draft-user-address.entity';

@Entity()
@Index('IDX_sub_district_name_th_pattern', ['name_th'])
@Index('IDX_sub_district_zip_code', ['zip_code'])
@Index('IDX_sub_district_zip_pattern', ['zip_code'])
@Index('IDX_sub_district_district_id', ['districtId'])
@Index('IDX_sub_district_district_zip', ['districtId', 'zip_code']) 
export class SubDistrict extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_th: string;

  @Column()
  name_en: string;

  @Column()
  zip_code: string;

  @Column({ nullable: true, default: null })
  code: string;

  @Column({ nullable: true, default: null })
  zipCodeId: string;

  @Column({ nullable: true })
  districtId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => District, (district) => district.subDistricts)
  @JoinColumn({ name: 'districtId' })
  district: District;

  @OneToMany(() => UserAddress, (userAddresses) => userAddresses.subDistrict)
  userAddresses: UserAddress[];

  @OneToMany(
    () => DraftUserAddress,
    (draftUserAddresses) => draftUserAddresses.subDistrict,
  )
  draftUserAddresses: DraftUserAddress[];

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
