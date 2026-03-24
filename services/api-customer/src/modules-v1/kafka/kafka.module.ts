import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCustomerAddressEntity } from '@/model/user-customer-address.entity';
import { User } from '@/model/user.entity';
import { CisModule } from '../../modules/cis/cis.module';
import { BuyerAddressController } from '../buyer-address/buyer-address.controller';
import { BuyerAddressService } from '../buyer-address/buyer-address.service';
import { KafkaController } from './kafka.controller';
import { KafkaService } from './kafka.service';
import { OrganizationModule } from '../../modules/organization/organization.module';
import { SendVerifyStatusModule } from '../../modules/send-verify-status/send-verify-status.module';
import { Merchant } from '@/model/merchant.entity';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCustomerAddressEntity, User, Merchant]),
    CisModule,
    OrganizationModule,
    SendVerifyStatusModule,
    UserModule,
  ],
  controllers: [BuyerAddressController, KafkaController],
  providers: [BuyerAddressService, KafkaService],
})
export class KafkaModule {}
