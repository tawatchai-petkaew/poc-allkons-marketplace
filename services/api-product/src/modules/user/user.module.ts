import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { UserService } from './user.service';
import { User } from '../../model/user.entity';
import { Merchant } from '../../model/merchant.entity';
import { Customer } from '@/model';
import { ImageUpload } from '@/model/image-upload.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, ImageUpload, User, Merchant]),
    ConfigModule,
  ],
  providers: [UserService],
  controllers: [],
  exports: [UserService],
})
export class UserModule {}
