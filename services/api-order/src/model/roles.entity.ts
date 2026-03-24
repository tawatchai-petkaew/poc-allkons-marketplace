import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrganization } from './user-organization.entity';
import { RolePermissions } from './role_permissions.entity';
import { Organization } from './organiztion.entity';
import { UserMerchant } from './user-merchant.entity';

@Entity('roles')
@Unique(['name', 'organizeId'])
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 50,
  })
  displayName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    nullable: true,
    comment: 'Organization ID that this role belongs to',
  })
  organizeId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    default: false,
    comment: 'Flag สำหรับเช็กว่าเป็นบทบาทโดยระบบ',
  })
  isDefault: boolean;

  @Column({
    default: false,
    comment: 'Flag สำหรับเช็กว่าต้องการ clone บทบาทนี้มั้ย',
  })
  isClone: boolean;

  @Column({
    nullable: true,
    type: 'smallint',
    comment: 'ค่าสำหรับแสดงลำดับความสำคัญของบทบาท',
  })
  priority: number;

  @OneToMany(
    () => UserOrganization,
    (userOrganization) => userOrganization.role,
  )
  userOrganizations: UserOrganization[];

  @OneToMany(() => RolePermissions, (rolePermissions) => rolePermissions.roles)
  rolePermissions: RolePermissions[];

  @OneToMany(() => Organization, (organization) => organization.roles)
  organizations: Organization[];

  @OneToMany(() => UserMerchant, (userMerchant) => userMerchant.role)
  userMerchants: UserMerchant[];

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
