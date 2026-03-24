import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StaticService } from './static.service';
import { StaticController } from './static.controller';
import { Country } from '../model/country.entity';
import { Province } from '../model/province.entity';
import { District } from '../model/district.entity';
import { SubDistrict } from '../model/sub-district.entity';
import { Bank } from '../model/bank.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country, Province, District, SubDistrict, Bank]),
  ],
  providers: [StaticService],
  controllers: [StaticController],
})
export class StaticModule {}
