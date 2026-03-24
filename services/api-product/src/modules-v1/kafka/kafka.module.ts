import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCustomerAddressEntity } from '@/model/user-customer-address.entity';
import { User } from '@/model/user.entity';
import { KafkaController } from './kafka.controller';
import { KafkaService } from './kafka.service';
import { Merchant } from '@/model/merchant.entity';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCustomerAddressEntity, User, Merchant]),
    UserModule,
  ],
  controllers: [KafkaController],
  providers: [KafkaService],
})
export class KafkaModule {}
