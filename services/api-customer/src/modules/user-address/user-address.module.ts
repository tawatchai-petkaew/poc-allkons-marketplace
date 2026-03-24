import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from '../../model/user-address.entity';
import { UserAddressService } from './user-address.service';
import { Country } from '@/model/country.entity';
import { Province } from '@/model/province.entity';
import { District } from '@/model/district.entity';
import { SubDistrict } from '@/model/sub-district.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAddress, Country, Province, District, SubDistrict])],
  providers: [UserAddressService],
  exports: [UserAddressService],
})
export class UserAddressModule {}
