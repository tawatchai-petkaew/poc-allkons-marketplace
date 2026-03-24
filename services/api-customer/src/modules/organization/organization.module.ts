import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { DraftOrganize } from '@/model/draft-organize.entity';
import { JuristicType } from '@/model/juristic-type.entity';
import { OrganizationLeaveLog } from '@/model/organization-leave-log.entity';
import { Organization } from '@/model/organization.entity';
import { Store } from '@/model/store.entity';
import { UserIdentityDocument } from '@/model/user-identity-document.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { InvitationModule } from '@/modules/invitation/invitation.module';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CisModule } from '../cis/cis.module';
import { CommonModule } from '../common/common.module';
import { DbdModule } from '../dbd/dbd.module';
import { MerchantModule } from '../merchant/merchant.module';
import { PermissionModule } from '../permission/permission.module';
import { PhoneWhiteListModule } from '../phone-white-list/phone-white-list.module';
import { RoleModule } from '../role/role.module';
import { StoreModule } from '../store/store.module';
import { UserAddressModule } from '../user-address/user-address.module';
import { UserOrganizationModule } from '../user-organization/user-organization.module';
import { UserModule } from '../user/user.module';
import { ApproveMemberConsumer } from './approve-member.consumer';
import { InviteMemberConsumer } from './invite-member.consumer';
import { OrganizationConsumer } from './organization.consumer';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { User } from '@/model';
import { UserMerchant } from '@/model/user-merchant.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      JuristicType,
      DraftOrganize,
      UserIdentityDocument,
      UserOrganization,
      OrganizationLeaveLog,
      Store,
      User,
      UserMerchant,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
    UserAddressModule,
    forwardRef(() => UserModule),
    CisModule,
    DbdModule,
    UserOrganizationModule,
    PhoneWhiteListModule,
    CommonModule,
    InvitationModule,
    BullModule.registerQueue({
      name: 'organization-consumer',
    }),
    BullBoardModule.forFeature({
      name: 'organization-consumer',
      adapter: BullAdapter,
    }),
    BullModule.registerQueue({
      name: 'invite-member-consumer',
    }),
    BullBoardModule.forFeature({
      name: 'invite-member-consumer',
      adapter: BullAdapter,
    }),
    BullModule.registerQueue({
      name: 'approve-member-consumer',
    }),
    BullBoardModule.forFeature({
      name: 'approve-member-consumer',
      adapter: BullAdapter,
    }),
    RoleModule,
    UserOrganizationModule,
    PermissionModule,
    MerchantModule,
    StoreModule,
  ],
  providers: [
    OrganizationService,
    OrganizationPermissionGuard,
    OrganizationConsumer,
    InviteMemberConsumer,
    ApproveMemberConsumer,
  ],
  exports: [OrganizationService, OrganizationPermissionGuard],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
