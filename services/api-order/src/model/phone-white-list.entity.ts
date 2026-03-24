import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Organization } from './organiztion.entity';

@Entity('phone_white_list')
@Unique('UQ_phone_country_combination', ['phoneNumber', 'countryCode'])
@Index('IDX_phone_white_list_organization_id', ['organizationId'])
@Index('IDX_phone_white_list_phone_pattern', ['phoneNumber'])
@Index('IDX_phone_white_list_label_pattern', ['label'])
@Index('IDX_phone_white_list_is_active', ['isActive'])
@Index('IDX_phone_white_list_created_at', ['createdAt'])
@Index('IDX_phone_white_list_org_active_created', [
  'organizationId',
  'isActive',
  'createdAt',
])
@Index('IDX_phone_white_list_phone_country', ['phoneNumber', 'countryCode'])
export class PhoneWhiteList extends BaseEntity {
  constructor(partial: Partial<PhoneWhiteList>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: 'Organization ID',
  })
  organizationId: number;

  @Column({
    type: 'varchar',
    length: 20,
    comment: 'Phone number',
  })
  phoneNumber: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: 'Country code (e.g., +66)',
  })
  countryCode: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Label or description for this phone number',
  })
  label: string;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether this phone number is active',
  })
  isActive: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

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

  @ManyToOne(() => Organization, (organization) => organization.phoneWhiteList)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
