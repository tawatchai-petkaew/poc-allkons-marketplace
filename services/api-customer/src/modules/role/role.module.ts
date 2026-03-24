import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from '../../model/roles.entity';
import { RolePermissions } from '../../model/role_permissions.entity';
import { UserOrganization } from '../../model/user-organization.entity';
import { Organization } from '../../model/organization.entity';
import { UserOrganizationModule } from '../user-organization/user-organization.module';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      RolePermissions,
      UserOrganization,
      Organization,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
    PermissionModule,
    UserOrganizationModule,
  ],
  controllers: [RoleController],
  providers: [RoleService, OrganizationPermissionGuard],
  exports: [RoleService],
})
export class RoleModule {}
