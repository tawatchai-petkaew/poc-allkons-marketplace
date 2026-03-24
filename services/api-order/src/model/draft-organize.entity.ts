import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organiztion.entity';

enum kycStatus {
  NONE = 'NONE',
  WAIT_FOR_APPROVE = 'WAIT_FOR_APPROVE',
  REQUEST_MORE = 'REQUEST_MORE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum OrganizationType {
  PERSONAL = 'PERSONAL',
  JURISTIC = 'JURISTIC',
  REGISTERED_INDIVIDUAL = 'REGISTERED_INDIVIDUAL',
}

@Entity('draft_organize')
@Index(['organizeId'])
@Entity('draft_organize')
@Index('IDX_draft_organize_organize_id', ['organizeId'])
export class DraftOrganize extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrganizationType,
    nullable: false,
    default: OrganizationType.PERSONAL,
    comment: 'organization type is PERSONAL , JURISTIC , PERSONAL COMMERCE',
  })
  organizationType: OrganizationType;

  @Column('json', { nullable: true, comment: 'organization info' })
  orgInfo: string;

  @Column('json', { nullable: true, comment: 'congtact info' })
  contactInfo: string;

  @Column('json', { nullable: true, comment: 'address info' })
  addressInfo: string;

  @Column('json', { nullable: true, comment: 'file info' })
  fileInfo: string;

  @Column({ type: 'int', nullable: true })
  organizeId: number;

  @Column({
    type: 'enum',
    enum: kycStatus,
    default: kycStatus.NONE,
    nullable: true,
  })
  kycStatus: kycStatus;

  @Column({ default: false })
  isError: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations
  @OneToOne(() => Organization)
  @JoinColumn({ name: 'organizeId' })
  organization: Organization;

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
