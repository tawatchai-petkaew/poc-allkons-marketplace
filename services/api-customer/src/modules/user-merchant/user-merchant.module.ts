import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMerchant } from '../../model/user-merchant.entity';
import { User } from '../../model/user.entity';
import { Merchant } from '../../model/merchant.entity';
import { UserOrganization } from '../../model/user-organization.entity';
import { UserMerchantService } from './user-merchant.service';
import { CisModule } from '@/modules/cis/cis.module';
import { RoleModule } from '@/modules/role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserMerchant,
      User,
      Merchant,
      UserOrganization,
    ]),
    CisModule,
    RoleModule,
  ],
  providers: [UserMerchantService],
  exports: [UserMerchantService]
})
export class UserMerchantModule {}
