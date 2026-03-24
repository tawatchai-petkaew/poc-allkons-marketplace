import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';

import { Customer } from '../../model/customer.entity';
import { CustomerAddress } from '../../model/customer-address.entity';
import { User } from '../../model/user.entity';
import { Cart } from '../../model/cart.entity';

import { UserModule } from '../user/user.module';
import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerAddress, User, Cart]),
    UserModule,
    RequestContextModule,
  ],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
