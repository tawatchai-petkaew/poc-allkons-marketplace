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
  OneToMany
} from 'typeorm';

import { Province } from './province.entity';
import { UserAddress } from './user-address.entity';
import { DraftUserAddress } from './draft-user-address.entity';

@Entity()
export class Country extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @OneToMany(() => Province, (provinces) => provinces.country)
  provinces: Province[];

  @OneToMany(() => UserAddress, (userAddresses) => userAddresses.country)
  userAddresses: UserAddress[];

  @OneToMany(() => DraftUserAddress, (draftUserAddresses) => draftUserAddresses.country)
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
