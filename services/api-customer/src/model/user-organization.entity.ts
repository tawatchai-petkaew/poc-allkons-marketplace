import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { Role } from './roles.entity';
import { Cart } from './cart.entity';
import { UserOrganizationInviteStatus } from './enum/user-organization.enum';

@Entity()
@Index('idx_user_organization_organize_status', ['organizeId', 'memberStatus'])
@Index('idx_user_organization_user_id', ['userId'])
@Index('idx_user_organization_role_id', ['roleId'])
@Index('idx_user_organization_created_at', ['createdAt'])
@Index('idx_user_organization_user_organize', ['userId', 'organizeId'])
@Index('idx_user_organization_organize_created', ['organizeId', 'createdAt'])
@Index('idx_user_organization_organize_role', ['organizeId', 'roleId'])
export class UserOrganization extends BaseEntity {
  constructor(partial: Partial<UserOrganization>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
  })
  userId: number;

  @Column({
    type: 'int',
  })
  organizeId: number;

  @Column({
    type: 'int',
    comment: 'Role ID of the user in the organization',
    default: null,
  })
  roleId: number;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Indicates if the user is the owner of the organization',
  })
  isOwner: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Indicates if the user is the creator of the organization',
  })
  isCreator: boolean;

  @Column({
    type: 'enum',
    enum: UserOrganizationInviteStatus,
    default: UserOrganizationInviteStatus.NONE,
    comment: 'Status of user invitation to organization',
  })
  memberStatus: UserOrganizationInviteStatus;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizeId' })
  organization: Organization;

  @ManyToOne(() => Role, role => role.userOrganizations)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToMany(() => Cart, (cart) => cart.userOrganization)
  carts: Cart[];
}
