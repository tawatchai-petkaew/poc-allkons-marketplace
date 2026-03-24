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

import { Province } from './province.entity';
import { SubDistrict } from './sub-district.entity';
import { UserAddress } from './user-address.entity';
import { DraftUserAddress } from './draft-user-address.entity';

@Entity()
@Index('IDX_district_name_th_pattern', ['name_th'])
@Index('IDX_district_province_id', ['provinceId'])
export class District extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_th: string;

  @Column()
  name_en: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  provinceId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => Province, (province) => province.districts)
  @JoinColumn({ name: 'provinceId' })
  province: Province;

  @OneToMany(() => SubDistrict, (subDistricts) => subDistricts.district)
  subDistricts: SubDistrict[];

  @OneToMany(() => UserAddress, (userAddresses) => userAddresses.district)
  userAddresses: UserAddress[];

  @OneToMany(
    () => DraftUserAddress,
    (draftUserAddresses) => draftUserAddresses.district,
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
