import { Module } from '@nestjs/common';
import { BuyerProjectService } from './buyer-project.service';
import { BuyerProjectController } from './buyer-project.controller';
import { Project } from '@/model/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [BuyerProjectController],
  providers: [BuyerProjectService],
})
export class BuyerProjectModule {}
