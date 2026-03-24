import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLog } from '@/model/event-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventLog])],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
