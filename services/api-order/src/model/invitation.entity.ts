import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './roles.entity';
import { Organization } from './organiztion.entity';
import { UserOrganizationInviteStatus } from './enum/user-organization.enum';

@Entity('invitations')
@Index('idx_invitation_organize_status_created', [
  'organizeId',
  'status',
  'createdAt',
])
@Index('idx_invitation_phone_country', ['phoneNumber', 'countryCode'])
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  countryCode: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_invitation_ref_code')
  refCode: string;

  @Column({
    type: 'enum',
    enum: UserOrganizationInviteStatus,
    default: UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
  })
  status: UserOrganizationInviteStatus;

  @Column({ type: 'boolean', default: false })
  addInWhiteList: boolean;

  @Column({ type: 'json', nullable: true })
  merchantInfo: { merchantId: number; roleId: number }[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'int', nullable: true })
  invitedByUserId: number;

  @Column({ type: 'int', nullable: true })
  roleId: number;

  @Column({ type: 'int' })
  organizeId: number;

  @Column({ type: 'int', nullable: true })
  approverOrgId: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Store the date and time when the invitation approval occurred',
  })
  approvedAt?: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    comment: 'Delete date and time, to support soft delete',
  })
  deletedAt?: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invitedByUserId' })
  invitedByUser: User;

  @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizeId' })
  organization: Organization;

  @ManyToOne(() => Organization, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approverOrgId' })
  approverOrganization: Organization;

  /**
   * Check if invitation is expired
   */
  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if invitation can be accepted
   */
  get canBeAccepted(): boolean {
    return (
      this.status === UserOrganizationInviteStatus.WAIT_FOR_APPROVE &&
      !this.isExpired
    );
  }
}
