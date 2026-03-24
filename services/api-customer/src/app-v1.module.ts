import { Module } from '@nestjs/common';
import { BuyerAddressModule } from './modules-v1/buyer-address/buyer-address.module';
import { BuyerProjectModule } from './modules-v1/buyer-project/buyer-project.module';
import { KafkaModule } from './modules-v1/kafka/kafka.module';
import { S3Module } from './modules-v1/s3/s3.module';
import { AuthModule } from './modules-v1/auth/auth.module';
import { UserModule } from './modules-v1/user/user.module';
import { MerchantModule } from './modules-v1/merchant/merchant.module';
@Module({
  imports: [
    AuthModule,
    UserModule,
    MerchantModule,
    KafkaModule,
    BuyerProjectModule,
    BuyerAddressModule,
    S3Module,
  ],
  controllers: [],
  providers: [],
})
export class AppV1Module {}
