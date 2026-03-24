import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataService } from './master-data.service';
import { MasterDataController } from './master-data.controller';
import { MasterData } from '@/model/master-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MasterData])],
  controllers: [MasterDataController],
  providers: [MasterDataService],
  exports: [MasterDataService],
})
export class MasterDataModule {}
