import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneWhiteList } from '@/model/phone-white-list.entity';
import { PhoneWhiteListService } from './phone-white-list.service';
import { Organization } from '@/model/organization.entity';
import { User } from '@/model';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneWhiteList, Organization, User])],
  providers: [PhoneWhiteListService],
  exports: [PhoneWhiteListService],
})
export class PhoneWhiteListModule {}
