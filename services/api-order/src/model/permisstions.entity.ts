import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolePermissions } from './role_permissions.entity';

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE',
  VIEW = 'VIEW',
}

export enum PermissionResource {
  ORGANIZATION = 'ORGANIZATION',
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  PRODUCT = 'PRODUCT',
  SHOP = 'SHOP',
  ORDER = 'ORDER',
  MEMBER = 'MEMBER',
  CREDIT = 'CREDIT',
  PROMOTION = 'PROMOTION',
}

export enum PermissionGroup {
  ORGANIZATION_INFO = 'ORGANIZATION_INFO',
  USER_ORGANIZATION = 'USER_ORGANIZATION',
  ROLE_PERMISSION = 'ROLE_PERMISSION',
  ORGANIZATION_PHONE = 'ORGANIZATION_PHONE',
  PAYMENT = 'PAYMENT',
  BANK_ACCOUNT_INFO = 'BANK_ACCOUNT_INFO',
  MERCHANT = 'MERCHANT',
  PROMOTION = 'PROMOTION',
  PROMPTPAY = 'PROMPTPAY',
}

@Entity('permissions')
@Index('idx_permissions_code', ['code'])
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
    type: 'varchar',
    length: 100,
    comment:
      'Unique code for the permission, used for identification in the system',
  })
  code: string;

  @Column({
    type: 'enum',
    enum: PermissionResource,
    default: null,
    nullable: true,
  })
  resource: PermissionResource;

  @Column({
    type: 'enum',
    enum: PermissionAction,
    default: null,
    nullable: true,
  })
  action: PermissionAction;

  @Column({ nullable: true })
  description: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 100,
    comment: 'description in Thai',
  })
  descriptionTh: string;

  @Column({
    nullable: true,
    default: null,
    type: 'enum',
    enum: PermissionGroup,
  })
  group: PermissionGroup;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 100,
    comment: 'group name in Thai',
  })
  groupNameTh: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => RolePermissions,
    (rolePermissions) => rolePermissions.permissions,
  )
  rolePermissions: RolePermissions[];

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
