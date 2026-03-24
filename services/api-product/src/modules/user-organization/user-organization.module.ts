import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrganizationService } from './user-organization.service';
import { UserOrganization } from '@/model/user-organization.entity';
import { Role } from '@/model/roles.entity';
import { RolePermissions } from '@/model/role_permissions.entity';
import { Permission } from '@/model/permisstions.entity';
import { OrganizationLeaveLog } from '@/model/organization-leave-log.entity';
import { Invitation } from '@/model/invitation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrganization, Role, RolePermissions, Permission, OrganizationLeaveLog, Invitation]),
  ],
  providers: [UserOrganizationService],
  exports: [UserOrganizationService],
})
export class UserOrganizationModule {}
