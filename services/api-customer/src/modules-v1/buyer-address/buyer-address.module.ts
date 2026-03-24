import { Module } from '@nestjs/common';
import { BuyerAddressService } from './buyer-address.service';
import { BuyerAddressController } from './buyer-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCustomerAddressEntity } from '@/model/user-customer-address.entity';
import { KafkaController } from '../kafka/kafka.controller';
import { KafkaService } from '../kafka/kafka.service';
import { User } from '@/model/user.entity';
import { CisModule } from '@/modules/cis/cis.module';
import { OrganizationModule } from '@/modules/organization/organization.module';
import { SendVerifyStatusModule } from '@/modules/send-verify-status/send-verify-status.module';
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
export class BuyerAddressModule {}
