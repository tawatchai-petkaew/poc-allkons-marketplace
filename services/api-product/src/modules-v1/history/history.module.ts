import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistorySearchProductService } from './history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorySearchProduct } from '@/model/history-search-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistorySearchProduct])],
  controllers: [HistoryController],
  providers: [HistorySearchProductService],
})
export class HistoryModule {}
