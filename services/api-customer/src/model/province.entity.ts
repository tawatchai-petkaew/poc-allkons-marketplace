import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  Index,
} from 'typeorm';

import { Country } from './country.entity';
import { District } from './district.entity';
import { UserAddress } from './user-address.entity';
import { DraftUserAddress } from './draft-user-address.entity';

@Entity()
@Index('IDX_province_name_th_pattern', ['name_th'])
export class Province extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_th: string;

  @Column()
  name_en: string;

  @Column()
  code: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => Country, (country) => country.provinces)
  country: Country;

  @OneToMany(() => District, (districts) => districts.province)
  districts: District[];

  @OneToMany(() => UserAddress, (userAddresses) => userAddresses.province)
  userAddresses: UserAddress[];

  @OneToMany(
    () => DraftUserAddress,
    (draftUserAddresses) => draftUserAddresses.province,
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
