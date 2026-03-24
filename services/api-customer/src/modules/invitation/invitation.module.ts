import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { Invitation } from '@/model/invitation.entity';
import { User } from '@/model/user.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { UserMerchant } from '@/model/user-merchant.entity';
import { PhoneWhiteList } from '@/model/phone-white-list.entity';
import { Merchant } from '@/model/merchant.entity';
import { Role } from '@/model/roles.entity';
import { Organization } from '@/model/organization.entity';
import { CisModule } from '@/modules/cis/cis.module';
import { BullModule } from '@nestjs/bull';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { JuristicType } from '@/model/juristic-type.entity';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { OrganizationModule } from '@/modules/organization/organization.module';
import { PermissionModule } from '@/modules/permission/permission.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    CisModule,
    PermissionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'invite-member-consumer',
    }),
    BullBoardModule.forFeature({
      name: 'invite-member-consumer',
      adapter: BullAdapter,
    }),
    TypeOrmModule.forFeature([
      Invitation,
      User,
      UserOrganization,
      UserMerchant,
      PhoneWhiteList,
      Merchant,
      Organization,
      JuristicType,
    ]),
    forwardRef(() => OrganizationModule),
    RoleModule,
  ],
  controllers: [InvitationController],
  providers: [
    InvitationService,
    OrganizationPermissionGuard,
  ],
  exports: [InvitationService],
})
export class InvitationModule {}
