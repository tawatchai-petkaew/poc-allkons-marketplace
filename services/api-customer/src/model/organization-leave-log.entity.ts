import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn, ManyToOne, Index } from "typeorm/index.js";
import { User } from "./user.entity";
import { Organization } from "./organization.entity";
import { Role } from "./roles.entity";

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

@Entity('organization_leave_log')
@Index('idx_org_leave_log_user_org', ['userId', 'organizationId'])
@Index('idx_org_leave_log_org', ['organizationId'])
@Index('idx_org_leave_log_role', ['roleId'])
@Index('idx_org_leave_log_user', ['userId'])
export class OrganizationLeaveLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  organizationId: number;

  @Column()
  roleId: number;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING })
  leaveStatus: LeaveStatus;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;
}