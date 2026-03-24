import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Permission } from '../../model/permissions.entity';
import { OrganizationPermissionGuard } from '../../auth/guards/organization-permission.guard';
import { UserOrganization } from '../../model/user-organization.entity';
import { RolePermissions } from '../../model/role_permissions.entity';
import { Organization } from '../../model/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, UserOrganization, RolePermissions, Organization]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, OrganizationPermissionGuard],
  exports: [PermissionService],
})
export class PermissionModule {}
