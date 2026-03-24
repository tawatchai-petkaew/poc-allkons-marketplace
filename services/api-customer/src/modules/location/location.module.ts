import { Country } from '@/model/country.entity';
import { District } from '@/model/district.entity';
import { LocationEntity } from '@/model/location.entity';
import { Province } from '@/model/province.entity';
import { SubDistrict } from '@/model/sub-district.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity,Country ,Province,District,SubDistrict])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
