import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserGender } from './enum/user.enum';
import { DraftUserAddress } from './draft-user-address.entity';
import { User } from './user.entity';

// Local enum definition (was in deleted register module)
export enum RoleBusinessType {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
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
@Index(['userId'], { unique: true })
export class DraftUser extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  firstNameTh: string;

  @Column({ nullable: true })
  middleNameTh: string;

  @Column({ nullable: true })
  lastNameTh: string;

  @Column({ nullable: true })
  firstNameEn: string;

  @Column({ nullable: true })
  middleNameEn: string;

  @Column({ nullable: true })
  lastNameEn: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender: UserGender;

  @Column({
    type: 'enum',
    enum: MaritalStatus,
    default: null,
    nullable: true,
  })
  maritalStatus: MaritalStatus;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  idCard: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: RoleBusinessType,
    array: true,
    default: [],
  })
  businessType: RoleBusinessType[];

  @Column({
    type: 'enum',
    enum: kycStatus,
    default: kycStatus.NONE,
    nullable: true,
  })
  kycStatus: kycStatus;

  @Column('json', { nullable: true, comment: 'file info' })
  fileInfo: string;

  @Column()
  userId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.draftUser)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(
    () => DraftUserAddress,
    (draftUserAddress) => draftUserAddress.draftUser,
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
