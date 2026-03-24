import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { District } from './district.entity';
import { Province } from './province.entity';
import { SubDistrict } from './sub-district.entity';
import { User } from './user.entity';

@Entity('location')
@Index('idx_location_user_id', ['userId'])
@Index('idx_location_is_default', ['isDefault'])
export class LocationEntity extends BaseEntity {
  constructor(partial: Partial<LocationEntity>) {
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

  @Column({ type: 'varchar', length: 255 })
  addressName: string;

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
}
