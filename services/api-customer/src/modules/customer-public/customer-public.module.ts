import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

import { CustomerPublicService } from './customer-public.service';
import { CustomerPublicController } from './customer-public.controller';

import { Customer } from '../../model/customer.entity';
import { Merchant } from '../../model/merchant.entity';
import { User } from '../../model/user.entity';
import { CustomerAddress } from '../../model/customer-address.entity';
import { Cart } from '../../model/cart.entity';
import { ImageUpload } from '../../model/image-upload.entity';

import { JwtStrategy } from '../../auth/jwt.strategy';
import { RequestContextModule } from '../request-context/request-context.module';
import { ImageUploadModule } from '../image-upload/image-upload.module';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Cart,
      Customer,
      Merchant,
      CustomerAddress,
      ImageUpload,
    ]),
    RequestContextModule,
    ImageUploadModule,
  ],
  providers: [CustomerPublicService, JwtStrategy],
  controllers: [CustomerPublicController],
})
export class CustomerPublicModule {}
