import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RequestContextService } from './request-context.service';
import { User } from '@/model/user.entity';
import { Merchant } from '@/model/merchant.entity';
import { Customer } from '@/model/customer.entity';
import { Organization } from '@/model/organiztion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Merchant, Customer, Organization])],
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class RequestContextModule {}
